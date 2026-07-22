#!/usr/bin/env node
/**
 * Core Web Vitals lab metrics — mobile + desktop (équivalent PageSpeed / web.dev local)
 * Usage: npm run audit:cwv  (serveur sur PORT, défaut 3456)
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || "3456";
const url = process.env.AUDIT_URL || `http://127.0.0.1:${port}/`;
const outDir = path.join(process.cwd(), "audits");
fs.mkdirSync(outDir, { recursive: true });

const chrome =
  process.env.CHROME_PATH ||
  ["google-chrome", "chrome", "chromium"]
    .map((b) => {
      const r = spawnSync("which", [b], { encoding: "utf8" });
      return r.status === 0 ? r.stdout.trim() : null;
    })
    .find(Boolean);

function runLighthouse(formFactor) {
  const out = path.join(outDir, `cwv-${formFactor}.json`);
  const args = [
    "lighthouse",
    url,
    "--only-categories=performance",
    `--form-factor=${formFactor}`,
    formFactor === "mobile"
      ? "--screenEmulation.mobile=true"
      : "--screenEmulation.mobile=false",
    "--chrome-flags=--headless --no-sandbox --disable-gpu",
    "--output=json",
    `--output-path=${out}`,
    "--quiet",
  ];
  const env = { ...process.env };
  if (chrome) env.CHROME_PATH = chrome;
  console.log(`Lighthouse ${formFactor}:`, url);
  const res = spawnSync("npx", args, { stdio: "inherit", env });
  if (res.status !== 0) throw new Error(`Lighthouse ${formFactor} failed`);
  return JSON.parse(fs.readFileSync(out, "utf8"));
}

function extract(report) {
  const a = report.audits;
  const num = (id) => (a[id] && typeof a[id].numericValue === "number" ? a[id].numericValue : null);
  const display = (id) => (a[id] && a[id].displayValue) || null;
  return {
    performanceScore: Math.round((report.categories.performance?.score || 0) * 100),
    FCP_ms: num("first-contentful-paint"),
    LCP_ms: num("largest-contentful-paint"),
    TBT_ms: num("total-blocking-time"),
    CLS: num("cumulative-layout-shift"),
    SI_ms: num("speed-index"),
    FCP: display("first-contentful-paint"),
    LCP: display("largest-contentful-paint"),
    TBT: display("total-blocking-time"),
    CLS_display: display("cumulative-layout-shift"),
  };
}

function passThresholds(m, formFactor) {
  const perfMin = formFactor === "desktop" ? 90 : 95;
  return {
    performance: m.performanceScore >= perfMin,
    LCP: m.LCP_ms != null && m.LCP_ms < 2500,
    CLS: m.CLS != null && m.CLS < 0.1,
    TBT: m.TBT_ms != null && m.TBT_ms < 300,
  };
}

const mobile = extract(runLighthouse("mobile"));
const desktop = extract(runLighthouse("desktop"));
const summary = {
  generatedAt: new Date().toISOString(),
  url,
  note: "Lab metrics (Lighthouse). Field INP unavailable without CrUX/PageSpeed API key. Desktop perf gate ≥90 (courbe lab plus stricte); mobile ≥95.",
  mobile: { ...mobile, thresholds: passThresholds(mobile, "mobile") },
  desktop: { ...desktop, thresholds: passThresholds(desktop, "desktop") },
};

fs.writeFileSync(path.join(outDir, "cwv-summary.json"), JSON.stringify(summary, null, 2));
console.log("\nCWV summary:\n", JSON.stringify(summary, null, 2));

const ok =
  Object.values(summary.mobile.thresholds).every(Boolean) &&
  Object.values(summary.desktop.thresholds).every(Boolean);
process.exit(ok ? 0 : 1);
