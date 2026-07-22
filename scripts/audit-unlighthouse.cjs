#!/usr/bin/env node
/**
 * Unlighthouse CI léger — crawl multi-pages (équivalent Unlighthouse dashboard)
 * Fallback: audit:sitewide si Unlighthouse échoue.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || "3456";
const site = process.env.AUDIT_SITE || `http://127.0.0.1:${port}`;
const outDir = path.join(process.cwd(), "audits", "unlighthouse");
fs.mkdirSync(outDir, { recursive: true });

const chrome =
  process.env.CHROME_PATH ||
  ["google-chrome", "chrome", "chromium"]
    .map((b) => {
      const r = spawnSync("which", [b], { encoding: "utf8" });
      return r.status === 0 ? r.stdout.trim() : null;
    })
    .find(Boolean);

console.log("Unlighthouse CI →", site);
const args = [
  "--yes",
  "unlighthouse-ci",
  "--site",
  site,
  "--urls",
  "/,/mentions-legales,/politique-confidentialite,/politique-cookies",
  "--output-path",
  outDir,
  "--reporter",
  "jsonExpanded",
  "--samples",
  "1",
  "--throttle",
  "false",
  "--lighthouse.device.type",
  "mobile",
];

const env = { ...process.env };
if (chrome) {
  env.CHROME_PATH = chrome;
  env.PUPPETEER_EXECUTABLE_PATH = chrome;
}

const res = spawnSync("npx", args, { stdio: "inherit", env, timeout: 300000 });
if (res.status === 0) {
  console.log("Unlighthouse OK →", outDir);
  process.exit(0);
}

console.warn("Unlighthouse failed — fallback to audit:sitewide");
const fb = spawnSync("npm", ["run", "audit:sitewide"], { stdio: "inherit", env });
fs.writeFileSync(
  path.join(outDir, "fallback.json"),
  JSON.stringify(
    {
      ok: fb.status === 0,
      reason: "unlighthouse-ci failed or timed out; used lighthouse sitewide",
      at: new Date().toISOString(),
    },
    null,
    2,
  ),
);
process.exit(fb.status === 0 ? 0 : 1);
