import type { Metadata } from "next";
import { AuditTool } from "@/components/autodiagnostic/AuditTool";
import { auditProduct, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Autodiagnostic site — ${siteConfig.name}`,
  description:
    "Autodiagnostic exigence Google, PWA, SEO, SEA, RGPD FR/UE et accessibilité. Paiement Stripe one-shot, rapport de fails actionnable.",
  alternates: { canonical: `${siteConfig.url}/autodiagnostic` },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AutodiagnosticPage({ searchParams }: Props) {
  const sp = await searchParams;
  const rawUrl = typeof sp.url === "string" ? sp.url : "";
  const canceled = sp.canceled === "1";

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--ink)] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(125,211,252,0.35), transparent 55%), linear-gradient(105deg, transparent 40%, rgba(255,90,31,0.18) 52%, transparent 65%)",
          }}
        />
        <div className="container relative py-20 sm:py-24">
          <p className="eyebrow text-[var(--beam)]">Autodiagnostic</p>
          <p className="display mt-4 text-[clamp(2.5rem,10vw,5rem)] leading-[0.9] tracking-[-0.05em]">
            {siteConfig.name}
          </p>
          <h1 className="display mt-5 max-w-[18ch] text-[clamp(1.6rem,4vw,2.6rem)] leading-[1.05]">
            Exigence Google, PWA, SEO, SEA, RGPD & accessibilité
          </h1>
          <p className="mt-5 max-w-[40ch] text-lg text-[rgba(242,244,247,0.8)]">
            Un vrai scan open source (Lighthouse, axe-core, heuristiques HTTP) — {auditProduct.priceLabel},{" "}
            {auditProduct.scansIncluded} passages, {auditProduct.validityDays} jours.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow text-[var(--signal)]">Parcours</p>
          <h2 className="display mt-3 max-w-[18ch] text-[clamp(1.75rem,3.5vw,2.5rem)] text-[var(--ink)]">
            Payez, débloquez, scannez
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-[var(--ink-soft)]">
            Paiement Stripe Checkout. Après validation, l’outil analyse votre URL publique et liste les
            fails par pilier — diagnostic technique, pas un avis juridique.
          </p>

          <ul className="mt-10 grid gap-6 border-t border-[var(--line)] pt-8 sm:grid-cols-3">
            {auditProduct.pillars.map((p) => (
              <li key={p} className="text-[var(--ink)]">
                <span className="display text-[1.15rem]">{p}</span>
              </li>
            ))}
          </ul>

          <AuditTool initialUrl={rawUrl} canceled={canceled} />
        </div>
      </section>
    </>
  );
}
