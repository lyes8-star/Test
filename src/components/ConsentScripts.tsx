"use client";

import { useEffect } from "react";

/**
 * Point d’extension SEA / Analytics :
 * charge les tags uniquement après consentement cookies.
 * Brancher gtag / Google Ads ici en production.
 */
export function ConsentScripts() {
  useEffect(() => {
    function apply(detail: { analytics?: boolean; advertising?: boolean } | null) {
      if (!detail) return;
      // Exemple : if (detail.analytics) loadGtag();
      // Exemple : if (detail.advertising) loadGoogleAds();
      if (process.env.NODE_ENV === "development") {
        console.info("[consent]", detail);
      }
    }

    try {
      const raw = localStorage.getItem("crevia_cookie_consent_v1");
      if (raw) apply(JSON.parse(raw));
    } catch {
      /* ignore */
    }

    const onConsent = (e: Event) => {
      apply((e as CustomEvent).detail);
    };
    window.addEventListener("crevia:consent", onConsent);
    return () => window.removeEventListener("crevia:consent", onConsent);
  }, []);

  return null;
}
