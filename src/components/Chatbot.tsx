"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useModal } from "@/components/ModalProvider";
import { siteConfig } from "@/lib/site";
import {
  FAQ_STARTERS,
  buildMailto,
  isValidEmail,
  leadPrompt,
  type ChatAction,
  type LeadStep,
  wantsLead,
} from "@/lib/chat";

type Msg = {
  role: "bot" | "user";
  text: string;
  actions?: ChatAction[];
};

type LeadDraft = {
  name: string;
  email: string;
  phone: string;
  need: string;
};

const INITIAL_BOT: Msg = {
  role: "bot",
  text: "Bonjour, je suis l’assistant Meridian. Questions sur la création PWA, le SEO, Google Ads, les formules — ou laissez vos coordonnées pour être recontacté·e.",
  actions: ["lead", "rdv", "devis"],
};

export function Chatbot() {
  const { open: openModal } = useModal();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_BOT]);
  const [suggestions, setSuggestions] = useState<string[]>([...FAQ_STARTERS]);
  const [leadStep, setLeadStep] = useState<LeadStep | null>(null);
  const [draft, setDraft] = useState<LeadDraft>({
    name: "",
    email: "",
    phone: "",
    need: "",
  });
  const draftRef = useRef<LeadDraft>(draft);
  const [lastLead, setLastLead] = useState<LeadDraft | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  function updateDraft(patch: Partial<LeadDraft>) {
    const next = { ...draftRef.current, ...patch };
    draftRef.current = next;
    setDraft(next);
    return next;
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const mailtoHref = useMemo(() => {
    if (!lastLead) return `mailto:${siteConfig.email}`;
    return buildMailto({
      emailTo: siteConfig.email,
      name: lastLead.name,
      email: lastLead.email,
      phone: lastLead.phone || undefined,
      need: lastLead.need,
    });
  }, [lastLead]);

  function pushBot(text: string, actions?: ChatAction[], nextSuggestions?: string[]) {
    setMessages((m) => [...m, { role: "bot", text, actions }]);
    if (nextSuggestions) setSuggestions(nextSuggestions);
  }

  function startLead(fromUserText?: string) {
    if (fromUserText) {
      setMessages((m) => [...m, { role: "user", text: fromUserText }]);
    }
    setLeadStep("name");
    updateDraft({ name: "", email: "", phone: "", need: "" });
    setSuggestions(["Annuler"]);
    pushBot(leadPrompt("name"), undefined, ["Annuler"]);
  }

  function cancelLead() {
    setLeadStep(null);
    updateDraft({ name: "", email: "", phone: "", need: "" });
    pushBot("D’accord, collecte annulée. Posez une question ou choisissez une suggestion.", ["lead", "rdv", "devis"], [
      ...FAQ_STARTERS,
    ]);
  }

  async function submitLead(finalDraft: LeadDraft) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalDraft.name,
          email: finalDraft.email,
          phone: finalDraft.phone,
          need: finalDraft.need,
          consent: true,
        }),
      });
      if (!res.ok) throw new Error("fail");
      setLastLead(finalDraft);
      setLeadStep(null);
      pushBot(
        `Merci ${finalDraft.name}. Votre demande est enregistrée — nous vous recontactons sous 24–48 h ouvrées à ${finalDraft.email}. Vous pouvez aussi ouvrir un e-mail prérempli.`,
        ["mailto", "rdv", "devis"],
        ["Prendre rendez-vous", "Demander un devis", "Formules SEO / SEA ?"],
      );
    } catch {
      pushBot(
        "Impossible d’enregistrer la demande pour le moment. Réessayez, ouvrez un e-mail, ou utilisez le formulaire Devis.",
        ["mailto", "devis", "lead"],
        ["Laisser mes coordonnées", "Demander un devis"],
      );
      setLeadStep(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadAnswer(text: string) {
    const t = text.trim();
    const lower = t.toLowerCase();

    if (/^annuler$/i.test(t)) {
      cancelLead();
      return;
    }

    if (!leadStep) return;

    if (leadStep === "name") {
      if (t.length < 2) {
        pushBot("Indiquez au moins 2 caractères pour le nom / société.", undefined, ["Annuler"]);
        return;
      }
      updateDraft({ name: t });
      setLeadStep("email");
      pushBot(leadPrompt("email"), undefined, ["Annuler"]);
      return;
    }

    if (leadStep === "email") {
      if (!isValidEmail(t)) {
        pushBot("Cet e-mail ne semble pas valide. Exemple : vous@entreprise.fr", undefined, ["Annuler"]);
        return;
      }
      updateDraft({ email: t });
      setLeadStep("phone");
      pushBot(leadPrompt("phone"), undefined, ["Passer", "Annuler"]);
      return;
    }

    if (leadStep === "phone") {
      const phone = /^(passer|skip|non)$/i.test(t) ? "" : t;
      updateDraft({ phone });
      setLeadStep("need");
      pushBot(leadPrompt("need"), undefined, ["Annuler"]);
      return;
    }

    if (leadStep === "need") {
      if (t.length < 3) {
        pushBot("Décrivez brièvement votre besoin (au moins quelques mots).", undefined, ["Annuler"]);
        return;
      }
      updateDraft({ need: t });
      setLeadStep("consent");
      pushBot(leadPrompt("consent"), undefined, ["J’accepte", "Annuler"]);
      return;
    }

    if (leadStep === "consent") {
      if (!/^(j[’']?accepte|oui|ok|d[’']?accord|accepte)$/i.test(lower)) {
        pushBot(
          "Pour envoyer la demande, répondez « j’accepte » (consentement RGPD). Ou « Annuler ».",
          undefined,
          ["J’accepte", "Annuler"],
        );
        return;
      }
      await submitLead(draftRef.current);
    }
  }

  async function sendFaq(text: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const json = await res.json();
      if (json.startLead || wantsLead(text)) {
        setLeadStep("name");
        updateDraft({ name: "", email: "", phone: "", need: "" });
        setSuggestions(["Annuler"]);
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            text: json.reply || leadPrompt("name"),
          },
        ]);
        return;
      }
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: json.reply || "Je n’ai pas pu répondre.",
          actions: json.actions,
        },
      ]);
      if (Array.isArray(json.suggestions) && json.suggestions.length) {
        setSuggestions(json.suggestions);
      } else {
        setSuggestions([...FAQ_STARTERS]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "Connexion interrompue. Réessayez ou utilisez Devis / RDV.",
          actions: ["devis", "rdv", "lead"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed }]);

    if (leadStep) {
      await handleLeadAnswer(trimmed);
      return;
    }

    if (wantsLead(trimmed) || /laisser mes coordonnées|être recontacté/i.test(trimmed)) {
      setLeadStep("name");
      updateDraft({ name: "", email: "", phone: "", need: "" });
      setSuggestions(["Annuler"]);
      pushBot(leadPrompt("name"), undefined, ["Annuler"]);
      return;
    }

    if (/demander un devis/i.test(trimmed)) {
      pushBot("J’ouvre le formulaire de devis.", ["devis"], [...FAQ_STARTERS]);
      openModal("devis");
      return;
    }

    if (/prendre rendez-vous/i.test(trimmed)) {
      pushBot("J’ouvre la prise de rendez-vous.", ["rdv"], [...FAQ_STARTERS]);
      openModal("rdv");
      return;
    }

    await sendFaq(trimmed);
  }

  function onAction(action: ChatAction) {
    if (action === "lead") {
      startLead("Laisser mes coordonnées");
      return;
    }
    if (action === "rdv") {
      openModal("rdv");
      pushBot("Formulaire rendez-vous ouvert.", ["lead"], [...FAQ_STARTERS]);
      return;
    }
    if (action === "devis") {
      openModal("devis");
      pushBot("Formulaire devis ouvert.", ["lead"], [...FAQ_STARTERS]);
      return;
    }
    if (action === "mailto") {
      window.location.href = mailtoHref;
    }
  }

  function onChip(label: string) {
    if (label === "Annuler" && leadStep) {
      setMessages((m) => [...m, { role: "user", text: "Annuler" }]);
      cancelLead();
      return;
    }
    if (label === "J’accepte" && leadStep === "consent") {
      void send("j’accepte");
      return;
    }
    if (label === "Passer" && leadStep === "phone") {
      void send("passer");
      return;
    }
    if (label === "Demander un devis") {
      void send("Demander un devis");
      return;
    }
    if (label === "Prendre rendez-vous") {
      void send("Prendre rendez-vous");
      return;
    }
    void send(label);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const placeholder = leadStep
    ? leadStep === "consent"
      ? "j’accepte ou Annuler…"
      : leadStep === "phone"
        ? "Téléphone ou « passer »…"
        : "Votre réponse…"
    : "Posez votre question…";

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          id="chat-panel"
          aria-label="Assistant conversationnel"
          className="flex h-[min(520px,72vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 bg-[var(--ink)] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Assistant Meridian</p>
              <p className="text-xs text-white/75">
                {leadStep ? "Collecte de coordonnées · RGPD" : "FAQ + demande de rappel"}
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold transition-transform active:scale-[0.97]"
              onClick={() => setOpen(false)}
            >
              Fermer
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={`${m.role}-${i}`} className="space-y-2">
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "bot"
                      ? "bg-[var(--mist)] text-[var(--ink)]"
                      : "ml-auto bg-[var(--ink)] text-white"
                  }`}
                >
                  {m.text.includes("/politique-confidentialite") ? (
                    <>
                      {m.text.split("/politique-confidentialite")[0]}
                      <Link
                        href="/politique-confidentialite"
                        className="font-semibold text-[var(--signal)] underline underline-offset-2"
                      >
                        politique de confidentialité
                      </Link>
                      {m.text.split("/politique-confidentialite")[1] ?? ""}
                    </>
                  ) : (
                    m.text
                  )}
                </div>
                {m.role === "bot" && m.actions?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {m.actions.map((action) => (
                      <button
                        key={`${i}-${action}`}
                        type="button"
                        className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)] transition-transform hover:border-[var(--ink)] active:scale-[0.97]"
                        onClick={() => onAction(action)}
                      >
                        {action === "lead"
                          ? "Laisser mes coordonnées"
                          : action === "rdv"
                            ? "Rendez-vous"
                            : action === "devis"
                              ? "Devis"
                              : "Ouvrir un e-mail"}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? <p className="text-xs text-[var(--ink-soft)]">Rédaction…</p> : null}
            <div ref={endRef} />
          </div>

          {suggestions.length ? (
            <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-[var(--line)] px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip shrink-0 rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-[var(--ink-soft)] transition-transform hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-[0.97]"
                  onClick={() => onChip(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="flex shrink-0 gap-2 border-t border-[var(--line)] p-3">
            <label className="sr-only" htmlFor="chat-input">
              Votre message
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm"
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary !min-h-10 !px-4" disabled={loading}>
              Envoyer
            </button>
          </form>
        </section>
      ) : (
        <button
          id="chat-launcher"
          type="button"
          className="btn btn-primary shadow-[var(--shadow)]"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls="chat-panel"
        >
          Une question ?
        </button>
      )}
    </div>
  );
}
