"use client";

import { FormEvent, useState } from "react";

type Props = { onSuccess?: () => void };

export function AppointmentForm({ onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState({
    name: "",
    email: "",
    phone: "",
    type: "visio",
    date: "",
    slot: "10:00",
    message: "",
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 3) {
      const form = e.currentTarget;
      const fd = new FormData(form);
      if (step === 1) {
        const name = String(fd.get("name") || "");
        const email = String(fd.get("email") || "");
        if (name.length < 2 || !email.includes("@")) {
          setStatus("error");
          setMessage("Complétez nom et e-mail valides.");
          return;
        }
        setSummary((s) => ({
          ...s,
          name,
          email,
          phone: String(fd.get("phone") || ""),
          type: String(fd.get("type") || "visio"),
        }));
      }
      if (step === 2) {
        const date = String(fd.get("date") || "");
        const slot = String(fd.get("slot") || "10:00");
        if (!date) {
          setStatus("error");
          setMessage("Choisissez une date.");
          return;
        }
        setSummary((s) => ({
          ...s,
          date,
          slot,
          message: String(fd.get("message") || ""),
        }));
      }
      setStatus("idle");
      setMessage("");
      setStep((s) => s + 1);
      return;
    }

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
      setStep(1);
      onSuccess?.();
    } catch {
      setStatus("error");
      setMessage("Impossible d’envoyer la demande. Réessayez ou contactez-nous.");
    }
  }

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
              <label htmlFor="rdv-name">Nom complet *</label>
              <input id="rdv-name" name="name" required autoComplete="name" defaultValue={summary.name} />
            </div>
            <div className="field">
              <label htmlFor="rdv-email">E-mail *</label>
              <input
                id="rdv-email"
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
              <label htmlFor="rdv-phone">Téléphone</label>
              <input id="rdv-phone" name="phone" type="tel" autoComplete="tel" />
            </div>
            <div className="field">
              <label htmlFor="rdv-type">Type d’échange *</label>
              <select id="rdv-type" name="type" required defaultValue={summary.type}>
                <option value="visio">Visio (30 min)</option>
                <option value="presentiel">Présentiel Paris (45 min)</option>
                <option value="telephone">Téléphone (20 min)</option>
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
          <input type="hidden" name="type" value={summary.type} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="rdv-date">Date souhaitée *</label>
              <input id="rdv-date" name="date" type="date" required defaultValue={summary.date} />
            </div>
            <div className="field">
              <label htmlFor="rdv-slot">Créneau *</label>
              <select id="rdv-slot" name="slot" required defaultValue={summary.slot}>
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
            <textarea
              id="rdv-message"
              name="message"
              defaultValue={summary.message}
              placeholder="Ex. lancer un site, clarifier mon offre…"
            />
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <input type="hidden" name="name" value={summary.name} />
          <input type="hidden" name="email" value={summary.email} />
          <input type="hidden" name="phone" value={summary.phone} />
          <input type="hidden" name="type" value={summary.type} />
          <input type="hidden" name="date" value={summary.date} />
          <input type="hidden" name="slot" value={summary.slot} />
          <input type="hidden" name="message" value={summary.message} />
          <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4 text-sm text-[var(--ink)]">
            <p className="font-semibold">Récapitulatif</p>
            <p className="mt-2 text-[var(--ink-soft)]">
              {summary.name} · {summary.email}
              <br />
              {summary.type} · {summary.date} à {summary.slot}
            </p>
          </div>
          <label className="flex items-start gap-3 text-sm text-[var(--ink-soft)]">
            <input type="checkbox" name="consent" required className="mt-1" />
            <span>
              J’accepte que Crevia traite mes données pour organiser ce rendez-vous, conformément à la{" "}
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
          {status === "loading" ? "Envoi…" : step < 3 ? "Continuer" : "Confirmer le rendez-vous"}
        </button>
      </div>
    </form>
  );
}
