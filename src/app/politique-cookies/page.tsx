import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique cookies",
  description: `Politique cookies de ${siteConfig.name} — consentement, analytics et Google Ads.`,
  alternates: { canonical: "/politique-cookies" },
};

export default function PolitiqueCookiesPage() {
  return (
    <article className="section">
      <div className="container max-w-3xl">
        <p className="eyebrow">Cookies</p>
        <h1 className="display mt-3 text-4xl text-[var(--ink)] sm:text-5xl">Politique cookies</h1>
        <p className="mt-4 text-[var(--ink-soft)]">
          Conformément à la directive ePrivacy et aux recommandations CNIL. Vous pouvez modifier vos choix
          à tout moment en effaçant le stockage local du site ou en nous contactant.
        </p>

        <div className="mt-10 space-y-8 text-[var(--ink)]">
          <section>
            <h2 className="text-xl font-semibold">Qu’est-ce qu’un cookie ?</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Un cookie est un petit fichier déposé sur votre terminal lors de la visite d’un site. Il
              permet de mémoriser des informations (consentement, préférences, mesure d’audience, publicité).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Catégories utilisées</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--ink-soft)]">
              <li>
                <strong className="text-[var(--ink)]">Nécessaires</strong> — sécurité, session, mémorisation
                du consentement. Toujours actifs (exemptés de consentement lorsque strictement nécessaires).
              </li>
              <li>
                <strong className="text-[var(--ink)]">Analytiques</strong> — compréhension de l’usage du site
                (ex. Google Analytics). Activés uniquement avec votre accord.
              </li>
              <li>
                <strong className="text-[var(--ink)]">Publicitaires / SEA</strong> — mesure et optimisation
                des campagnes Google Ads / remarketing. Activés uniquement avec votre accord.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Gestion du consentement</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Au premier accès, une bannière permet d’accepter, refuser le non-essentiel ou personnaliser.
              Le choix est stocké localement (`crevia_cookie_consent_v1`). Les tags publicitaires et
              analytiques ne doivent être chargés qu’après consentement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Durée</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Preuve / préférence de consentement : jusqu’à 6 mois, puis renouvellement demandé. Cookies
              tiers : selon les politiques des éditeurs (Google).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Plus d’informations</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              <Link className="underline" href="/politique-confidentialite">
                Politique de confidentialité
              </Link>
              {" · "}
              <a className="underline" href={`mailto:${siteConfig.dpo}`}>
                {siteConfig.dpo}
              </a>
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
