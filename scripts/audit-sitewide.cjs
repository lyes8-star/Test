#!/usr/bin/env node
/** Multi-page Lighthouse (équivalent Unlighthouse / PageSpeed local) */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || "3456";
const urls = (process.env.AUDIT_URLS || "/,/mentions-legales,/politique-confidentialite,/politique-cookies").split(",");
const outDir = path.join(process.cwd(), "audits", "sitewide");
fs.mkdirSync(outDir, { recursive: true });

const chrome =
  process.env.CHROME_PATH ||
  ["google-chrome", "chrome", "chromium"]
    .map((b) => {
      const r = spawnSync("which", [b], { encoding: "utf8" });
      return r.status === 0 ? r.stdout.trim() : null;
    })
    .find(Boolean);

const summary = [];
let failed = false;
for (const u of urls) {
  const name = (u.replace(/^\//, "").replace(/\.html$/, "") || "home").replace(/\W+/g, "_");
  const out = path.join(outDir, `${name}.json`);
  console.log("Lighthouse", u);
  const args = [
    "lighthouse",
    `http://127.0.0.1:${port}${u}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--form-factor=mobile",
    "--screenEmulation.mobile=true",
    "--chrome-flags=--headless --no-sandbox --disable-gpu",
    "--output=json",
    `--output-path=${out}`,
    "--quiet",
  ];
  const env = { ...process.env };
  if (chrome) env.CHROME_PATH = chrome;
  const res = spawnSync("npx", args, { stdio: "inherit", env });
  if (res.status !== 0) {
    failed = true;
    continue;
  }
  const report = JSON.parse(fs.readFileSync(out, "utf8"));
  const scores = Object.fromEntries(
    Object.entries(report.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
  );
  summary.push({ url: u, scores });
  console.log(" ", scores);
  if (Object.values(scores).some((s) => s < 90)) failed = true;
}

fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log("\nSummary:", JSON.stringify(summary, null, 2));
process.exit(failed ? 1 : 0);
