"use client";

import { useModal } from "@/components/ModalProvider";
import { siteConfig } from "@/lib/site";

export function Hero() {
  const { open } = useModal();

  return (
    <section className="relative min-h-[calc(100svh-var(--header-h))] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(15,47,38,0.72) 0%, rgba(27,77,62,0.45) 42%, rgba(20,32,26,0.25) 100%), url('/hero.svg') center/cover no-repeat",
          animation: "drift 18s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0 1px, transparent 1px), radial-gradient(circle at 80% 40%, rgba(255,255,255,0.12) 0 1px, transparent 1px)",
          backgroundSize: "28px 28px, 42px 42px",
          animation: "pulse-soft 6s ease-in-out infinite",
        }}
      />

      <div className="container relative flex min-h-[calc(100svh-var(--header-h))] flex-col justify-end pb-16 pt-20 sm:pb-20">
        <p className="eyebrow reveal text-[var(--sage)]">{siteConfig.name}</p>
        <h1 className="display reveal reveal-delay-1 mt-4 max-w-4xl text-[clamp(3rem,9vw,6.5rem)] text-white">
          {siteConfig.tagline}
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
          Création de sites PWA, SEO, SEA et Google Ads — pour être trouvé, choisi et converti.
          RDV et devis en ligne, conforme RGPD.
        </p>
        <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn btn-amber" onClick={() => open("rdv")}>
            Prendre rendez-vous
          </button>
          <button type="button" className="btn btn-secondary !border-white/35 !text-white hover:!bg-white/10" onClick={() => open("devis")}>
            Demander un devis
          </button>
        </div>
      </div>
    </section>
  );
}
