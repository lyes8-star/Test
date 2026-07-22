#!/usr/bin/env node
/** Axe WCAG via Puppeteer + axe-core (évite le bug de chemin du CLI) */
const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");
const req = createRequire(path.join(process.cwd(), "package.json"));

const port = process.env.PORT || "3456";
const urls = (process.env.AUDIT_URLS || "/,/mentions-legales,/politique-confidentialite,/politique-cookies").split(",");
const outDir = path.join(process.cwd(), "audits");
fs.mkdirSync(outDir, { recursive: true });

const chrome =
  process.env.CHROME_PATH ||
  process.env.CHROME_TEST_PATH ||
  "/usr/local/bin/google-chrome";

(async () => {
  let puppeteer;
  let axeSource;
  try {
    puppeteer = req("puppeteer-core");
  } catch {
    console.error("Install puppeteer-core: npm i -D puppeteer-core");
    process.exit(1);
  }
  try {
    axeSource = fs.readFileSync(req.resolve("axe-core/axe.min.js"), "utf8");
  } catch {
    console.error("Install axe-core: npm i -D axe-core");
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  let failed = false;
  const summary = [];
  for (const u of urls) {
    const name = u.replace(/^\//, "").replace(/\.html$/, "") || "home";
    const page = await browser.newPage();
    const url = `http://127.0.0.1:${port}${u}`;
    console.log("Axe", url);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await page.addScriptTag({ content: axeSource });
    const results = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      return axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
    });
    const out = path.join(outDir, `axe-${name}.json`);
    fs.writeFileSync(out, JSON.stringify(results, null, 2));
    console.log(`  violations: ${results.violations.length} (saved ${out})`);
    if (results.violations.length) {
      failed = true;
      results.violations.forEach((v) => console.log("   -", v.id, v.help));
    }
    summary.push({ url: u, violations: results.violations.length });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, "axe-summary.json"), JSON.stringify(summary, null, 2));
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
