"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";
import { useModal } from "@/components/ModalProvider";

const links = [
  { href: "#activites", label: "Activités" },
  { href: "#formules", label: "Formules" },
  { href: "#methode", label: "Méthode" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const { open } = useModal();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-b border-[var(--line)] bg-[rgba(242,244,247,0.92)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-[0.55rem] bg-[var(--ink)] text-[0.95rem] font-bold text-[var(--beam)] transition-transform duration-300 group-hover:scale-105"
          >
            M
          </span>
          <span className="display text-[1.15rem] tracking-[-0.03em] text-[var(--ink)]">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="linkish text-sm font-semibold text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <button type="button" className="btn btn-secondary" onClick={() => open("devis")}>
            Devis
          </button>
          <button type="button" className="btn btn-primary" onClick={() => open("rdv")}>
            Rendez-vous
          </button>
        </div>

        <button
          type="button"
          className="btn btn-secondary !min-h-10 !px-3 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          Menu
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-nav" className="border-t border-[var(--line)] bg-[rgba(242,244,247,0.98)] lg:hidden">
          <nav className="container flex flex-col gap-2 py-4" aria-label="Navigation mobile">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 grid gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setMenuOpen(false);
                  open("devis");
                }}
              >
                Demander un devis
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setMenuOpen(false);
                  open("rdv");
                }}
              >
                Prendre rendez-vous
              </button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
