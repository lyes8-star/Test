import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Politique de confidentialité RGPD de ${siteConfig.name} — traitement des données personnelles.`,
  alternates: { canonical: "/politique-confidentialite" },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <article className="section">
      <div className="container max-w-3xl">
        <p className="eyebrow">RGPD</p>
        <h1 className="display mt-3 text-4xl text-[var(--ink)] sm:text-5xl">
          Politique de confidentialité
        </h1>
        <p className="mt-4 text-[var(--ink-soft)]">
          Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés.
        </p>

        <div className="mt-10 space-y-8 text-[var(--ink)]">
          <section>
            <h2 className="text-xl font-semibold">Responsable de traitement</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              {siteConfig.legalName} — {siteConfig.address.street},{" "}
              {siteConfig.address.postalCode} {siteConfig.address.city}.
              <br />
              Contact :{" "}
              <a className="underline" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
              <br />
              Délégué à la protection des données (DPO) :{" "}
              <a className="underline" href={`mailto:${siteConfig.dpo}`}>
                {siteConfig.dpo}
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Données collectées</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--ink-soft)]">
              <li>Formulaire rendez-vous : identité, e-mail, téléphone, créneau, message</li>
              <li>Formulaire devis : identité / société, e-mail, téléphone, formule, budget, besoin</li>
              <li>Chatbot : messages échangés (non stockés de façon persistante côté démo)</li>
              <li>Cookies : selon vos choix (voir politique cookies)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Finalités & bases légales</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--ink-soft)]">
              <li>Répondre aux demandes RDV / devis — exécution de mesures précontractuelles (art. 6.1.b)</li>
              <li>Assurer le fonctionnement du site — intérêt légitime (art. 6.1.f)</li>
              <li>Mesure d’audience / publicité SEA — consentement (art. 6.1.a)</li>
              <li>Obligations légales comptables / fiscales — obligation légale (art. 6.1.c)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Durées de conservation</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Demandes commerciales : 3 ans après le dernier contact. Preuves de consentement cookies :
              durée du consentement + 6 mois. Données contractuelles : durée légale applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Destinataires & transferts</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Accès limité aux équipes {siteConfig.name} et prestataires techniques (hébergement). En cas
              de transfert hors UE (ex. hébergeur américain), des garanties appropriées (clauses types
              Commission européenne) sont mises en place.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Vos droits</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Accès, rectification, effacement, limitation, opposition, portabilité, et retrait du
              consentement. Exercice via {siteConfig.dpo}. Réclamation possible auprès de la CNIL
              (www.cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Cookies</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Détails dans la{" "}
              <Link className="underline" href="/politique-cookies">
                politique cookies
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
