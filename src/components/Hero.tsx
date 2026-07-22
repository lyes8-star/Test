"use client";

import { useModal } from "@/components/ModalProvider";
import { siteConfig } from "@/lib/site";
import { useEffect, useRef } from "react";

export function Hero() {
  const { open } = useModal();
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = ctaRef.current;
    if (!btn) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const onMove = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(x, y);
      if (dist > 140) {
        btn.style.transform = "";
        return;
      }
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    };
    const onLeave = () => {
      btn.style.transform = "";
    };
    window.addEventListener("pointermove", onMove);
    btn.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-[min(100svh,58rem)] items-end overflow-hidden text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 72% 28%, rgba(125, 211, 252, 0.32), transparent 55%), linear-gradient(165deg, #0e1218 0%, #161c26 48%, #0e1218 100%)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        aria-hidden
        src="/hero.svg"
        alt=""
        width={1600}
        height={900}
        decoding="async"
        fetchPriority="high"
        className="hero-media-drift absolute inset-0 -z-20 h-full w-full object-cover opacity-95"
      />
      <div
        aria-hidden
        className="hero-beam-sweep pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, transparent 28%, rgba(125, 211, 252, 0.2) 44%, rgba(255, 90, 31, 0.22) 52%, transparent 68%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
        }}
      />

      <div className="container relative pb-20 pt-28 sm:pb-24 sm:pt-32">
        <p className="display hero-brand-in text-[clamp(3.6rem,15vw,8rem)] leading-[0.88] tracking-[-0.06em] text-white">
          {siteConfig.name}
        </p>
        <h1 className="display reveal reveal-delay-1 mt-5 max-w-[15ch] text-[clamp(1.85rem,5vw,3.25rem)] leading-[1.02] text-white">
          {siteConfig.tagline}
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-[34ch] text-[clamp(1.05rem,2.2vw,1.3rem)] leading-relaxed text-[rgba(242,244,247,0.84)]">
          Création de sites PWA, SEO, SEA et Google Ads — pour être trouvé, choisi et converti.
        </p>
        <div className="reveal reveal-delay-3 mt-9 flex flex-wrap gap-3">
          <button
            ref={ctaRef}
            type="button"
            className="btn btn-primary magnetic-cta min-h-12"
            onClick={() => open("rdv")}
          >
            Prendre rendez-vous
          </button>
          <button
            type="button"
            className="btn btn-secondary min-h-12 !border-white/45 !text-white hover:!bg-white/10 hover:!text-white"
            onClick={() => open("devis")}
          >
            Demander un devis
          </button>
        </div>
      </div>
    </section>
  );
}
