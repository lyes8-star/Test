"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { UiScrim } from "@/components/UiScrim";

const STORAGE_KEY = "crevia_a11y_prefs";

type A11yPrefs = {
  contrast: boolean;
  text: "normal" | "lg" | "xl";
  reducedMotion: boolean;
};

const DEFAULT_PREFS: A11yPrefs = {
  contrast: false,
  text: "normal",
  reducedMotion: false,
};

const HTML_CLASSES = [
  "a11y-contrast",
  "a11y-text-lg",
  "a11y-text-xl",
  "a11y-reduced-motion",
] as const;

function readPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<A11yPrefs>;
    return {
      contrast: Boolean(parsed.contrast),
      text: parsed.text === "lg" || parsed.text === "xl" ? parsed.text : "normal",
      reducedMotion: Boolean(parsed.reducedMotion),
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function applyA11yPrefs(prefs: A11yPrefs) {
  const root = document.documentElement;
  HTML_CLASSES.forEach((c) => root.classList.remove(c));
  if (prefs.contrast) root.classList.add("a11y-contrast");
  if (prefs.text === "lg") root.classList.add("a11y-text-lg");
  if (prefs.text === "xl") root.classList.add("a11y-text-xl");
  if (prefs.reducedMotion) root.classList.add("a11y-reduced-motion");
}

function savePrefs(prefs: A11yPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS);
  const panelId = useId();
  const titleId = useId();
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial = readPrefs();
    setPrefs(initial);
    applyA11yPrefs(initial);
  }, []);

  const update = useCallback((next: A11yPrefs) => {
    setPrefs(next);
    applyA11yPrefs(next);
    savePrefs(next);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    const stickyA11y = document.getElementById("sticky-a11y");
    if (document.body.classList.contains("has-sticky-bar") && stickyA11y) {
      stickyA11y.focus();
    } else {
      fabRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    const onTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusables?.length) return;
      const list = [...focusables];
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onTrap);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keydown", onTrap);
    };
  }, [open, close]);

  return (
    <>
      <UiScrim open={open} onClose={close} />
      <div className="a11y-widget">
      <button
        ref={fabRef}
        type="button"
        className="a11y-fab"
        aria-label="Accessibilité"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="a11y-fab-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="4.5" r="2.25" fill="currentColor" />
            <path
              d="M5 9.5h14M12 9.5v10M8.5 19.5h7M7.5 13.5H4.5M19.5 13.5h-3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="a11y-fab-label">Accessibilité</span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="a11y-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="a11y-panel-head">
            <h2 id={titleId} className="a11y-panel-title">
              Menu accessibilité
            </h2>
            <button type="button" className="a11y-panel-close" onClick={close} aria-label="Fermer">
              ✕
            </button>
          </div>

          <ul className="a11y-options">
            <li>
              <button
                type="button"
                className={`a11y-option ${prefs.contrast ? "is-on" : ""}`}
                aria-pressed={prefs.contrast}
                onClick={() => update({ ...prefs, contrast: !prefs.contrast })}
              >
                Contraste élevé
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`a11y-option ${prefs.text === "lg" ? "is-on" : ""}`}
                aria-pressed={prefs.text === "lg"}
                onClick={() =>
                  update({ ...prefs, text: prefs.text === "lg" ? "normal" : "lg" })
                }
              >
                Texte plus grand
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`a11y-option ${prefs.text === "xl" ? "is-on" : ""}`}
                aria-pressed={prefs.text === "xl"}
                onClick={() =>
                  update({ ...prefs, text: prefs.text === "xl" ? "normal" : "xl" })
                }
              >
                Texte encore plus grand
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`a11y-option ${prefs.reducedMotion ? "is-on" : ""}`}
                aria-pressed={prefs.reducedMotion}
                onClick={() => update({ ...prefs, reducedMotion: !prefs.reducedMotion })}
              >
                Réduire les animations
              </button>
            </li>
          </ul>

          <div className="a11y-panel-foot">
            <Link className="a11y-decl-link" href="/accessibilite" onClick={close}>
              Déclaration d’accessibilité
            </Link>
            <button
              type="button"
              className="btn btn-secondary a11y-reset"
              onClick={() => update({ ...DEFAULT_PREFS })}
            >
              Réinitialiser
            </button>
          </div>
        </div>
      ) : null}
    </div>
    </>
  );
}
