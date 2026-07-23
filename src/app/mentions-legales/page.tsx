import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales de ${siteConfig.legalName} — informations éditeur, hébergeur et contact.`,
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <article className="section">
      <div className="container max-w-3xl">
        <p className="eyebrow">Légal</p>
        <h1 className="display mt-3 text-4xl text-[var(--ink)] sm:text-5xl">Mentions légales</h1>
        <p className="mt-4 text-[var(--ink-soft)]">
          Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN).
        </p>

        <div className="prose-legal mt-10 space-y-8 text-[var(--ink)]">
          <section>
            <h2 className="text-xl font-semibold">Éditeur du site</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              {siteConfig.legalName}
              <br />
              {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
              {siteConfig.address.city}, {siteConfig.address.country}
              <br />
              SIRET : {siteConfig.siret} — {siteConfig.rcs}
              <br />
              TVA intracommunautaire : {siteConfig.tva}
              <br />
              Capital social : {siteConfig.capital}
              <br />
              Directeur de la publication : {siteConfig.director}
              <br />
              E-mail :{" "}
              <a className="underline" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
              <br />
              Téléphone : {siteConfig.phoneDisplay}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Hébergement</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              {siteConfig.hosting.name}
              <br />
              {siteConfig.hosting.address}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Propriété intellectuelle</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              L’ensemble des contenus (textes, visuels, marques, code) présents sur ce site est protégé par le
              droit d’auteur et le droit des marques. Toute reproduction non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Responsabilité</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Les informations publiées le sont à titre indicatif. {siteConfig.name} s’efforce d’en assurer
              l’exactitude sans garantir l’absence d’erreurs. Les performances SEO / SEA dépendent de facteurs
              externes (algorithmes Google, concurrence, budget Ads).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Données personnelles</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Voir la{" "}
              <Link className="underline" href="/politique-confidentialite">
                politique de confidentialité
              </Link>{" "}
              et la{" "}
              <Link className="underline" href="/politique-cookies">
                politique cookies
              </Link>
              . Accessibilité :{" "}
              <Link className="underline" href="/accessibilite">
                déclaration WCAG 2.2 / RGAA / EAA
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
