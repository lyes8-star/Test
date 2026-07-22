"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/components/ModalProvider";

export function StickyMobileBar() {
  const { open } = useModal();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.65);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[65] border-t border-[var(--line)] bg-[rgba(242,244,247,0.94)] p-3 backdrop-blur-xl lg:hidden">
      <div className="container grid grid-cols-3 gap-2">
        <button type="button" className="btn btn-primary !min-h-11 !px-2 !text-sm" onClick={() => open("rdv")}>
          RDV
        </button>
        <button type="button" className="btn btn-secondary !min-h-11 !px-2 !text-sm" onClick={() => open("devis")}>
          Devis
        </button>
        <button
          type="button"
          className="btn btn-secondary !min-h-11 !px-2 !text-sm"
          onClick={() => document.getElementById("chat-launcher")?.click()}
        >
          Chat
        </button>
      </div>
    </div>
  );
}
