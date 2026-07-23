import fs from "fs";
import { createRequire } from "module";
import path from "path";
import type { AuditFinding } from "@/lib/audit/types";

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
  axeViolations: number;
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

  const puppeteer = requireFromRoot("puppeteer-core") as typeof import("puppeteer-core");
  const lighthouseMod = requireFromRoot("lighthouse") as { default?: unknown };
  const lighthouse = (lighthouseMod.default ?? lighthouseMod) as (
    url: string,
    flags?: Record<string, unknown>,
    config?: unknown,
  ) => Promise<{ lhr: { categories: Record<string, { score: number | null }>; audits: Record<string, { score: number | null; description?: string }> } } | undefined>;
  const axeSource = fs.readFileSync(requireFromRoot.resolve("axe-core/axe.min.js"), "utf8");

  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // PWA / SW heuristics from DOM
    const pwaBits = await page.evaluate(() => {
      const manifest = document.querySelector('link[rel="manifest"]')?.getAttribute("href") || "";
      const theme = document.querySelector('meta[name="theme-color"]')?.getAttribute("content") || "";
      const apple = document.querySelector('link[rel="apple-touch-icon"]');
      const viewport = document.querySelector('meta[name="viewport"]');
      return {
        manifest,
        theme,
        hasAppleIcon: Boolean(apple),
        hasViewport: Boolean(viewport),
        swControlled: Boolean(navigator.serviceWorker?.controller),
      };
    });

    if (!pwaBits.manifest) {
      findings.push({
        id: "pwa-manifest-dom",
        pillar: "pwa",
        severity: "majeur",
        title: "Manifest absent du DOM rendu",
        detail: "Aucun link rel=manifest après rendu.",
        recommendation: "Servez un manifest.webmanifest valide (name, icons, start_url, display).",
      });
    } else {
      try {
        const manifestUrl = new URL(pwaBits.manifest, url).toString();
        const mRes = await fetch(manifestUrl, { signal: AbortSignal.timeout(10000) });
        if (!mRes.ok) {
          findings.push({
            id: "pwa-manifest-http",
            pillar: "pwa",
            severity: "majeur",
            title: "Manifest inaccessible",
            detail: `HTTP ${mRes.status} pour ${manifestUrl}`,
            recommendation: "Corrigez l’URL du manifest et le Content-Type.",
          });
        } else {
          const manifest = (await mRes.json()) as Record<string, unknown>;
          if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
            findings.push({
              id: "pwa-icons",
              pillar: "pwa",
              severity: "majeur",
              title: "Icônes PWA manquantes",
              detail: "Le manifest ne déclare pas d’icons.",
              recommendation: "Ajoutez au moins une icône 192 et 512.",
            });
          }
          if (!manifest.display || manifest.display === "browser") {
            findings.push({
              id: "pwa-display",
              pillar: "pwa",
              severity: "mineur",
              title: "display PWA non installable",
              detail: `display=${String(manifest.display || "absent")}`,
              recommendation: "Utilisez standalone ou minimal-ui pour l’installabilité.",
            });
          }
        }
      } catch {
        findings.push({
          id: "pwa-manifest-parse",
          pillar: "pwa",
          severity: "majeur",
          title: "Manifest illisible",
          detail: "Échec de récupération / parse JSON du manifest.",
          recommendation: "Vérifiez le JSON et les CORS du manifest.",
        });
      }
    }

    if (!pwaBits.hasViewport) {
      findings.push({
        id: "viewport",
        pillar: "pwa",
        severity: "majeur",
        title: "Meta viewport manquante",
        detail: "Requis pour mobile et PWA.",
        recommendation: "Ajoutez <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
      });
    }

    if (!pwaBits.swControlled) {
      findings.push({
        id: "service-worker",
        pillar: "pwa",
        severity: "majeur",
        title: "Service worker non actif",
        detail: "Aucune page contrôlée par un service worker au moment du scan.",
        recommendation: "Enregistrez un SW (cache basique) pour l’installabilité PWA.",
      });
    }

    // axe-core
    await page.addScriptTag({ content: axeSource });
    const axeResults = (await page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axe = (window as any).axe;
      return axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      });
    })) as { violations: Array<{ id: string; help: string; impact?: string; nodes: unknown[] }> };

    axeViolations = axeResults.violations.length;
    for (const v of axeResults.violations.slice(0, 12)) {
      const severity =
        v.impact === "critical" || v.impact === "serious"
          ? "critique"
          : v.impact === "moderate"
            ? "majeur"
            : "mineur";
      findings.push({
        id: `axe-${v.id}`,
        pillar: "a11y",
        severity,
        title: v.help,
        detail: `${v.nodes.length} nœud(s) — règle axe « ${v.id} »`,
        recommendation: "Corrigez selon WCAG 2.1 AA (contraste, labels, focus, structure).",
      });
    }

    if (axeViolations === 0) {
      // positive — no finding
    }

    await page.close();

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
        recommendation: "Relancez le scan ; vérifiez que la page charge sous 60s.",
      });
    }

    const cats = lh?.lhr?.categories;
    if (cats) {
      lighthouseScores.performance = Math.round((cats.performance?.score ?? 0) * 100);
      lighthouseScores.seo = Math.round((cats.seo?.score ?? 0) * 100);
      lighthouseScores.accessibility = Math.round((cats.accessibility?.score ?? 0) * 100);
      lighthouseScores.bestPractices = Math.round((cats["best-practices"]?.score ?? 0) * 100);
    }

    // PWA installability from Lighthouse audits when category removed
    const audits = lh?.lhr?.audits;
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
          title: "Manifest non installable (Lighthouse)",
          detail: installable.description || "installable-manifest échoué",
          recommendation: "Corrigez name, icons 192/512, start_url, display.",
        });
      }
      if (sw && sw.score !== null && sw.score < 1) {
        pwaScore -= 35;
      }
      lighthouseScores.pwa = Math.max(0, pwaScore);
    }

    const pushScoreFinding = (
      pillar: AuditFinding["pillar"],
      label: string,
      score: number | null,
      threshold: number,
    ) => {
      if (score === null) return;
      if (score < threshold) {
        findings.push({
          id: `lh-${pillar}`,
          pillar,
          severity: score < 50 ? "critique" : score < 80 ? "majeur" : "mineur",
          title: `Score Lighthouse ${label} : ${score}/100`,
          detail: `Sous le seuil d’exigence Meridian (${threshold}+).`,
          recommendation: `Priorisez les audits Lighthouse ${label} (lab mobile).`,
        });
      }
    };

    pushScoreFinding("performance", "Performance", lighthouseScores.performance, 90);
    pushScoreFinding("seo", "SEO", lighthouseScores.seo, 95);
    pushScoreFinding("a11y", "Accessibilité", lighthouseScores.accessibility, 95);
    if (lighthouseScores.pwa !== null) {
      pushScoreFinding("pwa", "PWA", lighthouseScores.pwa, 80);
    }

    const consentPage = await browser.newPage();
    await consentPage.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    const consentVisible = await consentPage.evaluate(() => {
      const nodes = [...document.querySelectorAll("button, [role='dialog'], #cookies, .cookie")];
      return nodes.some((n) => /accepter|refuse|cookie|consent/i.test(n.textContent || ""));
    });
    await consentPage.close();

    if (!consentVisible) {
      findings.push({
        id: "consent-ui",
        pillar: "rgpd",
        severity: "majeur",
        title: "UI de consentement non visible au chargement",
        detail: "Aucun bouton/dialog cookies détecté dans le DOM initial.",
        recommendation: "Affichez un bandeau CMP avant tout traceur non essentiel.",
      });
    }
  } finally {
    await browser.close();
  }

  return { findings, lighthouseScores, axeViolations };
}
