"use client";

import { useModal } from "@/components/ModalProvider";
import { siteConfig } from "@/lib/site";
import { useEffect, useRef } from "react";

export function Hero() {
  const { open } = useModal();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    const beam = beamRef.current;
    const grain = grainRef.current;
    const btn = ctaRef.current;
    if (!section || !media || !beam) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let inView = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        section.classList.toggle("is-hero-paused", !inView);
      },
      { threshold: 0.08 },
    );
    io.observe(section);

    const onMove = (e: PointerEvent) => {
      if (!inView) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = section.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        const mx = Math.max(-1, Math.min(1, nx));
        const my = Math.max(-1, Math.min(1, ny));
        media.style.transform = `translate3d(${mx * -2.8}%, ${my * -2.2}%, 0) scale(1.08)`;
        beam.style.transform = `translate3d(${mx * 3.2}%, ${my * 2.4}%, 0)`;
        if (grain) grain.style.transform = `translate3d(${mx * 1.2}%, ${my * 1}%, 0)`;

        if (btn) {
          const br = btn.getBoundingClientRect();
          const x = e.clientX - (br.left + br.width / 2);
          const y = e.clientY - (br.top + br.height / 2);
          if (Math.hypot(x, y) > 140) {
            btn.style.transform = "";
          } else {
            btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
          }
        }
      });
    };

    const onLeave = () => {
      media.style.transform = "";
      beam.style.transform = "";
      if (grain) grain.style.transform = "";
      if (btn) btn.style.transform = "";
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-interactive relative isolate flex min-h-[min(100svh,58rem)] items-center overflow-hidden text-white"
    >
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
        ref={mediaRef}
        aria-hidden
        src="/hero.svg"
        alt=""
        width={1600}
        height={900}
        decoding="async"
        fetchPriority="high"
        className="hero-media-drift hero-parallax-layer absolute inset-0 -z-20 h-full w-full object-cover opacity-95 will-change-transform"
      />
      <div
        ref={beamRef}
        aria-hidden
        className="hero-beam-sweep hero-parallax-layer pointer-events-none absolute inset-0 -z-10 will-change-transform"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, transparent 28%, rgba(125, 211, 252, 0.2) 44%, rgba(255, 90, 31, 0.22) 52%, transparent 68%, transparent 100%)",
        }}
      />
      <div
        ref={grainRef}
        aria-hidden
        className="hero-grain-pulse hero-parallax-layer pointer-events-none absolute inset-0 -z-[5] opacity-[0.08] will-change-transform"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
        }}
      />

      <div className="container relative py-24 sm:py-28">
        <h1 className="display hero-brand-in text-[clamp(4.5rem,20vw,10rem)] leading-[0.86] tracking-[-0.07em] text-white">
          {siteConfig.name}
        </h1>
        <p className="display reveal reveal-delay-1 mt-4 max-w-[20ch] text-[clamp(1.25rem,3.2vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[rgba(242,244,247,0.9)]">
          {siteConfig.tagline}
        </p>
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
