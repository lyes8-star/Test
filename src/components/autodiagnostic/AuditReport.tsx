"use client";

import { useModal } from "@/components/ModalProvider";
import { STANDARD_URLS, type AuditFinding, type SiteAuditReport } from "@/lib/audit/types";
import { auditProduct } from "@/lib/site";

const severityClass: Record<AuditFinding["severity"], string> = {
  critique: "text-[var(--danger)]",
  majeur: "text-[var(--signal)]",
  mineur: "text-[var(--ink-soft)]",
};

export function AuditReportView({
  report,
  scansRemaining,
}: {
  report: SiteAuditReport;
  scansRemaining: number;
}) {
  const { open } = useModal();

  return (
    <section className="mt-14 border-t border-[var(--line)] pt-12" aria-live="polite">
      <p className="eyebrow text-[var(--signal)]">Rapport evidence-based</p>
      <h2 className="display mt-3 text-[clamp(1.85rem,4vw,2.75rem)] text-[var(--ink)]">
        Score global {report.overallScore}/100
      </h2>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        URL scannée : <span className="text-[var(--ink)]">{report.url}</span>
        <br />
        Scans restants : {scansRemaining} · {new Date(report.scannedAt).toLocaleString("fr-FR")}
      </p>

      {report.cwv ? (
        <dl className="mt-8 grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">LCP</dt>
            <dd className="display mt-1 text-2xl text-[var(--ink)]">
              {report.cwv.lcpMs != null ? `${(report.cwv.lcpMs / 1000).toFixed(2)} s` : "—"}
            </dd>
            <dd className="text-xs text-[var(--ink-soft)]">seuil Good ≤ 2,5 s</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">CLS</dt>
            <dd className="display mt-1 text-2xl text-[var(--ink)]">
              {report.cwv.cls != null ? report.cwv.cls.toFixed(3) : "—"}
            </dd>
            <dd className="text-xs text-[var(--ink-soft)]">seuil Good ≤ 0,1</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">INP / TBT</dt>
            <dd className="display mt-1 text-2xl text-[var(--ink)]">
              {report.cwv.inpMs != null
                ? `${Math.round(report.cwv.inpMs)} ms`
                : report.cwv.tbtMs != null
                  ? `${Math.round(report.cwv.tbtMs)} ms TBT`
                  : "—"}
            </dd>
            <dd className="text-xs text-[var(--ink-soft)]">seuil Good ≤ 200 ms</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">TTFB</dt>
            <dd className="display mt-1 text-2xl text-[var(--ink)]">
              {report.cwv.ttfbMs != null ? `${Math.round(report.cwv.ttfbMs)} ms` : "—"}
            </dd>
            <dd className="text-xs text-[var(--ink-soft)]">cible lab ≤ 800 ms</dd>
          </div>
        </dl>
      ) : null}

      <ol className="mt-10 list-none space-y-0 border-t border-[var(--line)] p-0">
        {report.pillars.map((p) => (
          <li key={p.id} className="grid gap-2 border-b border-[var(--line)] py-6 md:grid-cols-[8rem_1fr]">
            <p className="display text-[2rem] tracking-[-0.04em] text-[var(--signal)]">{p.score}</p>
            <div>
              <h3 className="display text-[1.25rem] text-[var(--ink)]">{p.label}</h3>
              {p.scoreSource ? (
                <p className="mt-1 text-xs text-[var(--ink-soft)]">{p.scoreSource}</p>
              ) : null}
              {p.findings.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--success)]">Aucun fail détecté sur ce pilier.</p>
              ) : (
                <ul className="mt-3 space-y-4">
                  {p.findings.map((f) => (
                    <li key={f.id}>
                      <p className={`text-sm font-semibold uppercase tracking-[0.08em] ${severityClass[f.severity]}`}>
                        {f.severity}
                        {f.informational ? " · info" : ""}
                      </p>
                      <p className="mt-1 font-semibold text-[var(--ink)]">{f.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">{f.detail}</p>
                      {f.metric || f.threshold ? (
                        <p className="mt-1 text-sm text-[var(--ink)]">
                          Mesure : {f.metric ?? "—"}
                          {f.threshold ? ` · Seuil : ${f.threshold}` : ""}
                        </p>
                      ) : null}
                      {f.standard ? (
                        <p className="mt-1 text-sm">
                          Norme :{" "}
                          {f.standardUrl ? (
                            <a
                              className="underline decoration-[var(--signal)] underline-offset-2"
                              href={f.standardUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {f.standard}
                            </a>
                          ) : (
                            f.standard
                          )}
                        </p>
                      ) : null}
                      {f.evidence && f.evidence.length > 0 ? (
                        <p className="mt-1 text-xs text-[var(--ink-soft)]">
                          Preuve : {f.evidence.slice(0, 6).join(" · ")}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm text-[var(--ink)]">→ {f.recommendation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 max-w-3xl border-t border-[var(--line)] pt-8">
        <h3 className="display text-[1.2rem] text-[var(--ink)]">Méthodologie & sources</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--ink-soft)]">
          {(report.methodology || []).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--ink-soft)]">
          Références :{" "}
          <a className="underline" href={STANDARD_URLS.cwv} target="_blank" rel="noreferrer">
            Core Web Vitals
          </a>
          {" · "}
          <a className="underline" href={STANDARD_URLS.wcag} target="_blank" rel="noreferrer">
            WCAG 2.1
          </a>
          {" · "}
          <a className="underline" href={STANDARD_URLS.axe} target="_blank" rel="noreferrer">
            axe-core
          </a>
          {" · "}
          <a className="underline" href={STANDARD_URLS.cnilCookies} target="_blank" rel="noreferrer">
            CNIL cookies
          </a>
          {" · "}
          <a className="underline" href={STANDARD_URLS.owaspHeaders} target="_blank" rel="noreferrer">
            OWASP headers
          </a>
        </p>
        <p className="mt-4 text-sm text-[var(--ink-soft)]">{report.disclaimer}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary min-h-11" onClick={() => open("rdv")}>
          Prendre rendez-vous
        </button>
        <button type="button" className="btn btn-secondary min-h-11" onClick={() => open("devis")}>
          Demander un devis correction
        </button>
      </div>

      <p className="mt-6 text-xs text-[var(--ink-soft)]">
        Piliers : {auditProduct.pillars.join(" · ")}
      </p>
    </section>
  );
}
