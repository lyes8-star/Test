export type Severity = "critique" | "majeur" | "mineur";

export type AuditFinding = {
  id: string;
  pillar:
    | "seo"
    | "pwa"
    | "a11y"
    | "google_sea"
    | "rgpd"
    | "legal_fr"
    | "performance";
  severity: Severity;
  title: string;
  detail: string;
  recommendation: string;
};

export type PillarScore = {
  id: AuditFinding["pillar"];
  label: string;
  score: number;
  findings: AuditFinding[];
};

export type SiteAuditReport = {
  url: string;
  scannedAt: string;
  overallScore: number;
  pillars: PillarScore[];
  findings: AuditFinding[];
  disclaimer: string;
};

export const PILLAR_LABELS: Record<AuditFinding["pillar"], string> = {
  seo: "SEO technique",
  pwa: "PWA / Web App",
  a11y: "Accessibilité",
  google_sea: "Google / SEA",
  rgpd: "RGPD FR & UE",
  legal_fr: "Mentions légales FR",
  performance: "Performance",
};
