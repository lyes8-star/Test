import type { AuditFinding } from "@/lib/audit/types";

export type HttpAuditResult = {
  findings: AuditFinding[];
  meta: {
    finalUrl: string;
    status: number;
    https: boolean;
    title?: string;
    hasCanonical: boolean;
    hasRobotsMeta: boolean;
    hasJsonLd: boolean;
    hasManifestLink: boolean;
    hasPrivacyLink: boolean;
    hasCookiesLink: boolean;
    hasMentionsLink: boolean;
    hasConsentHints: boolean;
    hasGtag: boolean;
    hasGtm: boolean;
    hasAdsTag: boolean;
    siretMention: boolean;
  };
};

function find(html: string, re: RegExp) {
  return re.test(html);
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
        "User-Agent": "MeridianAuditBot/1.0 (+https://meridian-digital.fr/autodiagnostic)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } finally {
    clearTimeout(timer);
  }

  const finalUrl = res.url || url;
  const https = finalUrl.startsWith("https://");
  const html = await res.text();
  const lower = html.toLowerCase();

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim();
  const hasCanonical = find(html, /rel=["']canonical["']/i);
  const hasRobotsMeta = find(html, /name=["']robots["']/i);
  const hasJsonLd = find(html, /application\/ld\+json/i);
  const hasManifestLink = find(html, /rel=["']manifest["']/i);
  const hasPrivacyLink =
    /politique[- ]?de[- ]?confidentialit|privacy[- ]?policy|\/confidentialite/i.test(html);
  const hasCookiesLink = /politique[- ]?cookies|cookie[- ]?policy|\/cookies/i.test(html);
  const hasMentionsLink = /mentions[- ]?l[eé]gales|\/mentions/i.test(html);
  const hasConsentHints =
    /consent|cookie.?banner|rgpd|gdpr|gestionnaire de cookies|tout accepter/i.test(html);
  const hasGtag = /gtag\(|www\.googletagmanager\.com\/gtag\/js|google-analytics\.com\/analytics\.js/i.test(
    html,
  );
  const hasGtm = /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i.test(html);
  const hasAdsTag =
    /googleads|googlesyndication|gtag\(\s*['"]config['"]\s*,\s*['"]AW-/i.test(html);
  const siretMention = /siret|rcs\s+|siren/i.test(html);

  if (!https) {
    findings.push({
      id: "https-missing",
      pillar: "pwa",
      severity: "critique",
      title: "HTTPS absent",
      detail: "La page finale n’est pas servie en HTTPS.",
      recommendation: "Activez un certificat TLS et redirigez tout le trafic HTTP → HTTPS.",
    });
  }

  if (res.status >= 400) {
    findings.push({
      id: "http-status",
      pillar: "seo",
      severity: "critique",
      title: `Statut HTTP ${res.status}`,
      detail: "La page répond avec une erreur HTTP.",
      recommendation: "Corrigez la disponibilité de l’URL avant tout travail SEO.",
    });
  }

  if (!title || title.length < 10) {
    findings.push({
      id: "title-weak",
      pillar: "seo",
      severity: "majeur",
      title: "Balise <title> absente ou trop courte",
      detail: title ? `Title actuel : « ${title} »` : "Aucun <title> détecté.",
      recommendation: "Visez 50–60 caractères descriptifs, marque + intention de recherche.",
    });
  }

  if (!find(html, /name=["']description["']/i)) {
    findings.push({
      id: "meta-description",
      pillar: "seo",
      severity: "majeur",
      title: "Meta description manquante",
      detail: "Aucune meta name=description trouvée.",
      recommendation: "Ajoutez une meta description unique (~150–160 caractères).",
    });
  }

  if (!hasCanonical) {
    findings.push({
      id: "canonical",
      pillar: "seo",
      severity: "majeur",
      title: "Canonical manquant",
      detail: "Pas de link rel=canonical détecté.",
      recommendation: "Déclarez une URL canonique pour éviter le contenu dupliqué.",
    });
  }

  if (!hasJsonLd) {
    findings.push({
      id: "jsonld",
      pillar: "seo",
      severity: "mineur",
      title: "JSON-LD absent",
      detail: "Aucun script application/ld+json détecté.",
      recommendation: "Ajoutez Organization / WebSite / FAQPage selon le contenu.",
    });
  }

  if (!hasManifestLink) {
    findings.push({
      id: "manifest-link",
      pillar: "pwa",
      severity: "majeur",
      title: "Manifest PWA non référencé",
      detail: "Pas de link rel=manifest.",
      recommendation: "Ajoutez un web manifest et liez-le dans le <head>.",
    });
  }

  if (!hasPrivacyLink) {
    findings.push({
      id: "privacy-link",
      pillar: "rgpd",
      severity: "critique",
      title: "Politique de confidentialité non trouvée",
      detail: "Aucun lien évident vers une politique de confidentialité.",
      recommendation: "Publiez une page conformité RGPD et liez-la en footer.",
    });
  }

  if (!hasCookiesLink) {
    findings.push({
      id: "cookies-policy",
      pillar: "rgpd",
      severity: "majeur",
      title: "Politique cookies non trouvée",
      detail: "Aucun lien évident vers une politique cookies.",
      recommendation: "Documentez finalités, durées et partenaires (ePrivacy).",
    });
  }

  if (!hasConsentHints) {
    findings.push({
      id: "consent-banner",
      pillar: "rgpd",
      severity: "critique",
      title: "Bannière / gestionnaire de consentement non détecté",
      detail: "Aucun signal de consentement cookies dans le HTML initial.",
      recommendation: "Implémentez un CMP granulaire (analytics / ads) avant tout tag non essentiel.",
    });
  }

  if ((hasGtag || hasGtm || hasAdsTag) && !hasConsentHints) {
    findings.push({
      id: "trackers-without-consent",
      pillar: "google_sea",
      severity: "critique",
      title: "Tags Google détectés sans signal de consentement",
      detail: "gtag/GTM/Ads présents alors qu’aucun CMP n’est détecté.",
      recommendation: "Conditionnez Analytics et Google Ads au consentement (CNIL / ePrivacy).",
    });
  } else if (!hasGtag && !hasGtm) {
    findings.push({
      id: "no-google-tags",
      pillar: "google_sea",
      severity: "mineur",
      title: "Aucun tag Google Analytics / GTM détecté",
      detail: "Pas de gtag ni GTM dans le HTML initial.",
      recommendation: "Si vous mesurez ou annoncez, branchez GTM après consentement.",
    });
  }

  if (hasAdsTag && hasConsentHints) {
    // ok - informational none
  } else if (!hasAdsTag && (hasGtag || hasGtm)) {
    findings.push({
      id: "ads-tag-absent",
      pillar: "google_sea",
      severity: "mineur",
      title: "Pas de tag Google Ads (AW-) détecté",
      detail: "Mesure présente, conversion Ads non détectée dans le HTML.",
      recommendation: "Ajoutez le tag conversions Ads derrière le consentement publicitaire.",
    });
  }

  if (!hasMentionsLink) {
    findings.push({
      id: "mentions-legales",
      pillar: "legal_fr",
      severity: "critique",
      title: "Mentions légales non trouvées",
      detail: "Obligation d’information (LCEN) non détectée via lien évident.",
      recommendation: "Ajoutez une page Mentions légales (éditeur, hébergeur, contact).",
    });
  }

  if (!siretMention && hasMentionsLink) {
    findings.push({
      id: "siret-missing",
      pillar: "legal_fr",
      severity: "majeur",
      title: "SIRET / RCS non détecté sur la page scannée",
      detail: "Heuristique : pas de mention SIRET/RCS dans le HTML récupéré.",
      recommendation: "Vérifiez que la page mentions légales expose SIRET, RCS et TVA.",
    });
  }

  // robots.txt & sitemap
  try {
    const origin = new URL(finalUrl).origin;
    const robots = await fetch(`${origin}/robots.txt`, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "MeridianAuditBot/1.0" },
    });
    if (!robots.ok) {
      findings.push({
        id: "robots-txt",
        pillar: "seo",
        severity: "majeur",
        title: "robots.txt inaccessible",
        detail: `HTTP ${robots.status} sur /robots.txt`,
        recommendation: "Publiez un robots.txt autorisant l’indexation des pages utiles.",
      });
    } else {
      const body = await robots.text();
      if (!/sitemap:/i.test(body)) {
        findings.push({
          id: "robots-sitemap",
          pillar: "seo",
          severity: "mineur",
          title: "Sitemap non déclaré dans robots.txt",
          detail: "Aucune directive Sitemap: trouvée.",
          recommendation: "Ajoutez Sitemap: https://…/sitemap.xml dans robots.txt.",
        });
      }
    }
  } catch {
    findings.push({
      id: "robots-fetch",
      pillar: "seo",
      severity: "mineur",
      title: "Impossible de vérifier robots.txt",
      detail: "Timeout ou erreur réseau.",
      recommendation: "Vérifiez manuellement robots.txt et le sitemap XML.",
    });
  }

  void hasRobotsMeta;
  void lower;

  return {
    findings,
    meta: {
      finalUrl,
      status: res.status,
      https,
      title,
      hasCanonical,
      hasRobotsMeta,
      hasJsonLd,
      hasManifestLink,
      hasPrivacyLink,
      hasCookiesLink,
      hasMentionsLink,
      hasConsentHints,
      hasGtag,
      hasGtm,
      hasAdsTag,
      siretMention,
    },
  };
}
