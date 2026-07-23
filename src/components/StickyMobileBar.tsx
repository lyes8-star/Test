"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/components/ModalProvider";

export function StickyMobileBar() {
  const { open } = useModal();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sync = () => {
      const visible = window.scrollY > window.innerHeight * 0.65 && window.innerWidth < 1024;
      setShow(visible);
      document.body.classList.toggle("has-sticky-bar", visible);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.body.classList.remove("has-sticky-bar");
    };
  }, []);

  if (!show) return null;

  return (
    <div className="sticky-mobile-bar fixed inset-x-0 bottom-0 z-[65] border-t border-[var(--line)] bg-[rgba(242,244,247,0.94)] py-2 backdrop-blur-xl lg:hidden">
      <div className="container grid grid-cols-3 gap-1.5">
        <button
          type="button"
          className="btn btn-primary !min-h-10 !px-2 !text-[0.85rem]"
          onClick={() => open("rdv")}
        >
          RDV
        </button>
        <button
          type="button"
          className="btn btn-secondary !min-h-10 !px-2 !text-[0.85rem]"
          onClick={() => open("devis")}
        >
          Devis
        </button>
        <button
          type="button"
          className="btn btn-secondary !min-h-10 !px-2 !text-[0.85rem]"
          onClick={() => document.getElementById("chat-launcher")?.click()}
        >
          Chat
        </button>
      </div>
    </div>
  );
}
