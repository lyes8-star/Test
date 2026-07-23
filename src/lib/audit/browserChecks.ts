import fs from "fs";
import { createRequire } from "module";
import path from "path";
import { cwvFindingsFromMetrics, extractCwv, TRACKER_HOST_RE } from "@/lib/audit/standards";
import { STANDARD_URLS, type AuditFinding, type CwvMetrics } from "@/lib/audit/types";

const requireFromRoot = createRequire(path.join(process.cwd(), "package.json"));

function chromePath() {
  return (
    process.env.CHROME_PATH ||
    process.env.CHROME_TEST_PATH ||
    "/usr/local/bin/google-chrome"
  );
}

export type BrowserAuditResult = {
  findings: AuditFinding[];
  lighthouseScores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    pwa: number | null;
  };
  cwv: CwvMetrics;
  axeViolations: number;
  requestsBeforeConsent: string[];
};

export async function runBrowserChecks(url: string): Promise<BrowserAuditResult> {
  const findings: AuditFinding[] = [];
  const lighthouseScores = {
    performance: null as number | null,
    seo: null as number | null,
    accessibility: null as number | null,
    bestPractices: null as number | null,
    pwa: null as number | null,
  };
  let axeViolations = 0;
  let cwv: CwvMetrics = { lcpMs: null, cls: null, inpMs: null, tbtMs: null, ttfbMs: null };
  const requestsBeforeConsent: string[] = [];

  const puppeteer = requireFromRoot("puppeteer-core") as typeof import("puppeteer-core");
  const lighthouseMod = requireFromRoot("lighthouse") as { default?: unknown };
  const lighthouse = (lighthouseMod.default ?? lighthouseMod) as (
    url: string,
    flags?: Record<string, unknown>,
    config?: unknown,
  ) => Promise<
    | {
        lhr: {
          categories: Record<string, { score: number | null }>;
          audits: Record<
            string,
            {
              score: number | null;
              numericValue?: number;
              description?: string;
              title?: string;
              displayValue?: string;
            }
          >;
        };
      }
    | undefined
  >;
  const axeSource = fs.readFileSync(requireFromRoot.resolve("axe-core/axe.min.js"), "utf8");

  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

    page.on("request", (req) => {
      try {
        const host = new URL(req.url()).hostname;
        if (TRACKER_HOST_RE.test(host) || TRACKER_HOST_RE.test(req.url())) {
          requestsBeforeConsent.push(host);
        }
      } catch {
        /* ignore */
      }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const uniqueTrackers = [...new Set(requestsBeforeConsent)];

    // PWA bits
    const pwaBits = await page.evaluate(() => {
      const manifest = document.querySelector('link[rel="manifest"]')?.getAttribute("href") || "";
      const viewport = document.querySelector('meta[name="viewport"]');
      return {
        manifest,
        hasViewport: Boolean(viewport),
        swControlled: Boolean(navigator.serviceWorker?.controller),
      };
    });

    if (!pwaBits.hasViewport) {
      findings.push({
        id: "viewport",
        pillar: "pwa",
        severity: "majeur",
        title: "Meta viewport manquante",
        detail: "Requis pour mobile / PWA.",
        recommendation: "Ajoutez width=device-width, initial-scale=1.",
        standard: "Mobile-friendly / PWA",
        standardUrl: "https://web.dev/articles/viewport",
      });
    }

    if (pwaBits.manifest) {
      try {
        const manifestUrl = new URL(pwaBits.manifest, url).toString();
        const mRes = await fetch(manifestUrl, { signal: AbortSignal.timeout(10000) });
        if (!mRes.ok) {
          findings.push({
            id: "pwa-manifest-http",
            pillar: "pwa",
            severity: "majeur",
            title: "Manifest inaccessible",
            detail: `HTTP ${mRes.status}`,
            recommendation: "Corrigez l’URL du manifest.",
            evidence: [manifestUrl],
          });
        } else {
          const manifest = (await mRes.json()) as Record<string, unknown>;
          if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
            findings.push({
              id: "pwa-icons",
              pillar: "pwa",
              severity: "majeur",
              title: "Icônes PWA manquantes",
              detail: "Le manifest ne déclare pas d’icons.",
              recommendation: "Ajoutez des icônes 192 et 512.",
              standard: "Web App Manifest",
              standardUrl: "https://web.dev/articles/add-manifest",
              evidence: [manifestUrl],
            });
          }
          if (!manifest.display || manifest.display === "browser") {
            findings.push({
              id: "pwa-display",
              pillar: "pwa",
              severity: "mineur",
              title: "display non installable",
              detail: `display=${String(manifest.display || "absent")}`,
              recommendation: "Utilisez standalone ou minimal-ui.",
              evidence: [String(manifest.display)],
            });
          }
        }
      } catch {
        findings.push({
          id: "pwa-manifest-parse",
          pillar: "pwa",
          severity: "majeur",
          title: "Manifest illisible",
          detail: "Échec parse JSON.",
          recommendation: "Vérifiez le JSON du manifest.",
        });
      }
    }

    if (!pwaBits.swControlled) {
      findings.push({
        id: "service-worker",
        pillar: "pwa",
        severity: "majeur",
        title: "Service worker non actif",
        detail: "Aucune page contrôlée par un SW au moment du scan.",
        recommendation: "Enregistrez un service worker (cache basique).",
        standard: "PWA service worker",
        standardUrl: "https://web.dev/articles/service-workers-basics",
      });
    }

    // Consent UI visibility
    const consentVisible = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll("button, [role='dialog'], #cookies, .cookie, [class*='consent']")];
      return nodes.some((n) => /accepter|refuse|cookie|consent|personnaliser/i.test(n.textContent || ""));
    });

    if (uniqueTrackers.length > 0) {
      findings.push({
        id: "trackers-pre-consent",
        pillar: "rgpd",
        severity: "critique",
        title: "Requêtes trackers détectées avant interaction consentement",
        detail: `${uniqueTrackers.length} hôte(s) analytics/ads contacté(s) au chargement, sans clic CMP.`,
        recommendation:
          "Ne chargez Analytics / Ads qu’après consentement (Consent Mode v2 / CMP). Guide CNIL cookies.",
        metric: `${uniqueTrackers.length} hôte(s)`,
        threshold: "0 avant consentement",
        standard: "CNIL — cookies et traceurs",
        standardUrl: STANDARD_URLS.cnilCookies,
        evidence: uniqueTrackers.slice(0, 12),
      });
      findings.push({
        id: "sea-tags-network",
        pillar: "google_sea",
        severity: "majeur",
        title: "Tags Google / pubs observés sur le réseau",
        detail: "Preuve réseau (Puppeteer request interception), pas un simple regex HTML.",
        recommendation: "Activez les tags Ads uniquement après consentement publicitaire.",
        standard: "Google Consent Mode / CNIL",
        standardUrl: STANDARD_URLS.eprivacy,
        evidence: uniqueTrackers.slice(0, 12),
        informational: true,
      });
    } else if (!consentVisible) {
      findings.push({
        id: "consent-ui",
        pillar: "rgpd",
        severity: "majeur",
        title: "UI de consentement non visible",
        detail: "Aucun bouton/dialog cookies détecté ; aucun tracker réseau non plus.",
        recommendation: "Si vous déposez des cookies non essentiels, affichez un CMP granulaire.",
        standard: "CNIL",
        standardUrl: STANDARD_URLS.cnilCookies,
      });
    }

    // axe-core
    await page.addScriptTag({ content: axeSource });
    const axeResults = (await page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axe = (window as any).axe;
      return axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
      });
    })) as {
      violations: Array<{
        id: string;
        help: string;
        description: string;
        helpUrl?: string;
        impact?: string;
        tags?: string[];
        nodes: unknown[];
      }>;
    };

    axeViolations = axeResults.violations.length;
    const byImpact: Record<string, typeof axeResults.violations> = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };
    for (const v of axeResults.violations) {
      const key = v.impact && byImpact[v.impact] ? v.impact : "minor";
      byImpact[key].push(v);
    }

    const ordered = [
      ...byImpact.critical,
      ...byImpact.serious,
      ...byImpact.moderate,
      ...byImpact.minor,
    ];

    for (const v of ordered.slice(0, 25)) {
      const severity =
        v.impact === "critical" || v.impact === "serious"
          ? "critique"
          : v.impact === "moderate"
            ? "majeur"
            : "mineur";
      const wcagTags = (v.tags || []).filter((t) => /wcag/i.test(t));
      findings.push({
        id: `axe-${v.id}`,
        pillar: "a11y",
        severity,
        title: v.help,
        detail: `${v.nodes.length} nœud(s) — ${v.description}`,
        recommendation:
          "Corrigez selon WCAG 2.2 AA et le RGAA 4.1 (contraste, labels, focus, structure, taille des cibles).",
        metric: `${v.nodes.length} nœud(s)`,
        standard: wcagTags.length
          ? `WCAG 2.2 / RGAA 4.1 (${wcagTags.join(", ")})`
          : "WCAG 2.2 AA / RGAA 4.1 (axe-core)",
        standardUrl: v.helpUrl || STANDARD_URLS.wcag22,
        evidence: wcagTags,
      });
    }

    if (axeViolations > 0) {
      findings.push({
        id: "axe-summary",
        pillar: "a11y",
        severity: byImpact.critical.length || byImpact.serious.length ? "critique" : "majeur",
        title: `${axeViolations} violation(s) axe-core`,
        detail: `critical=${byImpact.critical.length}, serious=${byImpact.serious.length}, moderate=${byImpact.moderate.length}, minor=${byImpact.minor.length}.`,
        recommendation: "Traitez d’abord critical/serious (impact utilisateur) — alignement RGAA / WCAG 2.2.",
        metric: String(axeViolations),
        threshold: "0",
        standard: "axe-core / WCAG 2.2 AA / RGAA 4.1",
        standardUrl: STANDARD_URLS.axe,
      });
    }

    await page.close();

    // Lighthouse
    const endpoint = browser.wsEndpoint();
    let lh;
    try {
      lh = await lighthouse(
        url,
        {
          logLevel: "error",
          output: "json",
          onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
          port: Number(new URL(endpoint).port),
          formFactor: "mobile",
          screenEmulation: {
            mobile: true,
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            disabled: false,
          },
        },
        undefined,
      );
    } catch (e) {
      findings.push({
        id: "lighthouse-failed",
        pillar: "performance",
        severity: "majeur",
        title: "Lighthouse n’a pas pu terminer",
        detail: e instanceof Error ? e.message : "Erreur Lighthouse",
        recommendation: "Relancez le scan ; page < 60s.",
        standard: "Lighthouse",
        standardUrl: STANDARD_URLS.lighthouse,
      });
    }

    const cats = lh?.lhr?.categories;
    if (cats) {
      lighthouseScores.performance = Math.round((cats.performance?.score ?? 0) * 100);
      lighthouseScores.seo = Math.round((cats.seo?.score ?? 0) * 100);
      lighthouseScores.accessibility = Math.round((cats.accessibility?.score ?? 0) * 100);
      lighthouseScores.bestPractices = Math.round((cats["best-practices"]?.score ?? 0) * 100);
    }

    const audits = lh?.lhr?.audits;
    cwv = extractCwv(audits);
    findings.push(...cwvFindingsFromMetrics(cwv));

    if (audits) {
      const installable = audits["installable-manifest"];
      const sw = audits["service-worker"];
      let pwaScore = 100;
      if (installable && installable.score !== null && installable.score < 1) {
        pwaScore -= 40;
        findings.push({
          id: "lh-installable",
          pillar: "pwa",
          severity: "majeur",
          title: installable.title || "Manifest non installable (Lighthouse)",
          detail: installable.description || "installable-manifest échoué",
          recommendation: "Corrigez name, icons 192/512, start_url, display.",
          standard: "Lighthouse installable-manifest",
          standardUrl: "https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest",
          informational: true,
        });
      }
      if (sw && sw.score !== null && sw.score < 1) {
        pwaScore -= 35;
      }
      lighthouseScores.pwa = Math.max(0, pwaScore);

      // LH SEO/a11y category scores as informational evidence (no double deduct)
      if (lighthouseScores.seo != null && lighthouseScores.seo < 95) {
        findings.push({
          id: "lh-seo-score",
          pillar: "seo",
          severity: lighthouseScores.seo < 70 ? "majeur" : "mineur",
          title: `Score Lighthouse SEO : ${lighthouseScores.seo}/100`,
          detail: "Score catégorie SEO lab mobile (Lighthouse).",
          recommendation: "Consultez les audits SEO Lighthouse (crawlable, robots, image-alt…).",
          metric: `${lighthouseScores.seo}/100`,
          threshold: "≥ 95",
          standard: "Lighthouse SEO",
          standardUrl: STANDARD_URLS.lighthouse,
          informational: true,
        });
      }
      if (lighthouseScores.accessibility != null && lighthouseScores.accessibility < 95) {
        findings.push({
          id: "lh-a11y-score",
          pillar: "a11y",
          severity: lighthouseScores.accessibility < 70 ? "majeur" : "mineur",
          title: `Score Google Lighthouse Accessibilité : ${lighthouseScores.accessibility}/100`,
          detail: "Complément lab Google Lighthouse à axe-core (WCAG 2.2 / RGAA).",
          recommendation: "Corrigez les audits a11y Lighthouse restants jusqu’à ≥ 95.",
          metric: `${lighthouseScores.accessibility}/100`,
          threshold: "≥ 95",
          standard: "Google Lighthouse Accessibility",
          standardUrl: STANDARD_URLS.lighthouseA11y,
          informational: true,
        });
      }
    }
  } finally {
    await browser.close();
  }

  return {
    findings,
    lighthouseScores,
    cwv,
    axeViolations,
    requestsBeforeConsent: [...new Set(requestsBeforeConsent)],
  };
}
