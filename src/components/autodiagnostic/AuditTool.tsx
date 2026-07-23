"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AuditReportView } from "@/components/autodiagnostic/AuditReport";
import type { SiteAuditReport } from "@/lib/audit/types";
import { auditProduct } from "@/lib/site";

type SessionState = {
  unlocked: boolean;
  scansRemaining?: number;
  expiresAt?: string;
  targetUrl?: string;
  token?: string;
};

const STEPS = [
  "Fetch HTTP + en-têtes sécurité (OWASP)",
  "Parse SEO / Open Graph / JSON-LD",
  "robots.txt + sitemap XML",
  "Pages légales RGPD / LCEN",
  "Réseau pré-consentement (trackers)",
  "axe-core WCAG 2.2 AA / RGAA",
  "Lighthouse Accessibility + Core Web Vitals (LCP/CLS/INP)",
] as const;

export function AuditTool({
  initialUrl = "",
  canceled = false,
}: {
  initialUrl?: string;
  canceled?: boolean;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<SessionState>({ unlocked: false });
  const [status, setStatus] = useState<"idle" | "checkout" | "scanning" | "error" | "ok">("idle");
  const [message, setMessage] = useState("");
  const [report, setReport] = useState<SiteAuditReport | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  const refreshSession = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const token = params.get("token");
    const qs = new URLSearchParams();
    if (sessionId) qs.set("session_id", sessionId);
    if (token) qs.set("token", token);
    const res = await fetch(`/api/audit/session?${qs.toString()}`, { cache: "no-store" });
    const json = (await res.json()) as SessionState;
    setSession(json);
    if (json.targetUrl && !url) setUrl(json.targetUrl);
    const urlParam = params.get("url");
    if (urlParam) setUrl(urlParam);
    return json;
  }, [url]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (status !== "scanning") return;
    setStepIdx(0);
    const id = window.setInterval(() => {
      setStepIdx((i) => (i + 1) % STEPS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [status]);

  const canScan = session.unlocked && (session.scansRemaining ?? 0) > 0;

  const priceLabel = useMemo(() => auditProduct.priceLabel, []);

  async function onPay(e: FormEvent) {
    e.preventDefault();
    setStatus("checkout");
    setMessage("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email: email || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Paiement impossible");
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      throw new Error("URL de paiement manquante");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function onScan(e: FormEvent) {
    e.preventDefault();
    setStatus("scanning");
    setMessage("");
    setReport(null);
    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, token: session.token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Scan impossible");
      setReport(json.report);
      setSession((s) => ({ ...s, scansRemaining: json.scansRemaining, unlocked: true }));
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Erreur de scan");
    }
  }

  return (
    <div>
      {canceled ? (
        <p className="mb-6 rounded-[0.75rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--ink-soft)]" role="status">
          Paiement annulé. Vous pouvez relancer quand vous voulez.
        </p>
      ) : null}

      {!session.unlocked ? (
        <form className="mt-10 grid max-w-xl gap-4" onSubmit={onPay}>
          <div className="field">
            <label htmlFor="audit-url">URL du site à diagnostiquer *</label>
            <input
              id="audit-url"
              name="url"
              type="url"
              required
              placeholder="https://www.exemple.fr"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="audit-email">E-mail (reçu Stripe, optionnel)</label>
            <input
              id="audit-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="text-sm text-[var(--ink-soft)]">
            {priceLabel} · {auditProduct.scansIncluded} scans · validité {auditProduct.validityDays}{" "}
            jours. Paiement sécurisé Stripe (sans abonnement plateforme).
          </p>
          <button type="submit" className="btn btn-primary min-h-12 w-fit" disabled={status === "checkout"}>
            {status === "checkout" ? "Redirection…" : `Lancer l’audit — ${priceLabel}`}
          </button>
          {message ? (
            <p className="text-sm text-[var(--danger)]" role="alert">
              {message}
            </p>
          ) : null}
        </form>
      ) : (
        <form className="mt-10 grid max-w-xl gap-4" onSubmit={onScan}>
          <p className="text-sm font-semibold text-[var(--success)]">
            Accès débloqué · {session.scansRemaining} scan(s) restant(s)
          </p>
          <div className="field">
            <label htmlFor="audit-url-run">URL à scanner *</label>
            <input
              id="audit-url-run"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary min-h-12 w-fit"
            disabled={status === "scanning" || !canScan}
          >
            {status === "scanning" ? "Scan en cours…" : "Lancer le diagnostic"}
          </button>
          {status === "scanning" ? (
            <p className="text-sm text-[var(--ink-soft)]" aria-live="polite">
              Étape : {STEPS[stepIdx]}…
            </p>
          ) : null}
          {message ? (
            <p className="text-sm text-[var(--danger)]" role="alert">
              {message}
            </p>
          ) : null}
        </form>
      )}

      {report ? <AuditReportView report={report} scansRemaining={session.scansRemaining ?? 0} /> : null}
    </div>
  );
}
