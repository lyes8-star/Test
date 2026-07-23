export type Severity = "critique" | "majeur" | "mineur";

export type AuditPillar =
  | "seo"
  | "pwa"
  | "a11y"
  | "google_sea"
  | "rgpd"
  | "legal_fr"
  | "performance";

export type AuditFinding = {
  id: string;
  pillar: AuditPillar;
  severity: Severity;
  title: string;
  detail: string;
  recommendation: string;
  /** Measured value shown to the user (e.g. "4.2 s", "3 violations") */
  metric?: string;
  /** Official threshold (e.g. "≤ 2.5 s") */
  threshold?: string;
  /** Standard name (Core Web Vitals, WCAG 2.1 AA, CNIL…) */
  standard?: string;
  /** Citation URL */
  standardUrl?: string;
  /** Raw evidence (URLs, headers, request hosts…) */
  evidence?: string[];
  /** When true, finding informs the list but does not deduct from LH-backed pillars */
  informational?: boolean;
};

export type PillarScore = {
  id: AuditPillar;
  label: string;
  score: number;
  findings: AuditFinding[];
  /** How the pillar score was derived */
  scoreSource?: string;
};

export type CwvMetrics = {
  lcpMs: number | null;
  cls: number | null;
  inpMs: number | null;
  tbtMs: number | null;
  ttfbMs: number | null;
};

export type SiteAuditReport = {
  url: string;
  scannedAt: string;
  overallScore: number;
  pillars: PillarScore[];
  findings: AuditFinding[];
  cwv?: CwvMetrics;
  methodology: string[];
  disclaimer: string;
};

export const PILLAR_LABELS: Record<AuditPillar, string> = {
  seo: "SEO technique",
  pwa: "PWA / Web App",
  a11y: "Accessibilité (WCAG 2.2 · RGAA · Lighthouse)",
  google_sea: "Google / SEA",
  rgpd: "RGPD FR & UE",
  legal_fr: "Mentions légales FR",
  performance: "Performance (CWV)",
};

/** Google Core Web Vitals "Good" thresholds (lab / field guidance). */
export const CWV_THRESHOLDS = {
  lcpMs: 2500,
  cls: 0.1,
  inpMs: 200,
  tbtMs: 200,
  ttfbMs: 800,
} as const;

export const STANDARD_URLS = {
  cwv: "https://web.dev/articles/vitals",
  lcp: "https://web.dev/articles/lcp",
  cls: "https://web.dev/articles/cls",
  inp: "https://web.dev/articles/inp",
  lighthouse: "https://developer.chrome.com/docs/lighthouse/overview",
  lighthouseA11y: "https://developer.chrome.com/docs/lighthouse/accessibility",
  wcag: "https://www.w3.org/TR/WCAG21/",
  wcag22: "https://www.w3.org/TR/WCAG22/",
  rgaa: "https://accessibilite.numerique.gouv.fr/",
  eaa: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32019L0882",
  axe: "https://github.com/dequelabs/axe-core",
  cnilCookies: "https://www.cnil.fr/fr/cookies-et-autres-traceurs",
  eprivacy: "https://www.cnil.fr/fr/cookies-et-traceurs-que-dit-la-loi",
  owaspHeaders: "https://owasp.org/www-project-secure-headers/",
  lcen: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000801164",
} as const;
