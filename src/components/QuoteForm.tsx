"use client";

import { FormEvent, useState } from "react";
import { formulas } from "@/lib/site";

type Props = { onSuccess?: () => void; formulaId?: string };

export function QuoteForm({ onSuccess, formulaId }: Props) {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState({
    name: "",
    email: "",
    phone: "",
    formula: formulaId ?? "croissance",
    budget: "5-10k",
    need: "",
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (step < 3) {
      if (step === 1) {
        const name = String(fd.get("name") || "");
        const email = String(fd.get("email") || "");
        if (name.length < 2 || !email.includes("@")) {
          setStatus("error");
          setMessage("Complétez nom / société et e-mail valides.");
          return;
        }
        setSummary((s) => ({
          ...s,
          name,
          email,
          phone: String(fd.get("phone") || ""),
          formula: String(fd.get("formula") || s.formula),
        }));
      }
      if (step === 2) {
        const need = String(fd.get("message") || "");
        if (need.length < 3) {
          setStatus("error");
          setMessage("Décrivez votre besoin.");
          return;
        }
        setSummary((s) => ({
          ...s,
          need,
          budget: String(fd.get("budget") || s.budget),
        }));
      }
      setStatus("idle");
      setMessage("");
      setStep((s) => s + 1);
      return;
    }

    setStatus("loading");
    setMessage("");
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setStatus("ok");
      setMessage("Demande de devis reçue. Nous revenons vers vous sous 48 h.");
      form.reset();
      setStep(1);
      onSuccess?.();
    } catch {
      setStatus("error");
      setMessage("Envoi impossible pour le moment. Merci de réessayer.");
    }
  }

  const formulaName =
    formulas.find((f) => f.id === summary.formula)?.name ?? summary.formula;

  return (
    <form className="grid gap-4" onSubmit={onSubmit} noValidate>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
        Étape {step} / 3
      </p>
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full ${n <= step ? "bg-[var(--signal)]" : "bg-[var(--line)]"}`}
          />
        ))}
      </div>

      {step === 1 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="devis-name">Nom / société *</label>
              <input
                id="devis-name"
                name="name"
                required
                autoComplete="organization"
                defaultValue={summary.name}
              />
            </div>
            <div className="field">
              <label htmlFor="devis-email">E-mail *</label>
              <input
                id="devis-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={summary.email}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="devis-phone">Téléphone</label>
              <input
                id="devis-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={summary.phone}
              />
            </div>
            <div className="field">
              <label htmlFor="devis-formula">Formule *</label>
              <select id="devis-formula" name="formula" required defaultValue={summary.formula}>
                {formulas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
                <option value="autre">Autre / à définir</option>
              </select>
            </div>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <input type="hidden" name="name" value={summary.name} />
          <input type="hidden" name="email" value={summary.email} />
          <input type="hidden" name="phone" value={summary.phone} />
          <input type="hidden" name="formula" value={summary.formula} />
          <div className="field">
            <label htmlFor="devis-budget">Budget indicatif</label>
            <select id="devis-budget" name="budget" defaultValue={summary.budget}>
              <option value="<2k">Moins de 2 000 €</option>
              <option value="2-5k">2 000 – 5 000 €</option>
              <option value="5-10k">5 000 – 10 000 €</option>
              <option value="10k+">Plus de 10 000 €</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="devis-message">Votre besoin *</label>
            <textarea
              id="devis-message"
              name="message"
              required
              defaultValue={summary.need}
              placeholder="Contexte, délais, livrables attendus…"
            />
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <input type="hidden" name="name" value={summary.name} />
          <input type="hidden" name="email" value={summary.email} />
          <input type="hidden" name="phone" value={summary.phone} />
          <input type="hidden" name="formula" value={summary.formula} />
          <input type="hidden" name="budget" value={summary.budget} />
          <input type="hidden" name="message" value={summary.need} />
          <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4 text-sm text-[var(--ink)]">
            <p className="font-semibold">Récapitulatif</p>
            <p className="mt-2 text-[var(--ink-soft)]">
              {summary.name} · {summary.email}
              <br />
              Formule {formulaName} · budget {summary.budget}
              <br />
              {summary.need}
            </p>
          </div>
          <label className="flex items-start gap-3 text-sm text-[var(--ink-soft)]">
            <input type="checkbox" name="consent" required className="mt-1" />
            <span>
              J’autorise Meridian à traiter ces informations pour établir un devis, selon la{" "}
              <a className="underline" href="/politique-confidentialite" target="_blank" rel="noreferrer">
                politique de confidentialité
              </a>
              . *
            </span>
          </label>
        </>
      ) : null}

      {message ? (
        <p className={`text-sm ${status === "error" ? "text-[var(--danger)]" : "text-[var(--success)]"}`} role="status">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {step > 1 ? (
          <button
            type="button"
            className="btn btn-secondary min-h-11"
            onClick={() => {
              setMessage("");
              setStatus("idle");
              setStep((s) => s - 1);
            }}
          >
            Retour
          </button>
        ) : null}
        <button type="submit" className="btn btn-primary min-h-11" disabled={status === "loading"}>
          {status === "loading" ? "Envoi…" : step < 3 ? "Continuer" : "Envoyer la demande"}
        </button>
      </div>
    </form>
  );
}
