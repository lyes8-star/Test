import { runHttpChecks } from "@/lib/audit/httpChecks";
import { runBrowserChecks } from "@/lib/audit/browserChecks";
import { assertPublicHttpUrl } from "@/lib/audit/ssrf";
import {
  PILLAR_LABELS,
  type AuditFinding,
  type PillarScore,
  type SiteAuditReport,
} from "@/lib/audit/types";

function scoreFromFindings(findings: AuditFinding[]): number {
  let score = 100;
  for (const f of findings) {
    if (f.severity === "critique") score -= 18;
    else if (f.severity === "majeur") score -= 10;
    else score -= 4;
  }
  return Math.max(0, Math.min(100, score));
}

function blend(a: number, b: number | null, weightB = 0.45) {
  if (b === null || Number.isNaN(b)) return a;
  return Math.round(a * (1 - weightB) + b * weightB);
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
          recommendation:
            "Vérifiez CHROME_PATH et que Chromium est installé sur le serveur d’audit.",
        },
      ],
      lighthouseScores: {
        performance: null,
        seo: null,
        accessibility: null,
        bestPractices: null,
        pwa: null,
      },
      axeViolations: 0,
    };
  }

  const findings = [...http.findings, ...browser.findings];

  const byPillar = (id: AuditFinding["pillar"]) => findings.filter((f) => f.pillar === id);

  const pillars: PillarScore[] = (
    Object.keys(PILLAR_LABELS) as AuditFinding["pillar"][]
  ).map((id) => {
    const list = byPillar(id);
    let score = scoreFromFindings(list);
    if (id === "performance") score = blend(score, browser.lighthouseScores.performance, 0.7);
    if (id === "seo") score = blend(score, browser.lighthouseScores.seo, 0.55);
    if (id === "a11y") score = blend(score, browser.lighthouseScores.accessibility, 0.6);
    if (id === "pwa" && browser.lighthouseScores.pwa !== null) {
      score = blend(score, browser.lighthouseScores.pwa, 0.5);
    }
    return {
      id,
      label: PILLAR_LABELS[id],
      score,
      findings: list,
    };
  });

  const overallScore = Math.round(
    pillars.reduce((acc, p) => acc + p.score, 0) / Math.max(1, pillars.length),
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
    disclaimer:
      "Diagnostic technique automatisé (Lighthouse, axe-core, heuristiques HTTP). Ce n’est pas un avis juridique ni une certification RGPD / accessibilité.",
  };
}
