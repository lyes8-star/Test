#!/usr/bin/env node
/**
 * Unit smoke for HTTP/RGPD heuristics (no browser).
 * Usage: node scripts/test-audit-http.cjs
 */
const assert = require("assert");

function analyzeHtml(html) {
  const findings = [];
  if (!/rel=["']canonical["']/i.test(html)) findings.push("canonical");
  if (!/politique[- ]?de[- ]?confidentialit|\/confidentialite/i.test(html)) findings.push("privacy");
  if (!/mentions[- ]?l[eé]gales|\/mentions/i.test(html)) findings.push("mentions");
  if (!/consent|cookie.?banner|rgpd|tout accepter/i.test(html)) findings.push("consent");
  if (/gtag\(|googletagmanager/i.test(html) && !/consent|rgpd|cookie/i.test(html)) {
    findings.push("trackers-without-consent");
  }
  return findings;
}

const bad = `<!doctype html><html><head><title>x</title>
<script src="https://www.googletagmanager.com/gtag/js"></script>
</head><body>Hello</body></html>`;

const good = `<!doctype html><html><head>
<title>Meridian — SEO</title>
<link rel="canonical" href="https://example.com/" />
<meta name="description" content="Agence" />
</head><body>
<a href="/mentions-legales">Mentions légales</a>
<a href="/politique-confidentialite">Politique de confidentialité</a>
<div id="cookies"><button>Tout accepter</button><button>Refuser</button></div>
</body></html>`;

const badFindings = analyzeHtml(bad);
assert.ok(badFindings.includes("canonical"));
assert.ok(badFindings.includes("privacy"));
assert.ok(badFindings.includes("mentions"));
assert.ok(badFindings.includes("consent"));
assert.ok(badFindings.includes("trackers-without-consent"));

const goodFindings = analyzeHtml(good);
assert.deepStrictEqual(goodFindings, []);

console.log("test-audit-http: OK");
