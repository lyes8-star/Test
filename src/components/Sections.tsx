"use client";

import { activities, formulas, processSteps, siteConfig } from "@/lib/site";
import { useModal } from "@/components/ModalProvider";

export function Activities() {
  return (
    <section id="activites" className="section">
      <div className="container">
        <p className="eyebrow">Activités</p>
        <h2 className="display mt-3 max-w-2xl text-4xl text-[var(--ink)] sm:text-5xl">
          Quatre leviers pour briller sur Google
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-[var(--ink-soft)]">
          Création, référencement, publicité et optimisation — un dispositif clair pour être visible et
          convertir.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {activities.map((activity, index) => (
            <article key={activity.id} className="border-t border-[var(--line)] pt-6">
              <p className="text-sm font-semibold text-[var(--moss)]">0{index + 1}</p>
              <h3 className="display mt-2 text-3xl text-[var(--ink)]">{activity.title}</h3>
              <p className="mt-3 text-[var(--ink-soft)]">{activity.summary}</p>
              <ul className="mt-5 space-y-2 text-sm text-[var(--ink)]">
                {activity.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--amber)]" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Formulas() {
  const { open } = useModal();

  return (
    <section id="formules" className="section bg-[rgba(255,255,255,0.45)]">
      <div className="container">
        <p className="eyebrow">Formules</p>
        <h2 className="display mt-3 max-w-2xl text-4xl text-[var(--ink)] sm:text-5xl">
          Formules de valorisation Google
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-[var(--ink-soft)]">
          De l’audit express au dispositif multi-campagnes — chaque formule est ajustable sur devis.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {formulas.map((formula) => (
            <article
              key={formula.id}
              className={`flex flex-col rounded-[1.5rem] p-6 sm:p-7 ${
                formula.featured
                  ? "bg-[var(--forest)] text-white shadow-[var(--shadow)]"
                  : "bg-white/70 ring-1 ring-[var(--line)]"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="display text-3xl">{formula.name}</h3>
                {formula.featured ? (
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sage)]">
                    Recommandé
                  </span>
                ) : null}
              </div>
              <p className={`mt-3 text-sm ${formula.featured ? "text-white/75" : "text-[var(--ink-soft)]"}`}>
                {formula.description}
              </p>
              <p className="mt-5 text-2xl font-semibold">{formula.price}</p>
              <p className={`text-sm ${formula.featured ? "text-white/70" : "text-[var(--ink-soft)]"}`}>
                {formula.duration}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {formula.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span aria-hidden>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn mt-8 ${formula.featured ? "btn-amber" : "btn-primary"}`}
                onClick={() => open("devis", formula.id)}
              >
                Demander un devis
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Method() {
  return (
    <section id="methode" className="section">
      <div className="container">
        <p className="eyebrow">Méthode</p>
        <h2 className="display mt-3 max-w-2xl text-4xl text-[var(--ink)] sm:text-5xl">
          De l’audit Google à la performance mesurée
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => (
            <article key={step.step}>
              <p className="display text-5xl text-[var(--sage)]">{step.step}</p>
              <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">{step.title}</h3>
              <p className="mt-2 text-[var(--ink-soft)]">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Compliance() {
  return (
    <section className="section-tight">
      <div className="container rounded-[2rem] bg-[var(--forest-deep)] px-6 py-10 text-white sm:px-10 sm:py-12">
        <p className="eyebrow text-[var(--sage)]">Conformité</p>
        <h2 className="display mt-3 max-w-3xl text-3xl sm:text-4xl">
          SEO, SEA et PWA — conformes FR & UE
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="font-semibold">RGPD & ePrivacy</h3>
            <p className="mt-2 text-sm text-white/75">
              Consentement cookies granulaire (analytics + Google Ads), bases légales et droits des personnes.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">SEO & Google Ads ready</h3>
            <p className="mt-2 text-sm text-white/75">
              Métadonnées, JSON-LD, sitemap, pages de conversion et tags Ads activés uniquement après consentement.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">PWA & accessibilité</h3>
            <p className="mt-2 text-sm text-white/75">
              Site installable, offline de base, contraste soigné, navigation clavier et lien d’évitement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactCta() {
  const { open } = useModal();

  return (
    <section id="contact" className="section">
      <div className="container grid items-end gap-10 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 className="display mt-3 text-4xl text-[var(--ink)] sm:text-5xl">
            Parlons de votre prochain jalon
          </h2>
          <p className="mt-4 max-w-xl text-lg text-[var(--ink-soft)]">
            Audit Google, site PWA, SEO ou Ads : un premier échange clarifie le périmètre. RDV, devis ou
            chatbot — à vous de choisir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => open("rdv")}>
              Réserver un créneau
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => open("devis")}>
              Obtenir un devis
            </button>
          </div>
        </div>
        <aside className="rounded-[1.5rem] bg-white/70 p-6 ring-1 ring-[var(--line)]">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--moss)]">Coordonnées</p>
          <ul className="mt-4 space-y-3 text-[var(--ink)]">
            <li>
              <a className="font-medium hover:text-[var(--forest)]" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a className="font-medium hover:text-[var(--forest)]" href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li className="text-[var(--ink-soft)]">
              {siteConfig.address.street}, {siteConfig.address.city}
            </li>
          </ul>
          <p className="mt-5 text-sm text-[var(--ink-soft)]">Réponse sous 24 à 48 h ouvrées.</p>
        </aside>
      </div>
    </section>
  );
}
