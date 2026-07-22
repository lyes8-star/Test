"use client";

import { FormEvent, useState } from "react";
import { formulas } from "@/lib/site";

type Props = { onSuccess?: () => void; formulaId?: string };

export function QuoteForm({ onSuccess, formulaId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
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
      onSuccess?.();
    } catch {
      setStatus("error");
      setMessage("Envoi impossible pour le moment. Merci de réessayer.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="devis-name">Nom / société *</label>
          <input id="devis-name" name="name" required autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor="devis-email">E-mail *</label>
          <input id="devis-email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="devis-phone">Téléphone</label>
          <input id="devis-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="devis-formula">Formule *</label>
          <select id="devis-formula" name="formula" required defaultValue={formulaId ?? "croissance"}>
            {formulas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
            <option value="autre">Autre / à définir</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="devis-budget">Budget indicatif</label>
        <select id="devis-budget" name="budget" defaultValue="5-10k">
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
          placeholder="Contexte, délais, livrables attendus…"
        />
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
      {message ? (
        <p className={`text-sm ${status === "error" ? "text-[var(--danger)]" : "text-[var(--success)]"}`} role="status">
          {message}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "Envoi…" : "Envoyer la demande"}
      </button>
    </form>
  );
}
