import { runHttpChecks } from "@/lib/audit/httpChecks";
import { runBrowserChecks } from "@/lib/audit/browserChecks";
import { assertPublicHttpUrl } from "@/lib/audit/ssrf";
import { cwvScore100 } from "@/lib/audit/standards";
import {
  PILLAR_LABELS,
  STANDARD_URLS,
  type AuditFinding,
  type AuditPillar,
  type PillarScore,
  type SiteAuditReport,
} from "@/lib/audit/types";

const PILLAR_WEIGHTS: Record<AuditPillar, number> = {
  performance: 1.4,
  seo: 1.3,
  a11y: 1.3,
  pwa: 1.1,
  rgpd: 1.0,
  google_sea: 0.8,
  legal_fr: 0.7,
};

/** Cap deductions for non-LH pillars (heuristics / legal follow). */
function cappedFindingScore(findings: AuditFinding[], cap = 30): number {
  let deduct = 0;
  for (const f of findings) {
    if (f.informational) continue;
    if (f.severity === "critique") deduct += 12;
    else if (f.severity === "majeur") deduct += 8;
    else deduct += 3;
  }
  deduct = Math.min(cap, deduct);
  return Math.max(0, 100 - deduct);
}

export async function runSiteAudit(rawUrl: string): Promise<SiteAuditReport> {
  const url = await assertPublicHttpUrl(rawUrl);
  const target = url.toString();

  const http = await runHttpChecks(target);
  let browser;
  try {
    browser = await runBrowserChecks(http.meta.finalUrl || target);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur navigateur";
    browser = {
      findings: [
        {
          id: "browser-failed",
          pillar: "performance" as const,
          severity: "critique" as const,
          title: "Scan navigateur incomplet",
          detail: message,
          recommendation: "Vérifiez CHROME_PATH et Chromium sur l’hôte d’audit.",
          standard: "Lighthouse / Puppeteer",
          standardUrl: STANDARD_URLS.lighthouse,
        },
      ] satisfies AuditFinding[],
      lighthouseScores: {
        performance: null,
        seo: null,
        accessibility: null,
        bestPractices: null,
        pwa: null,
      },
      cwv: { lcpMs: null, cls: null, inpMs: null, tbtMs: null, ttfbMs: null },
      axeViolations: 0,
      requestsBeforeConsent: [] as string[],
    };
  }

  // Merge: if network trackers found, drop weak HTML-only tracker guesses (already removed)
  const findings = [...http.findings, ...browser.findings];

  // If HTML had trackers but network caught them, prefer network evidence (already in browser findings)
  if (browser.requestsBeforeConsent.length && http.meta.trackerHostsInHtml.length) {
    // optional: nothing to strip
  }

  const byPillar = (id: AuditPillar) => findings.filter((f) => f.pillar === id);

  const pillars: PillarScore[] = (Object.keys(PILLAR_LABELS) as AuditPillar[]).map((id) => {
    const list = byPillar(id);
    let score: number;
    let scoreSource: string;

    if (id === "performance") {
      const lh = browser.lighthouseScores.performance;
      const cwv = cwvScore100(browser.cwv);
      if (lh != null && cwv != null) {
        score = Math.round(lh * 0.55 + cwv * 0.45);
        scoreSource = "Lighthouse Performance 55% + CWV lab 45% (seuils Google Good)";
      } else if (lh != null) {
        score = lh;
        scoreSource = "Lighthouse Performance (lab mobile)";
      } else if (cwv != null) {
        score = cwv;
        scoreSource = "Core Web Vitals lab";
      } else {
        score = cappedFindingScore(list, 40);
        scoreSource = "Findings performance (fallback)";
      }
    } else if (id === "seo") {
      score =
        browser.lighthouseScores.seo != null
          ? browser.lighthouseScores.seo
          : cappedFindingScore(list, 35);
      scoreSource =
        browser.lighthouseScores.seo != null
          ? "Lighthouse SEO (lab) — findings listés sans double pénalité"
          : "Findings SEO HTTP (cap −35)";
    } else if (id === "a11y") {
      score =
        browser.lighthouseScores.accessibility != null
          ? browser.lighthouseScores.accessibility
          : cappedFindingScore(list, 40);
      scoreSource =
        browser.lighthouseScores.accessibility != null
          ? "Lighthouse Accessibility — violations axe listées (informational)"
          : "Findings a11y (cap −40)";
    } else if (id === "pwa") {
      score =
        browser.lighthouseScores.pwa != null
          ? browser.lighthouseScores.pwa
          : cappedFindingScore(list, 40);
      scoreSource =
        browser.lighthouseScores.pwa != null
          ? "Lighthouse installability heuristics (manifest + SW)"
          : "Findings PWA (cap −40)";
    } else {
      score = cappedFindingScore(list, 30);
      scoreSource = `Findings ${id} (pénalités plafonnées −30)`;
    }

    return {
      id,
      label: PILLAR_LABELS[id],
      score,
      findings: list,
      scoreSource,
    };
  });

  const weightSum = pillars.reduce((a, p) => a + PILLAR_WEIGHTS[p.id], 0);
  const overallScore = Math.round(
    pillars.reduce((a, p) => a + p.score * PILLAR_WEIGHTS[p.id], 0) / weightSum,
  );

  return {
    url: http.meta.finalUrl || target,
    scannedAt: new Date().toISOString(),
    overallScore,
    pillars,
    findings: findings.sort((a, b) => {
      const rank = { critique: 0, majeur: 1, mineur: 2 };
      return rank[a.severity] - rank[b.severity];
    }),
    cwv: browser.cwv,
    methodology: [
      "Lighthouse lab mobile (Performance, SEO, Accessibility, Best Practices) — Chrome.",
      "Core Web Vitals lab : LCP ≤ 2,5 s · CLS ≤ 0,1 · INP/TBT ≤ 200 ms (seuils Google « Good », web.dev/vitals).",
      "axe-core (WCAG 2A / 2AA / 2.1 AA) avec helpUrl par règle.",
      "Interception réseau Puppeteer avant consentement (domaines analytics/ads).",
      "Fetch HTTP : en-têtes sécurité OWASP, SEO structuré, JSON-LD parsé, robots.txt + sitemap XML.",
      "Pages légales suivies (privacy / cookies / mentions) pour contrôles RGPD / LCEN — pas un avis juridique.",
    ],
    disclaimer:
      "Diagnostic technique automatisé basé sur Lighthouse, axe-core et mesures HTTP. Les seuils CWV citent Google web.dev ; l’accessibilité cite WCAG 2.1 / axe-core ; le consentement cite les lignes directrices CNIL. Ceci n’est pas une certification RGPD ni un audit accessibilité humain.",
  };
}
