import { STANDARD_URLS, type AuditFinding } from "@/lib/audit/types";

export type HttpAuditResult = {
  findings: AuditFinding[];
  meta: {
    finalUrl: string;
    status: number;
    https: boolean;
    title?: string;
    privacyUrl?: string;
    cookiesUrl?: string;
    mentionsUrl?: string;
    hasConsentHints: boolean;
    hasGtag: boolean;
    hasGtm: boolean;
    hasAdsTag: boolean;
    trackerHostsInHtml: string[];
  };
};

function attr(html: string, tagRe: RegExp, attrName: string): string | undefined {
  const m = html.match(tagRe);
  if (!m) return undefined;
  const attrs = m[0];
  const am = attrs.match(new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, "i"));
  return am?.[1];
}

function metaContent(html: string, name: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)\\s*=\\s*["']${name}["'][^>]*>`,
    "i",
  );
  const tag = html.match(re)?.[0];
  if (!tag) return undefined;
  return tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1];
}

function absoluteUrl(base: string, href: string | undefined): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href, base).toString();
  } catch {
    return undefined;
  }
}

function findNavLink(html: string, patterns: RegExp[], base: string): string | undefined {
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, " ").trim();
    const hay = `${href} ${text}`;
    if (patterns.some((p) => p.test(hay))) return absoluteUrl(base, href);
  }
  return undefined;
}

async function fetchText(url: string, timeout = 12000): Promise<{ ok: boolean; status: number; text: string; headers: Headers }> {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeout),
    headers: {
      "User-Agent": "CreviaAuditBot/1.0 (+https://crevia.fr/autodiagnostic)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text, headers: res.headers };
}

