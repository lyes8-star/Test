#!/usr/bin/env node
/** Validate Open Graph + Twitter + JSON-LD on static pages */
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || "3456";
const urls = (process.env.AUDIT_URLS || "/,/mentions-legales,/politique-confidentialite,/politique-cookies").split(",");
const requiredOg = ["og:title", "og:description", "og:image", "og:url", "og:type"];
const requiredTw = ["twitter:card", "twitter:title", "twitter:description"];

function get(pathname, redirects = 0) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}${pathname}`, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
          const loc = res.headers.location.replace(`http://127.0.0.1:${port}`, "");
          return resolve(get(loc, redirects + 1));
        }
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve({ status: res.statusCode, html: d, path: pathname }));
      })
      .on("error", reject);
  });
}

function metas(html) {
  const out = {};
  const re = /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']*)["'][^>]*>/gi;
  const re2 = /<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html))) out[m[1]] = m[2];
  while ((m = re2.exec(html))) out[m[2]] = m[1];
  const can = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const title = html.match(/<title>([^<]*)<\/title>/i);
  const desc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  return { out, canonical: can && can[1], title: title && title[1], description: !!(desc && desc[1]) };
}

(async () => {
  const report = [];
  let failed = false;
  for (const u of urls) {
    const { status, html } = await get(u);
    const { out, canonical, title, description } = metas(html);
    const missingOg = requiredOg.filter((k) => !out[k]);
    const missingTw = requiredTw.filter((k) => !out[k]);
    let schemaOk = true;
    let schemaErr = null;
    let schemaTypes = [];
    const ld = html.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
    if (ld) {
      try {
        const data = JSON.parse(ld[1]);
        const nodes = data["@graph"] || [data];
        schemaTypes = nodes.map((n) => n["@type"]).flat();
      } catch (e) {
        schemaOk = false;
        schemaErr = String(e);
      }
    } else {
      schemaOk = false;
      schemaErr = "no JSON-LD";
    }
    const ok =
      status === 200 &&
      title &&
      description &&
      canonical &&
      missingOg.length === 0 &&
      missingTw.length === 0 &&
      schemaOk;
    if (!ok) failed = true;
    report.push({ u, status, title, description, canonical, missingOg, missingTw, schemaOk, schemaErr, schemaTypes, ok });
    console.log(ok ? "OK " : "FAIL", u, schemaTypes.join(",") || "-");
  }
  const outDir = path.join(process.cwd(), "audits");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "og-schema-report.json"), JSON.stringify(report, null, 2));
  process.exit(failed ? 1 : 0);
})();
