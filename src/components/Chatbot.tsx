"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Msg = { role: "bot" | "user"; text: string };

const starters = [
  "Formules SEO / SEA ?",
  "Google Ads : comment ça marche ?",
  "Création site PWA ?",
  "Prendre rendez-vous",
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Bonjour, je suis l’assistant Meridian. Questions sur la création de site PWA, le SEO, Google Ads, les formules, un RDV ou un devis ?",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { role: "bot", text: json.reply || "Je n’ai pas pu répondre." }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Connexion interrompue. Réessayez ou utilisez le formulaire de contact." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          id="chat-panel"
          aria-label="Assistant conversationnel"
          className="flex h-[min(480px,68vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 bg-[var(--ink)] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Assistant Meridian</p>
              <p className="text-xs text-white/75">Réponses indicatives · données non stockées</p>
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
              <div
                key={`${m.role}-${i}`}
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "bot"
                    ? "bg-[var(--mist)] text-[var(--ink)]"
                    : "ml-auto bg-[var(--ink)] text-white"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading ? <p className="text-xs text-[var(--ink-soft)]">Rédaction…</p> : null}
            <div ref={endRef} />
          </div>
          <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-[var(--line)] px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                className="chip shrink-0 rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-[var(--ink-soft)] transition-transform hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-[0.97]"
                onClick={() => void send(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex shrink-0 gap-2 border-t border-[var(--line)] p-3">
            <label className="sr-only" htmlFor="chat-input">
              Votre message
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question…"
              className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm"
            />
            <button type="submit" className="btn btn-primary !min-h-10 !px-4" disabled={loading}>
              Envoyer
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          className="btn btn-primary shadow-[var(--shadow)]"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls="chat-panel"
        >
          Discuter
        </button>
      )}
    </div>
  );
}