export async function runHttpChecks(url: string): Promise<HttpAuditResult> {
  const findings: AuditFinding[] = [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  let res: Response;
  try {
    res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "CreviaAuditBot/1.0 (+https://crevia.fr/autodiagnostic)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } finally {
    clearTimeout(timer);
  }

  const finalUrl = res.url || url;
  const https = finalUrl.startsWith("https://");
  const html = await res.text();
  const headers = res.headers;

  // --- Security headers (OWASP) ---
  const headerChecks: Array<{ name: string; present: boolean; id: string }> = [
    { name: "strict-transport-security", present: Boolean(headers.get("strict-transport-security")), id: "hdr-hsts" },
    { name: "content-security-policy", present: Boolean(headers.get("content-security-policy")), id: "hdr-csp" },
    { name: "x-content-type-options", present: headers.get("x-content-type-options")?.toLowerCase() === "nosniff", id: "hdr-xcto" },
    { name: "referrer-policy", present: Boolean(headers.get("referrer-policy")), id: "hdr-referrer" },
  ];
  for (const h of headerChecks) {
    if (!h.present) {
      findings.push({
        id: h.id,
        pillar: "performance",
        severity: h.name === "strict-transport-security" ? "majeur" : "mineur",
        title: `En-tête ${h.name} manquant ou insuffisant`,
        detail: `Réponse HTTP sans ${h.name} exploitable.`,
        recommendation: "Configurez les en-têtes de sécurité recommandés OWASP Secure Headers.",
        standard: "OWASP Secure Headers",
        standardUrl: STANDARD_URLS.owaspHeaders,
        evidence: [`${h.name}=absent`],
        informational: true,
      });
    }
  }

  if (!https) {
    findings.push({
      id: "https-missing",
      pillar: "pwa",
      severity: "critique",
      title: "HTTPS absent",
      detail: "URL finale non HTTPS — prérequis PWA et confiance utilisateur.",
      recommendation: "Activez TLS et redirigez HTTP → HTTPS.",
      standard: "PWA / Web App Manifest",
      standardUrl: "https://web.dev/articles/add-manifest",
      evidence: [finalUrl],
    });
  }

  if (res.status >= 400) {
    findings.push({
      id: "http-status",
      pillar: "seo",
      severity: "critique",
      title: `Statut HTTP ${res.status}`,
      detail: "La page répond en erreur.",
      recommendation: "Rétablissez un 200 avant tout travail SEO.",
      metric: String(res.status),
      threshold: "200",
      evidence: [finalUrl],
    });
  }

  // --- Structured SEO ---
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
  const description = metaContent(html, "description");
  const canonical = absoluteUrl(finalUrl, attr(html, /<link[^>]+rel=["']canonical["'][^>]*>/i, "href"));
  const lang = html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1];
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const ogTitle = metaContent(html, "og:title");
  const ogImage = metaContent(html, "og:image");
  const twitterCard = metaContent(html, "twitter:card");
  const hasHreflang = /rel=["']alternate["'][^>]*hreflang=/i.test(html) || /hreflang=["'][^"']+["'][^>]*rel=["']alternate["']/i.test(html);

  if (!title || title.length < 15 || title.length > 65) {
    findings.push({
      id: "title-length",
      pillar: "seo",
      severity: !title ? "critique" : "majeur",
      title: "Balise <title> hors bonnes pratiques SEO",
      detail: title ? `Longueur ${title.length} caractères (« ${title.slice(0, 80)} »).` : "Aucun <title>.",
      recommendation: "Visez ~50–60 caractères uniques, marque + intention.",
      metric: title ? `${title.length} car.` : "absent",
      threshold: "15–65 car.",
      standard: "SEO on-page (pratique Google Search)",
      standardUrl: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      evidence: title ? [title] : [],
    });
  }

  if (!description || description.length < 50 || description.length > 170) {
    findings.push({
      id: "meta-description",
      pillar: "seo",
      severity: !description ? "majeur" : "mineur",
      title: "Meta description absente ou hors plage",
      detail: description ? `${description.length} caractères.` : "Aucune meta description.",
      recommendation: "Rédigez ~120–160 caractères uniques.",
      metric: description ? `${description.length} car.` : "absent",
      threshold: "50–170 car.",
      evidence: description ? [description.slice(0, 120)] : [],
    });
  }

  if (!canonical) {
    findings.push({
      id: "canonical",
      pillar: "seo",
      severity: "majeur",
      title: "Canonical manquant",
      detail: "Pas de link rel=canonical résolu.",
      recommendation: "Déclarez une URL canonique absolue.",
      standard: "Google Search Essentials",
      standardUrl: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
    });
  }

  if (!lang) {
    findings.push({
      id: "html-lang",
      pillar: "a11y",
      severity: "majeur",
      title: "Attribut lang manquant sur <html>",
      detail: "Requis WCAG 2.2 SC 3.1.1 et RGAA 4.1 (critère 8.3).",
      recommendation: "Ajoutez lang=\"fr\" (ou la langue principale).",
      standard: "WCAG 2.2 SC 3.1.1 / RGAA 4.1",
      standardUrl: STANDARD_URLS.wcag22,
    });
  }

  const hasSkipLink =
    /href\s*=\s*["']#[^"']*["'][^>]*>[\s\S]{0,80}(contenu|content|main|aller au)/i.test(html) ||
    /class\s*=\s*["'][^"']*skip[^"']*["']/i.test(html) ||
    /id\s*=\s*["']skip/i.test(html);
  const hasMain = /<main\b/i.test(html) || /role\s*=\s*["']main["']/i.test(html);
  const accessibiliteUrl = findNavLink(
    html,
    [
      /accessibilit[ée]/i,
      /d[ée]claration[- ]d['’]?accessibilit/i,
      /accessibility[- ]?statement/i,
      /\/accessibilite/i,
      /\/accessibility/i,
    ],
    finalUrl,
  );

  if (!hasSkipLink) {
    findings.push({
      id: "skip-link",
      pillar: "a11y",
      severity: "majeur",
      title: "Lien d’évitement non détecté",
      detail: "Aucun lien « Aller au contenu » / skip link évident en tête de page.",
      recommendation: "Ajoutez un lien d’évitement visible au focus vers le contenu principal.",
      standard: "WCAG 2.2 SC 2.4.1 / RGAA 4.1",
      standardUrl: STANDARD_URLS.rgaa,
    });
  }

  if (!hasMain) {
    findings.push({
      id: "main-landmark",
      pillar: "a11y",
      severity: "majeur",
      title: "Landmark <main> absent",
      detail: "Pas de <main> ni role=\"main\" détecté.",
      recommendation: "Enveloppez le contenu principal dans <main> (structure ARIA / RGAA).",
      standard: "WCAG 2.2 / RGAA 4.1 (structure)",
      standardUrl: STANDARD_URLS.rgaa,
    });
  }

  if (!accessibiliteUrl) {
    findings.push({
      id: "a11y-statement-link",
      pillar: "a11y",
      severity: "majeur",
      title: "Déclaration d’accessibilité non trouvée",
      detail:
        "Aucun lien vers une déclaration d’accessibilité (RGAA / loi 2005-102 art. 47 / EAA).",
      recommendation:
        "Publiez une déclaration citant WCAG 2.2, RGAA 4.1 et la directive (UE) 2019/882, liée en footer.",
      standard: "RGAA 4.1 / EAA (UE 2019/882)",
      standardUrl: STANDARD_URLS.eaa,
    });
  }

  if (h1Count !== 1) {
    findings.push({
      id: "h1-count",
      pillar: "seo",
      severity: h1Count === 0 ? "majeur" : "mineur",
      title: `Nombre de H1 = ${h1Count}`,
      detail: "Une page devrait généralement exposer un H1 unique.",
      recommendation: "Structurez un H1 descriptif de la page.",
      metric: String(h1Count),
      threshold: "1",
    });
  }

  if (!ogTitle || !ogImage) {
    findings.push({
      id: "open-graph",
      pillar: "seo",
      severity: "mineur",
      title: "Open Graph incomplet",
      detail: `og:title=${ogTitle ? "ok" : "manquant"}, og:image=${ogImage ? "ok" : "manquant"}.`,
      recommendation: "Complétez og:title, og:description, og:image pour le partage.",
      standard: "Open Graph protocol",
      standardUrl: "https://ogp.me/",
      evidence: [ogTitle || "no-og:title", ogImage || "no-og:image"],
    });
  }

  if (!twitterCard) {
    findings.push({
      id: "twitter-card",
      pillar: "seo",
      severity: "mineur",
      title: "twitter:card absent",
      detail: "Pas de meta twitter:card.",
      recommendation: "Ajoutez twitter:card=summary_large_image.",
    });
  }

  if (!hasHreflang && /fr|en|de|es/i.test(html.slice(0, 5000))) {
    // informational only if multi-lang hints — skip noise for monolingual
  }

  // JSON-LD parse
  const ldBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let validLd = 0;
  let invalidLd = 0;
  const types = new Set<string>();
  for (const block of ldBlocks) {
    try {
      const data = JSON.parse(block[1].trim());
      validLd += 1;
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const t = item?.["@type"];
        if (typeof t === "string") types.add(t);
        if (Array.isArray(t)) t.forEach((x) => types.add(String(x)));
        if (item?.["@graph"] && Array.isArray(item["@graph"])) {
          for (const g of item["@graph"]) {
            if (g?.["@type"]) types.add(String(g["@type"]));
          }
        }
      }
    } catch {
      invalidLd += 1;
    }
  }
  if (invalidLd > 0) {
    findings.push({
      id: "jsonld-invalid",
      pillar: "seo",
      severity: "majeur",
      title: "JSON-LD invalide",
      detail: `${invalidLd} bloc(s) application/ld+json non parsable(s).`,
      recommendation: "Validez le JSON-LD (virgules, guillemets).",
      metric: `${invalidLd} invalide(s)`,
      standard: "Schema.org / Google structured data",
      standardUrl: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
    });
  }
  if (validLd === 0) {
    findings.push({
      id: "jsonld-missing",
      pillar: "seo",
      severity: "mineur",
      title: "Aucun JSON-LD valide",
      detail: "Pas de données structurées parsées.",
      recommendation: "Ajoutez Organization / WebSite / FAQPage selon le contenu.",
      standard: "Schema.org",
      standardUrl: "https://schema.org/",
    });
  } else if (![...types].some((t) => /Organization|WebSite|LocalBusiness/i.test(t))) {
    findings.push({
      id: "jsonld-types",
      pillar: "seo",
      severity: "mineur",
      title: "Types Schema recommandés absents",
      detail: `Types trouvés : ${[...types].slice(0, 8).join(", ") || "aucun"}.`,
      recommendation: "Incluez au minimum Organization et/ou WebSite.",
      evidence: [...types],
    });
  }

  const privacyUrl = findNavLink(
    html,
    [/politique[- ]?de[- ]?confidentialit/i, /privacy/i, /\/confidentialite/i],
    finalUrl,
  );
  const cookiesUrl = findNavLink(
    html,
    [/politique[- ]?cookies/i, /cookie[- ]?policy/i, /\/cookies/i],
    finalUrl,
  );
  const mentionsUrl = findNavLink(
    html,
    [/mentions[- ]?l[eé]gales/i, /\/mentions/i],
    finalUrl,
  );

  const hasConsentHints =
    /consent|cookie.?banner|rgpd|gdpr|gestionnaire de cookies|tout accepter|refuser/i.test(html);
  const hasGtag = /gtag\(|www\.googletagmanager\.com\/gtag\/js|google-analytics\.com\/g\/collect/i.test(html);
  const hasGtm = /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i.test(html);
  const hasAdsTag = /googleads|googlesyndication|gtag\(\s*['"]config['"]\s*,\s*['"]AW-/i.test(html);

  const trackerHostsInHtml: string[] = [];
  const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const src of scriptSrcs) {
    try {
      const host = new URL(src, finalUrl).hostname;
      if (/(google-analytics|googletagmanager|doubleclick|googlesyndication|facebook\.net|hotjar)/i.test(host)) {
        trackerHostsInHtml.push(host);
      }
    } catch {
      /* ignore */
    }
  }

  if (!privacyUrl) {
    findings.push({
      id: "privacy-link",
      pillar: "rgpd",
      severity: "critique",
      title: "Lien politique de confidentialité non trouvé",
      detail: "Aucun <a href> évident vers une politique de confidentialité.",
      recommendation: "Publiez et liez une politique RGPD en footer.",
      standard: "RGPD / CNIL",
      standardUrl: STANDARD_URLS.cnilCookies,
    });
  }

  if (!cookiesUrl) {
    findings.push({
      id: "cookies-policy-link",
      pillar: "rgpd",
      severity: "majeur",
      title: "Lien politique cookies non trouvé",
      detail: "Obligation d’information ePrivacy / CNIL.",
      recommendation: "Documentez finalités, durées et partenaires.",
      standard: "CNIL — cookies et traceurs",
      standardUrl: STANDARD_URLS.eprivacy,
    });
  }

  if (!mentionsUrl) {
    findings.push({
      id: "mentions-link",
      pillar: "legal_fr",
      severity: "critique",
      title: "Lien mentions légales non trouvé",
      detail: "Obligation LCEN d’identification de l’éditeur.",
      recommendation: "Ajoutez une page Mentions légales liée depuis le site.",
      standard: "LCEN (France)",
      standardUrl: STANDARD_URLS.lcen,
    });
  }

  // Follow legal pages
  async function auditLegalPage(
    pageUrl: string | undefined,
    kind: "privacy" | "cookies" | "mentions",
  ) {
    if (!pageUrl) return;
    try {
      const page = await fetchText(pageUrl);
      if (!page.ok) {
        findings.push({
          id: `${kind}-page-http`,
          pillar: kind === "mentions" ? "legal_fr" : "rgpd",
          severity: "majeur",
          title: `Page ${kind} inaccessible`,
          detail: `HTTP ${page.status} sur ${pageUrl}`,
          recommendation: "Corrigez le lien ou la disponibilité de la page.",
          evidence: [pageUrl, `status=${page.status}`],
          standard: kind === "mentions" ? "LCEN" : "CNIL",
          standardUrl: kind === "mentions" ? STANDARD_URLS.lcen : STANDARD_URLS.cnilCookies,
        });
        return;
      }
      const body = page.text;
      if (kind === "privacy") {
        const checks = [
          { re: /finalit|traitement|donn[eé]es personnelles/i, label: "finalités / traitements" },
          { re: /droit(s)? des personnes|acc[eè]s|effacement|opposition|portabilit/i, label: "droits des personnes" },
          { re: /responsable de traitement|d[eé]l[eé]gu[eé] à la protection|DPO/i, label: "responsable / DPO" },
        ];
        for (const c of checks) {
          if (!c.re.test(body)) {
            findings.push({
              id: `privacy-missing-${c.label.slice(0, 12)}`,
              pillar: "rgpd",
              severity: "majeur",
              title: `Politique confidentialité : « ${c.label} » non détecté`,
              detail: `Scan du contenu de ${pageUrl}.`,
              recommendation: "Complétez les mentions obligatoires RGPD sur la page privacy.",
              evidence: [pageUrl],
              standard: "RGPD art. 13/14",
              standardUrl: STANDARD_URLS.cnilCookies,
            });
          }
        }
      }
      if (kind === "cookies") {
        if (!/dur[eé]e|finalit|partenaire|d[eé]pos/i.test(body)) {
          findings.push({
            id: "cookies-content",
            pillar: "rgpd",
            severity: "majeur",
            title: "Politique cookies peu détaillée",
            detail: "Finalités / durées / partenaires non clairement détectés.",
            recommendation: "Détaillez chaque dépôt de cookies (CNIL).",
            evidence: [pageUrl],
            standard: "CNIL cookies",
            standardUrl: STANDARD_URLS.eprivacy,
          });
        }
      }
      if (kind === "mentions") {
        const need = [
          { re: /[ée]diteur|directeur de la publication/i, label: "éditeur / directeur de publication" },
          { re: /h[eé]bergeur/i, label: "hébergeur" },
          { re: /SIRET|SIREN|RCS/i, label: "SIRET / RCS" },
        ];
        for (const n of need) {
          if (!n.re.test(body)) {
            findings.push({
              id: `mentions-${n.label.slice(0, 10)}`,
              pillar: "legal_fr",
              severity: "majeur",
              title: `Mentions légales : ${n.label} non détecté`,
              detail: `Page scannée : ${pageUrl}`,
              recommendation: "Complétez les mentions LCEN (éditeur, hébergeur, identification).",
              evidence: [pageUrl],
              standard: "LCEN",
              standardUrl: STANDARD_URLS.lcen,
            });
          }
        }
      }
    } catch (e) {
      findings.push({
        id: `${kind}-fetch-fail`,
        pillar: kind === "mentions" ? "legal_fr" : "rgpd",
        severity: "mineur",
        title: `Impossible de récupérer la page ${kind}`,
        detail: e instanceof Error ? e.message : "erreur réseau",
        recommendation: "Vérifiez manuellement l’accessibilité de la page.",
        evidence: [pageUrl],
      });
    }
  }

  await Promise.all([
    auditLegalPage(privacyUrl, "privacy"),
    auditLegalPage(cookiesUrl, "cookies"),
    auditLegalPage(mentionsUrl, "mentions"),
  ]);

  // robots.txt + sitemap
  try {
    const origin = new URL(finalUrl).origin;
    const robots = await fetchText(`${origin}/robots.txt`, 8000);
    if (!robots.ok) {
      findings.push({
        id: "robots-txt",
        pillar: "seo",
        severity: "majeur",
        title: "robots.txt inaccessible",
        detail: `HTTP ${robots.status}`,
        recommendation: "Publiez un robots.txt valide.",
        metric: String(robots.status),
        evidence: [`${origin}/robots.txt`],
      });
    } else {
      const sitemapLines = robots.text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => /^sitemap:\s*/i.test(l))
        .map((l) => l.replace(/^sitemap:\s*/i, "").trim())
        .filter(Boolean);
      if (!sitemapLines.length) {
        findings.push({
          id: "robots-sitemap",
          pillar: "seo",
          severity: "mineur",
          title: "Aucune directive Sitemap dans robots.txt",
          detail: "Google recommande de déclarer le sitemap.",
          recommendation: "Ajoutez Sitemap: https://…/sitemap.xml",
          standard: "Google Search Central",
          standardUrl: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview",
        });
      } else {
        const smUrl = sitemapLines[0];
        const sm = await fetchText(smUrl, 10000);
        if (!sm.ok) {
          findings.push({
            id: "sitemap-http",
            pillar: "seo",
            severity: "majeur",
            title: "Sitemap déclaré inaccessible",
            detail: `HTTP ${sm.status} pour ${smUrl}`,
            recommendation: "Corrigez l’URL du sitemap.",
            evidence: [smUrl],
          });
        } else if (!/<urlset|<sitemapindex/i.test(sm.text)) {
          findings.push({
            id: "sitemap-xml",
            pillar: "seo",
            severity: "majeur",
            title: "Sitemap XML invalide ou non reconnu",
            detail: "Pas de balise urlset/sitemapindex détectée.",
            recommendation: "Servez un XML sitemap conforme.",
            evidence: [smUrl, sm.text.slice(0, 120)],
          });
        } else {
          const urlCount = (sm.text.match(/<loc>/gi) || []).length;
          if (urlCount === 0) {
            findings.push({
              id: "sitemap-empty",
              pillar: "seo",
              severity: "majeur",
              title: "Sitemap sans entrées <loc>",
              detail: smUrl,
              recommendation: "Listez les URL indexables dans le sitemap.",
              evidence: [smUrl],
            });
          }
        }
      }
    }
  } catch {
    findings.push({
      id: "robots-fetch",
      pillar: "seo",
      severity: "mineur",
      title: "Vérification robots/sitemap incomplète",
      detail: "Timeout ou erreur réseau.",
      recommendation: "Vérifiez robots.txt manuellement.",
    });
  }

  // Manifest link presence (PWA) — measured
  if (!/rel=["']manifest["']/i.test(html)) {
    findings.push({
      id: "manifest-link",
      pillar: "pwa",
      severity: "majeur",
      title: "Manifest PWA non référencé dans le HTML",
      detail: "Pas de link rel=manifest.",
      recommendation: "Ajoutez un web app manifest.",
      standard: "Web App Manifest",
      standardUrl: "https://web.dev/articles/add-manifest",
    });
  }

  void hasConsentHints;
  void hasGtag;
  void hasGtm;
  void hasAdsTag;

  return {
    findings,
    meta: {
      finalUrl,
      status: res.status,
      https,
      title,
      privacyUrl,
      cookiesUrl,
      mentionsUrl,
      hasConsentHints,
      hasGtag,
      hasGtm,
      hasAdsTag,
      trackerHostsInHtml: [...new Set(trackerHostsInHtml)],
    },
  };
}
