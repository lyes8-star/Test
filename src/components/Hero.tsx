"use client";

import { useModal } from "@/components/ModalProvider";
import { siteConfig } from "@/lib/site";

export function Hero() {
  const { open } = useModal();

  return (
    <section className="relative isolate flex min-h-[min(100svh,58rem)] items-end overflow-hidden text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 72% 28%, rgba(125, 211, 252, 0.22), transparent 55%), linear-gradient(165deg, #0e1218 0%, #161c26 48%, #0e1218 100%)",
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
        className="hero-media-drift absolute inset-0 -z-20 h-full w-full object-cover opacity-90"
      />
      <div
        aria-hidden
        className="hero-beam-sweep pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, transparent 38%, rgba(125, 211, 252, 0.07) 46%, rgba(255, 90, 31, 0.08) 52%, transparent 62%, transparent 100%)",
        }}
      />

      <div className="container relative pb-16 pt-28 sm:pb-20 sm:pt-32">
        <p className="display reveal text-[clamp(3.4rem,14vw,7.5rem)] leading-[0.9] tracking-[-0.06em] text-white">
          {siteConfig.name}
        </p>
        <h1 className="display reveal reveal-delay-1 mt-4 max-w-[16ch] text-[clamp(1.75rem,4.8vw,3.1rem)] leading-[1.05] text-white">
          {siteConfig.tagline}
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-[36ch] text-[clamp(1.05rem,2.2vw,1.25rem)] leading-relaxed text-[rgba(242,244,247,0.82)]">
          Création de sites PWA, SEO, SEA et Google Ads — pour être trouvé, choisi et converti.
        </p>
        <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => open("rdv")}>
            Prendre rendez-vous
          </button>
          <button
            type="button"
            className="btn btn-secondary !border-white/40 !text-white hover:!bg-white/10 hover:!text-white"
            onClick={() => open("devis")}
          >
            Demander un devis
          </button>
        </div>
      </div>
    </section>
  );
}
