import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Déclaration d’accessibilité",
  description: `Déclaration d’accessibilité de ${siteConfig.legalName} — WCAG 2.2 AA, RGAA 4.1, European Accessibility Act (directive UE 2019/882).`,
  alternates: { canonical: "/accessibilite" },
};

export default function AccessibilitePage() {
  return (
    <article className="section">
      <div className="container max-w-3xl">
        <p className="eyebrow">Légal · Accessibilité</p>
        <h1 className="display mt-3 text-4xl text-[var(--ink)] sm:text-5xl">
          Déclaration d’accessibilité
        </h1>
        <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">
          {siteConfig.legalName} s’engage à rendre son site internet accessible conformément à
          l’article&nbsp;47 de la loi n°&nbsp;2005-102 du 11&nbsp;février&nbsp;2005, au{" "}
          <a
            className="underline"
            href="https://accessibilite.numerique.gouv.fr/"
            target="_blank"
            rel="noreferrer"
          >
            RGAA&nbsp;4.1
          </a>{" "}
          (référentiel France), aux{" "}
          <a className="underline" href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noreferrer">
            WCAG&nbsp;2.2
          </a>{" "}
          niveau&nbsp;AA (W3C), et au cadre européen de la{" "}
          <a
            className="underline"
            href="https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32019L0882"
            target="_blank"
            rel="noreferrer"
          >
            directive (UE)&nbsp;2019/882
          </a>{" "}
          (European Accessibility Act).
        </p>

        <div className="prose-legal mt-10 space-y-8 text-[var(--ink)]">
          <section>
            <h2 className="text-xl font-semibold">État de conformité</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              <strong className="text-[var(--ink)]">Non conforme</strong> (déclaration modèle) — un
              audit automatisé (Google Lighthouse Accessibility, axe-core WCAG&nbsp;2.2) est en place ;
              un audit humain RGAA complet n’a pas encore été réalisé. Cette page ne constitue pas une
              certification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Périmètre</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Site vitrine {siteConfig.name} (accueil, autodiagnostic, mentions légales, confidentialité,
              cookies) en version statique GitHub Pages et version Next.js App Router.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Technologies utilisées</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--ink-soft)] leading-relaxed">
              <li>HTML5, CSS3, JavaScript</li>
              <li>Next.js (App Router) pour la version applicative</li>
              <li>
                Contrôles automatisés : Lighthouse Accessibility, axe-core (WCAG 2A / 2AA / 2.1 AA /
                2.2 AA)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Améliorations prévues</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--ink-soft)] leading-relaxed">
              <li>Lien d’évitement, landmarks, navigation clavier et focus visible</li>
              <li>Contraste et alternatives textuelles alignés WCAG&nbsp;2.2 AA / RGAA&nbsp;4.1</li>
              <li>Audit expert et schéma pluriannuel d’accessibilité (processus RGAA)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Signaler un problème d’accessibilité :{" "}
              <a className="underline" href={`mailto:${siteConfig.dpo}`}>
                {siteConfig.dpo}
              </a>{" "}
              ou{" "}
              <a className="underline" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>{" "}
              — tél. {siteConfig.phoneDisplay}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Voies de recours</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              Si vous n’obtenez pas de réponse satisfaisante, vous pouvez saisir le{" "}
              <a
                className="underline"
                href="https://www.defenseurdesdroits.fr/"
                target="_blank"
                rel="noreferrer"
              >
                Défenseur des droits
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Autres pages légales</h2>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              <Link className="underline" href="/mentions-legales">
                Mentions légales
              </Link>{" "}
              ·{" "}
              <Link className="underline" href="/politique-confidentialite">
                Confidentialité
              </Link>{" "}
              ·{" "}
              <Link className="underline" href="/politique-cookies">
                Cookies
              </Link>
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
