"use client";

import { useModal } from "@/components/ModalProvider";
import type { AuditFinding, SiteAuditReport } from "@/lib/audit/types";
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
      <p className="eyebrow text-[var(--signal)]">Rapport</p>
      <h2 className="display mt-3 text-[clamp(1.85rem,4vw,2.75rem)] text-[var(--ink)]">
        Score global {report.overallScore}/100
      </h2>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        URL scannée : <span className="text-[var(--ink)]">{report.url}</span>
        <br />
        Scans restants : {scansRemaining} · {new Date(report.scannedAt).toLocaleString("fr-FR")}
      </p>

      <ol className="mt-10 list-none space-y-0 border-t border-[var(--line)] p-0">
        {report.pillars.map((p) => (
          <li key={p.id} className="grid gap-2 border-b border-[var(--line)] py-6 md:grid-cols-[8rem_1fr]">
            <p className="display text-[2rem] tracking-[-0.04em] text-[var(--signal)]">{p.score}</p>
            <div>
              <h3 className="display text-[1.25rem] text-[var(--ink)]">{p.label}</h3>
              {p.findings.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--success)]">Aucun fail majeur détecté sur ce pilier.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {p.findings.map((f) => (
                    <li key={f.id}>
                      <p className={`text-sm font-semibold uppercase tracking-[0.08em] ${severityClass[f.severity]}`}>
                        {f.severity}
                      </p>
                      <p className="mt-1 font-semibold text-[var(--ink)]">{f.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">{f.detail}</p>
                      <p className="mt-1 text-sm text-[var(--ink)]">→ {f.recommendation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-3xl text-sm text-[var(--ink-soft)]">{report.disclaimer}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary min-h-11" onClick={() => open("rdv")}>
          Prendre rendez-vous
        </button>
        <button type="button" className="btn btn-secondary min-h-11" onClick={() => open("devis")}>
          Demander un devis correction
        </button>
      </div>

      <p className="mt-6 text-xs text-[var(--ink-soft)]">
        Piliers couverts : {auditProduct.pillars.join(" · ")}
      </p>
    </section>
  );
}
