"use client";

import { FormEvent, useState } from "react";

type Props = { onSuccess?: () => void };

export function AppointmentForm({ onSuccess }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/rdv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      setStatus("ok");
      setMessage("Votre demande de rendez-vous a bien été enregistrée. Confirmation sous 24 h.");
      form.reset();
      onSuccess?.();
    } catch {
      setStatus("error");
      setMessage("Impossible d’envoyer la demande. Réessayez ou contactez-nous.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="rdv-name">Nom complet *</label>
          <input id="rdv-name" name="name" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="rdv-email">E-mail *</label>
          <input id="rdv-email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="rdv-phone">Téléphone</label>
          <input id="rdv-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="rdv-type">Type d’échange *</label>
          <select id="rdv-type" name="type" required defaultValue="visio">
            <option value="visio">Visio (30 min)</option>
            <option value="presentiel">Présentiel Paris (45 min)</option>
            <option value="telephone">Téléphone (20 min)</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="rdv-date">Date souhaitée *</label>
          <input id="rdv-date" name="date" type="date" required />
        </div>
        <div className="field">
          <label htmlFor="rdv-slot">Créneau *</label>
          <select id="rdv-slot" name="slot" required defaultValue="10:00">
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:30">11:30</option>
            <option value="14:00">14:00</option>
            <option value="15:30">15:30</option>
            <option value="17:00">17:00</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="rdv-message">Objectif de l’échange</label>
        <textarea id="rdv-message" name="message" placeholder="Ex. lancer un site, clarifier mon offre…" />
      </div>
      <label className="flex items-start gap-3 text-sm text-[var(--ink-soft)]">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>
          J’accepte que Meridian traite mes données pour organiser ce rendez-vous, conformément à la{" "}
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
        {status === "loading" ? "Envoi…" : "Confirmer le rendez-vous"}
      </button>
    </form>
  );
}
