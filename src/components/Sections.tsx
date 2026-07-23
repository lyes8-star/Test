"use client";

import { useState, type KeyboardEvent } from "react";
import { activities, auditProduct, formulas, processSteps, siteConfig } from "@/lib/site";
import { useModal } from "@/components/ModalProvider";

export function Activities() {
  return (
    <section id="activites" className="section bg-white">
      <div className="container">
        <p className="eyebrow reveal-on-scroll text-[var(--signal)]">Activités</p>
        <h2 className="display reveal-on-scroll mt-3 max-w-[16ch] text-[clamp(1.85rem,4vw,2.85rem)] text-[var(--ink)]">
          Quatre leviers pour briller sur Google
        </h2>
        <p
          className="reveal-on-scroll mt-4 max-w-2xl text-lg text-[var(--ink-soft)]"
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          Création, référencement, publicité et optimisation — un dispositif clair pour être visible et
          convertir.
        </p>

        <ol className="mt-12 list-none border-t border-[var(--line)] p-0">
          {activities.map((activity, index) => (
            <li
              key={activity.id}
              className="reveal-on-scroll grid gap-3 border-b border-[var(--line)] py-7 md:grid-cols-[4.5rem_1fr] md:gap-6"
              style={{ ["--reveal-delay" as string]: `${120 + index * 90}ms` }}
            >
              <span
                aria-hidden
                className="display text-[clamp(2rem,4vw,2.6rem)] leading-none tracking-[-0.04em] text-[var(--ink)] opacity-30"
              >
                0{index + 1}
              </span>
              <div>
                <h3 className="display text-[clamp(1.35rem,2.5vw,1.75rem)] text-[var(--ink)]">
                  {activity.title}
                </h3>
                <p className="mt-3 max-w-3xl text-[1.05rem] text-[var(--ink-soft)]">
                  {activity.summary} {activity.points.slice(0, 2).join(" · ")}.
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Formulas() {
  const { open } = useModal();
  const [selected, setSelected] = useState<string>(
    formulas.find((f) => f.featured)?.id ?? formulas[0].id,
  );
  const selectedFormula = formulas.find((f) => f.id === selected) ?? formulas[0];

  function selectFormula(id: string) {
    setSelected(id);
  }

  function onCardKeyDown(e: KeyboardEvent<HTMLElement>, id: string, index: number) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      selectFormula(id);
      return;
    }
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") {
      return;
    }
    e.preventDefault();
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = (index + dir + formulas.length) % formulas.length;
    const nextId = formulas[next].id;
    selectFormula(nextId);
    document.getElementById(`formula-card-${nextId}`)?.focus();
  }

  return (
    <section id="formules" className="section">
      <div className="container">
        <p className="eyebrow reveal-on-scroll text-[var(--signal)]">Formules</p>
        <h2 className="display reveal-on-scroll mt-3 max-w-[16ch] text-[clamp(1.85rem,4vw,2.85rem)] text-[var(--ink)]">
          Formules de valorisation Google
        </h2>
        <p
          className="reveal-on-scroll mt-4 max-w-2xl text-lg text-[var(--ink-soft)]"
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          Sélectionnez une formule, puis demandez un devis — chaque offre reste ajustable.
        </p>

        <div
          role="radiogroup"
          aria-label="Choisir une formule"
          className="mt-12 grid gap-0 border-t border-[var(--line)] lg:grid-cols-3 lg:border-t-0"
        >
          {formulas.map((formula, i) => {
            const isSelected = selected === formula.id;
            return (
              <div
                key={formula.id}
                id={`formula-card-${formula.id}`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`formula-card reveal-on-scroll lift-hover flex cursor-pointer flex-col gap-3 border-b border-[var(--line)] py-7 outline-none lg:border-b-0 lg:border-r lg:px-6 lg:py-8 ${
                  i === 0 ? "lg:pl-0" : ""
                } ${i === formulas.length - 1 ? "lg:border-r-0 lg:pr-0" : ""} ${
                  formula.featured
                    ? "formula-card--featured mx-[-1rem] rounded-[0.75rem] border-none bg-[var(--ink)] px-4 text-[var(--paper)] lg:mx-0 lg:px-6"
                    : "rounded-[0.75rem]"
                } ${isSelected ? "is-selected" : ""}`}
                style={{ ["--reveal-delay" as string]: `${100 + i * 110}ms` }}
                onClick={() => selectFormula(formula.id)}
                onKeyDown={(e) => onCardKeyDown(e, formula.id, i)}
              >
                <div className="flex items-center justify-between gap-3">
                  {formula.featured ? (
                    <span className="inline-flex w-fit rounded-full bg-[var(--signal)] px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.04em] text-white">
                      Recommandé
                    </span>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                      Formule
                    </span>
                  )}
                  <span
                    aria-hidden
                    className={`formula-check grid h-7 w-7 place-items-center rounded-full border text-xs font-bold ${
                      formula.featured
                        ? "border-white/35 text-white"
                        : "border-[var(--line-strong,var(--line))] text-[var(--ink)]"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                </div>
                <h3 className="display text-[1.55rem] tracking-[-0.03em]">{formula.name}</h3>
                <p
                  className={`text-sm ${
                    formula.featured ? "text-[rgba(242,244,247,0.68)]" : "text-[var(--ink-soft)]"
                  }`}
                >
                  {formula.description}
                </p>
                <p className="display text-[2rem] tracking-[-0.03em]">{formula.price}</p>
                <p
                  className={`text-sm ${
                    formula.featured ? "text-[rgba(242,244,247,0.68)]" : "text-[var(--ink-soft)]"
                  }`}
                >
                  {formula.duration}
                </p>
                <ul className="mt-1 flex-1 space-y-2 text-sm opacity-90">
                  {formula.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`btn mt-4 min-h-11 w-fit ${formula.featured ? "btn-primary" : "btn-secondary"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectFormula(formula.id);
                    open("devis", formula.id);
                  }}
                >
                  Demander un devis
                </button>
              </div>
            );
          })}
        </div>

        <div
          className="formula-sticky-bar reveal-on-scroll mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[0.75rem] border border-[var(--line)] bg-white/80 px-4 py-4 backdrop-blur-md"
          style={{ ["--reveal-delay" as string]: "280ms" }}
        >
          <p className="text-sm text-[var(--ink-soft)] sm:text-base">
            Sélection :{" "}
            <strong className="text-[var(--ink)]">{selectedFormula.name}</strong>
            <span className="hidden sm:inline"> — {selectedFormula.price}</span>
          </p>
          <button
            type="button"
            className="btn btn-primary min-h-11"
            onClick={() => open("devis", selectedFormula.id)}
          >
            Continuer avec {selectedFormula.name}
          </button>
        </div>
      </div>
    </section>
  );
}

export function Method() {
  return (
    <section id="methode" className="section bg-white">
      <div className="container">
        <p className="eyebrow reveal-on-scroll text-[var(--signal)]">Méthode</p>
        <h2 className="display reveal-on-scroll mt-3 max-w-[16ch] text-[clamp(1.85rem,4vw,2.85rem)] text-[var(--ink)]">
          De l’audit Google à la performance mesurée
        </h2>
        <p
          className="reveal-on-scroll mt-4 max-w-2xl text-lg text-[var(--ink-soft)]"
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          Un rythme clair, une idée par étape — de la découverte à la mesure.
        </p>
        <div className="mt-10 border-t border-[var(--line)]">
          {processSteps.map((step, i) => (
            <article
              key={step.step}
              className="reveal-on-scroll grid gap-3 border-b border-[var(--line)] py-6 md:grid-cols-[3.5rem_1fr] md:gap-5"
              style={{ ["--reveal-delay" as string]: `${100 + i * 90}ms` }}
            >
              <span className="display text-[1.75rem] tracking-[-0.04em] text-[var(--signal)]">
                {step.step}
              </span>
              <div>
                <h3 className="display text-[1.25rem] tracking-[-0.02em] text-[var(--ink)]">{step.title}</h3>
                <p className="mt-2 text-[var(--ink-soft)]">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Compliance() {
  return (
    <section className="section bg-[var(--ink)] text-[var(--paper)]">
      <div className="container">
        <p className="eyebrow reveal-on-scroll text-[var(--beam)]">Conformité</p>
        <h2 className="display reveal-on-scroll mt-3 max-w-[16ch] text-[clamp(1.85rem,4vw,2.85rem)]">
          SEO, SEA et PWA — conformes FR & UE
        </h2>
        <p
          className="reveal-on-scroll mt-4 max-w-2xl text-lg text-[rgba(242,244,247,0.68)]"
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          Cadre légal et technique pour publier, mesurer et annoncer sans friction.
        </p>
        <ul
          className="reveal-on-scroll mt-8 max-w-3xl space-y-4 text-[rgba(242,244,247,0.86)]"
          style={{ ["--reveal-delay" as string]: "160ms" }}
        >
          <li>
            <strong className="text-white">RGPD & ePrivacy</strong> — consentement cookies granulaire
            (analytics + Google Ads), bases légales et droits des personnes.
          </li>
          <li>
            <strong className="text-white">SEO & Google Ads ready</strong> — métadonnées, JSON-LD,
            sitemap, pages de conversion et tags Ads activés uniquement après consentement.
          </li>
          <li>
            <strong className="text-white">PWA & accessibilité</strong> — site installable, contraste
            soigné, navigation clavier, lien d’évitement ; référentiels{" "}
            <a className="underline text-white" href="/accessibilite">
              WCAG 2.2 · RGAA 4.1 · EAA
            </a>
            .
          </li>
        </ul>
      </div>
    </section>
  );
}

export function ContactCta() {
  const { open } = useModal();

  return (
    <section id="contact" className="section">
      <div className="container grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
        <div>
          <p className="eyebrow reveal-on-scroll text-[var(--signal)]">Contact</p>
          <h2 className="display reveal-on-scroll mt-3 text-[clamp(1.85rem,4vw,2.85rem)] text-[var(--ink)]">
            Parlons de votre prochain jalon
          </h2>
          <p
            className="reveal-on-scroll mt-4 max-w-xl text-lg text-[var(--ink-soft)]"
            style={{ ["--reveal-delay" as string]: "80ms" }}
          >
            Audit Google, site PWA, SEO ou Ads : un premier échange clarifie le périmètre.
          </p>
          <div
            className="reveal-on-scroll mt-8 flex flex-wrap gap-3"
            style={{ ["--reveal-delay" as string]: "140ms" }}
          >
            <button type="button" className="btn btn-primary" onClick={() => open("rdv")}>
              Réserver un créneau
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => open("devis")}>
              Obtenir un devis
            </button>
            <a href="/autodiagnostic" className="btn btn-secondary">
              Autodiagnostic {auditProduct.priceLabel}
            </a>
          </div>
        </div>
        <aside
          className="reveal-on-scroll grid gap-3"
          style={{ ["--reveal-delay" as string]: "180ms" }}
        >
          <p className="eyebrow text-[var(--signal)]">Coordonnées</p>
          <p>
            <a className="font-semibold hover:text-[var(--signal)]" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
          </p>
          <p>
            <a
              className="font-semibold hover:text-[var(--signal)]"
              href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
            >
              {siteConfig.phoneDisplay}
            </a>
          </p>
          <p className="text-[var(--ink-soft)]">
            {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
            {siteConfig.address.city}
          </p>
          <p className="text-sm text-[var(--ink-soft)]">Réponse sous 24 à 48 h ouvrées.</p>
        </aside>
      </div>
    </section>
  );
}

export function AuditTeaser() {
  return (
    <section id="autodiagnostic-teaser" className="section bg-white">
      <div className="container">
        <p className="eyebrow reveal-on-scroll text-[var(--signal)]">Autodiagnostic</p>
        <h2 className="display reveal-on-scroll mt-3 max-w-[16ch] text-[clamp(1.85rem,4vw,2.85rem)] text-[var(--ink)]">
          Scannez votre site avant le brief
        </h2>
        <p
          className="reveal-on-scroll mt-4 max-w-2xl text-lg text-[var(--ink-soft)]"
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          Outil payant ({auditProduct.priceLabel}) : Lighthouse, axe-core et contrôles RGPD / PWA / SEO /
          SEA — rapport de fails exigents, puis RDV Crevia.
        </p>
        <a
          href="/autodiagnostic"
          className="btn btn-primary reveal-on-scroll mt-8 min-h-12 w-fit"
          style={{ ["--reveal-delay" as string]: "140ms" }}
        >
          Lancer l’autodiagnostic
        </a>
      </div>
    </section>
  );
}
