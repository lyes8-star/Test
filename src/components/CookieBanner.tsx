"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";

type Consent = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  decidedAt: string;
};

const STORAGE_KEY = "crevia_cookie_consent_v1";

function saveConsent(consent: Consent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("crevia:consent", { detail: consent }));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("crevia:consent", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("crevia:consent", onStoreChange);
  };
}

function getConsentSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return "server";
}

export function CookieBanner() {
  const stored = useSyncExternalStore(subscribe, getConsentSnapshot, getServerSnapshot);
  const needsBanner = stored === null;
  const [openPrefs, setOpenPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: true,
      advertising: true,
      decidedAt: new Date().toISOString(),
    });
  }, []);

  const rejectOptional = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: false,
      advertising: false,
      decidedAt: new Date().toISOString(),
    });
  }, []);

  const savePrefs = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics,
      advertising,
      decidedAt: new Date().toISOString(),
    });
  }, [analytics, advertising]);

  if (!needsBanner) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-5"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
    >
      <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--line)] bg-[rgba(251,252,251,0.97)] p-5 shadow-[var(--shadow)] backdrop-blur-xl sm:p-6">
        <h2 id="cookie-title" className="display text-2xl text-[var(--ink)]">
          Cookies & confidentialité
        </h2>
        <p id="cookie-desc" className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
          Nous utilisons des cookies nécessaires au fonctionnement du site. Avec votre accord, des cookies
          analytiques (mesure d’audience) et publicitaires (SEA / Google Ads) peuvent être activés. Voir la{" "}
          <Link href="/politique-cookies" className="underline">
            politique cookies
          </Link>
          .
        </p>

        {openPrefs ? (
          <div className="mt-4 space-y-3 rounded-2xl bg-[var(--mist)] p-4 text-sm">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked disabled className="mt-1" />
              <span>
                <strong>Nécessaires</strong> — sécurité, session, consentement. Toujours actifs.
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <span>
                <strong>Analytiques</strong> — compréhension de l’usage du site (SEO / amélioration).
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={advertising}
                onChange={(e) => setAdvertising(e.target.checked)}
              />
              <span>
                <strong>Publicitaires / SEA</strong> — mesure des campagnes Google Ads et personnalisation.
              </span>
            </label>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" className="btn btn-primary" onClick={acceptAll}>
            Tout accepter
          </button>
          <button type="button" className="btn btn-secondary" onClick={rejectOptional}>
            Refuser le non-essentiel
          </button>
          {openPrefs ? (
            <button type="button" className="btn btn-primary" onClick={savePrefs}>
              Enregistrer mes choix
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={() => setOpenPrefs(true)}>
              Personnaliser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
