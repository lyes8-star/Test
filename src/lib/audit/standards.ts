import {
  CWV_THRESHOLDS,
  STANDARD_URLS,
  type AuditFinding,
  type CwvMetrics,
} from "@/lib/audit/types";

export function cwvFinding(
  id: string,
  title: string,
  metricLabel: string,
  value: number,
  threshold: number,
  unit: "ms" | "score",
  standardUrl: string,
): AuditFinding | null {
  const ok = unit === "score" ? value <= threshold : value <= threshold;
  if (ok) return null;
  const metric =
    unit === "ms"
      ? value >= 1000
        ? `${(value / 1000).toFixed(2)} s`
        : `${Math.round(value)} ms`
      : value.toFixed(3);
  const thresholdLabel =
    unit === "ms"
      ? threshold >= 1000
        ? `≤ ${(threshold / 1000).toFixed(1)} s`
        : `≤ ${threshold} ms`
      : `≤ ${threshold}`;
  return {
    id,
    pillar: "performance",
    severity: value > threshold * 2 ? "critique" : value > threshold * 1.25 ? "majeur" : "mineur",
    title,
    detail: `Mesure lab Lighthouse : ${metricLabel} = ${metric} (seuil Google « Good » ${thresholdLabel}).`,
    recommendation: "Optimisez selon les guides Core Web Vitals (web.dev) : LCP, CLS, INP.",
    metric,
    threshold: thresholdLabel,
    standard: "Core Web Vitals (Google)",
    standardUrl,
    evidence: [`${metricLabel}=${metric}`],
    informational: true,
  };
}

export function extractCwv(audits: Record<string, { numericValue?: number; score?: number | null }> | undefined): CwvMetrics {
  if (!audits) {
    return { lcpMs: null, cls: null, inpMs: null, tbtMs: null, ttfbMs: null };
  }
  const num = (id: string) => {
    const v = audits[id]?.numericValue;
    return typeof v === "number" && !Number.isNaN(v) ? v : null;
  };
  return {
    lcpMs: num("largest-contentful-paint"),
    cls: num("cumulative-layout-shift"),
    inpMs: num("interaction-to-next-paint"),
    tbtMs: num("total-blocking-time"),
    ttfbMs: num("server-response-time"),
  };
}

export function cwvFindingsFromMetrics(cwv: CwvMetrics): AuditFinding[] {
  const out: AuditFinding[] = [];
  if (cwv.lcpMs != null) {
    const f = cwvFinding(
      "cwv-lcp",
      "LCP au-dessus du seuil Google « Good »",
      "LCP",
      cwv.lcpMs,
      CWV_THRESHOLDS.lcpMs,
      "ms",
      STANDARD_URLS.lcp,
    );
    if (f) out.push(f);
  }
  if (cwv.cls != null) {
    const f = cwvFinding(
      "cwv-cls",
      "CLS au-dessus du seuil Google « Good »",
      "CLS",
      cwv.cls,
      CWV_THRESHOLDS.cls,
      "score",
      STANDARD_URLS.cls,
    );
    if (f) out.push(f);
  }
  const interact = cwv.inpMs ?? cwv.tbtMs;
  const interactLabel = cwv.inpMs != null ? "INP" : "TBT";
  const interactThreshold = cwv.inpMs != null ? CWV_THRESHOLDS.inpMs : CWV_THRESHOLDS.tbtMs;
  if (interact != null) {
    const f = cwvFinding(
      "cwv-inp",
      `${interactLabel} au-dessus du seuil Google « Good »`,
      interactLabel,
      interact,
      interactThreshold,
      "ms",
      STANDARD_URLS.inp,
    );
    if (f) out.push(f);
  }
  if (cwv.ttfbMs != null && cwv.ttfbMs > CWV_THRESHOLDS.ttfbMs) {
    const f = cwvFinding(
      "cwv-ttfb",
      "TTFB élevé (server-response-time)",
      "TTFB",
      cwv.ttfbMs,
      CWV_THRESHOLDS.ttfbMs,
      "ms",
      STANDARD_URLS.cwv,
    );
    if (f) out.push(f);
  }
  return out;
}

/** Map CWV metrics to 0–100 (100 = all Good). */
export function cwvScore100(cwv: CwvMetrics): number | null {
  const parts: number[] = [];
  const ratio = (value: number, good: number) => Math.max(0, Math.min(100, 100 - ((value - good) / good) * 50));
  if (cwv.lcpMs != null) parts.push(cwv.lcpMs <= CWV_THRESHOLDS.lcpMs ? 100 : ratio(cwv.lcpMs, CWV_THRESHOLDS.lcpMs));
  if (cwv.cls != null) parts.push(cwv.cls <= CWV_THRESHOLDS.cls ? 100 : ratio(cwv.cls, CWV_THRESHOLDS.cls));
  const interact = cwv.inpMs ?? cwv.tbtMs;
  const th = cwv.inpMs != null ? CWV_THRESHOLDS.inpMs : CWV_THRESHOLDS.tbtMs;
  if (interact != null) parts.push(interact <= th ? 100 : ratio(interact, th));
  if (!parts.length) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export const TRACKER_HOST_RE =
  /(google-analytics\.com|googletagmanager\.com|googleadservices\.com|googleads\.g\.doubleclick\.net|doubleclick\.net|googlesyndication\.com|facebook\.net|connect\.facebook\.net|hotjar\.com|segment\.io|clarity\.ms)/i;
