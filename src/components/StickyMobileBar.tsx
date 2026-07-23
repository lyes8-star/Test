"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/components/ModalProvider";

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 3.5v3M16 3.5v3M3.5 10h17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.5h7.5L19.5 8.5V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.5V8h5M8.5 12.5h7M8.5 16h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 18.5 4 21l3-1.2A8.5 8.5 0 1 0 5 18.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 11h6M9 14.5h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconA11y() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2.25" fill="currentColor" />
      <path
        d="M5 9.5h14M12 9.5v10M8.5 19.5h7M7.5 13.5H4.5M19.5 13.5h-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StickyMobileBar() {
  const { open } = useModal();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sync = () => {
      const visible = window.innerWidth < 1024;
      setShow(visible);
      document.body.classList.toggle("has-sticky-bar", visible);
    };
    sync();
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("resize", sync);
      document.body.classList.remove("has-sticky-bar");
    };
  }, []);

  if (!show) return null;

  return (
    <div className="sticky-mobile-bar fixed inset-x-0 bottom-0 z-[65] border-t border-[var(--line)] bg-[rgba(242,244,247,0.94)] py-1.5 backdrop-blur-xl lg:hidden">
      <div className="container sticky-bar-inner">
        <button
          type="button"
          className="sticky-fab sticky-fab-primary"
          aria-label="Rendez-vous"
          onClick={() => open("rdv")}
        >
          <span className="sticky-fab-icon">
            <IconCalendar />
          </span>
          <span className="sticky-fab-label">RDV</span>
        </button>
        <button
          type="button"
          className="sticky-fab"
          aria-label="Devis"
          onClick={() => open("devis")}
        >
          <span className="sticky-fab-icon">
            <IconDocument />
          </span>
          <span className="sticky-fab-label">Devis</span>
        </button>
        <button
          type="button"
          className="sticky-fab"
          aria-label="Chat"
          onClick={() => document.getElementById("chat-launcher")?.click()}
        >
          <span className="sticky-fab-icon">
            <IconChat />
          </span>
          <span className="sticky-fab-label">Chat</span>
        </button>
        <button
          type="button"
          id="sticky-a11y"
          className="sticky-fab"
          aria-label="Accessibilité"
          onClick={() => document.getElementById("a11y-fab")?.click()}
        >
          <span className="sticky-fab-icon">
            <IconA11y />
          </span>
          <span className="sticky-fab-label">Accès</span>
        </button>
      </div>
    </div>
  );
}
