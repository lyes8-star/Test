"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { WELCOME_GUIDE_KEY, welcomeGuideOptions } from "@/lib/site";

const COOKIE_KEY = "crevia_cookie_consent_v1";

function hasCookieConsent(): boolean {
  try {
    return Boolean(localStorage.getItem(COOKIE_KEY));
  } catch {
    return false;
  }
}

function hasGuideDecision(): boolean {
  try {
    return Boolean(localStorage.getItem(WELCOME_GUIDE_KEY));
  } catch {
    return false;
  }
}

function saveGuideDecision(choice: string) {
  try {
    localStorage.setItem(
      WELCOME_GUIDE_KEY,
      JSON.stringify({ choice, at: new Date().toISOString() }),
    );
  } catch {
    /* ignore */
  }
}

function IconSite() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="6" y="8" width="28" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 14h28M12 28v4M28 28v4M14 32h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="21" r="3" stroke="var(--signal)" strokeWidth="1.6" />
    </svg>
  );
}

function IconGoogle() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="18" cy="18" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M24 24l8 8" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 18h6M18 15v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconAudit() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M12 8h12l6 6v16a2 2 0 01-2 2H12a2 2 0 01-2-2V10a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M24 8v6h6M14 20h12M14 25h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="28" cy="28" r="5" stroke="var(--signal)" strokeWidth="1.6" />
      <path d="M28 26v2.5l1.5 1" stroke="var(--signal)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const ICONS = {
  "site-pwa": IconSite,
  "google-seo-sea": IconGoogle,
  autodiagnostic: IconAudit,
} as const;

export function WelcomeGuide() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const firstBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const tryOpen = useCallback(() => {
    if (hasCookieConsent() && !hasGuideDecision()) setOpen(true);
  }, []);

  useEffect(() => {
    tryOpen();
    const onConsent = () => {
      // Laisse la bannière cookies se fermer avant d’afficher le guide
      window.setTimeout(tryOpen, 280);
    };
    window.addEventListener("crevia:consent", onConsent);
    return () => window.removeEventListener("crevia:consent", onConsent);
  }, [tryOpen]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstBtnRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null);
      if (focusable.length < 2) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dismiss stable via closure on open
  }, [open]);

  function dismiss() {
    saveGuideDecision("dismissed");
    setOpen(false);
  }

  function choose(id: (typeof welcomeGuideOptions)[number]["id"], href: string, hash: string | null) {
    saveGuideDecision(id);
    setOpen(false);
    if (hash && (pathname === "/" || pathname === "")) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className="welcome-guide-overlay" role="presentation">
      <div
        ref={dialogRef}
        className="welcome-guide-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button type="button" className="welcome-guide-close" aria-label="Fermer" onClick={dismiss}>
          ✕
        </button>
        <h2 id={titleId} className="welcome-guide-title display">
          Vous cherchez
        </h2>
        <ul className="welcome-guide-list">
          {welcomeGuideOptions.map((opt, i) => {
            const Icon = ICONS[opt.id];
            return (
              <li key={opt.id}>
                <button
                  ref={i === 0 ? firstBtnRef : undefined}
                  type="button"
                  className="welcome-guide-option"
                  onClick={() => choose(opt.id, opt.href, opt.hash)}
                >
                  <span className="welcome-guide-option-label">{opt.label}</span>
                  <span className="welcome-guide-option-icon">
                    <Icon />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
