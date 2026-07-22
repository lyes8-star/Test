#!/usr/bin/env node
/**
 * Audit Lighthouse local — usage: npm run audit:lighthouse
 * Prérequis: serveur sur PORT (défaut 3456), Chrome installé.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || "3456";
const url = process.env.AUDIT_URL || `http://127.0.0.1:${port}/`;
const outDir = path.join(process.cwd(), "audits");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "lighthouse-mobile.json");

const chrome =
  process.env.CHROME_PATH ||
  ["google-chrome", "chrome", "chromium"].map((b) => {
    const r = spawnSync("which", [b], { encoding: "utf8" });
    return r.status === 0 ? r.stdout.trim() : null;
  }).find(Boolean);

const args = [
  "lighthouse",
  url,
  "--only-categories=performance,accessibility,best-practices,seo",
  "--form-factor=mobile",
  "--screenEmulation.mobile=true",
  `--chrome-flags=--headless --no-sandbox --disable-gpu`,
  "--output=json",
  `--output-path=${out}`,
  "--quiet",
];

const env = { ...process.env };
if (chrome) env.CHROME_PATH = chrome;

console.log("Auditing", url);
const res = spawnSync("npx", args, { stdio: "inherit", env });
if (res.status !== 0) process.exit(res.status || 1);

const report = JSON.parse(fs.readFileSync(out, "utf8"));
console.log("\nScores:");
for (const [k, v] of Object.entries(report.categories)) {
  console.log(`  ${k}: ${Math.round(v.score * 100)}`);
}
console.log(`\nRapport: ${out}`);
