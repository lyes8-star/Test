#!/usr/bin/env node
/**
 * Evidence-based unit smoke (no browser).
 * Usage: node scripts/test-audit-http.cjs
 */
const assert = require("assert");

function parseJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let valid = 0;
  let invalid = 0;
  for (const b of blocks) {
    try {
      JSON.parse(b[1].trim());
      valid++;
    } catch {
      invalid++;
    }
  }
  return { valid, invalid };
}

function titleLength(html) {
  const t = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
  return t ? t.length : 0;
}

function headerScore(headers) {
  const need = ["strict-transport-security", "content-security-policy", "x-content-type-options", "referrer-policy"];
  return need.filter((h) => headers[h]).length;
}

/** CWV score mapping mirrors src/lib/audit/standards.ts */
function cwvScore100(cwv) {
  const GOOD = { lcpMs: 2500, cls: 0.1, inpMs: 200 };
  const parts = [];
  const ratio = (value, good) => Math.max(0, Math.min(100, 100 - ((value - good) / good) * 50));
  if (cwv.lcpMs != null) parts.push(cwv.lcpMs <= GOOD.lcpMs ? 100 : ratio(cwv.lcpMs, GOOD.lcpMs));
  if (cwv.cls != null) parts.push(cwv.cls <= GOOD.cls ? 100 : ratio(cwv.cls, GOOD.cls));
  if (cwv.inpMs != null) parts.push(cwv.inpMs <= GOOD.inpMs ? 100 : ratio(cwv.inpMs, GOOD.inpMs));
  if (!parts.length) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

const badHtml = `<!doctype html><html><head><title>x</title>
<script type="application/ld+json">{broken</script>
<script src="https://www.googletagmanager.com/gtm.js"></script>
</head><body><h1>a</h1><h1>b</h1></body></html>`;

const goodHtml = `<!doctype html><html lang="fr"><head>
<title>Crevia — Valorisation Google SEO SEA</title>
<meta name="description" content="Agence française PWA SEO SEA Google Ads pour convertir et être trouvé." />
<link rel="canonical" href="https://example.com/" />
<meta property="og:title" content="Crevia" />
<meta property="og:image" content="https://example.com/og.jpg" />
<script type="application/ld+json">{"@type":"Organization","name":"Crevia"}</script>
</head><body>
<a href="/mentions-legales">Mentions légales</a>
<a href="/politique-confidentialite">Politique de confidentialité</a>
<h1>Accueil</h1>
</body></html>`;

const ldBad = parseJsonLd(badHtml);
assert.strictEqual(ldBad.invalid, 1);
assert.strictEqual(ldBad.valid, 0);

const ldGood = parseJsonLd(goodHtml);
assert.strictEqual(ldGood.invalid, 0);
assert.strictEqual(ldGood.valid, 1);

assert.ok(titleLength(badHtml) < 15);
assert.ok(titleLength(goodHtml) >= 15 && titleLength(goodHtml) <= 65);

assert.strictEqual(headerScore({}), 0);
assert.strictEqual(
  headerScore({
    "strict-transport-security": "max-age=1",
    "content-security-policy": "default-src 'self'",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
  }),
  4,
);

const goodCwv = cwvScore100({ lcpMs: 1800, cls: 0.05, inpMs: 120 });
assert.strictEqual(goodCwv, 100);
const badCwv = cwvScore100({ lcpMs: 5000, cls: 0.25, inpMs: 400 });
assert.ok(badCwv < 80);

console.log("test-audit-http: OK (JSON-LD, title, headers, CWV mapping)");
