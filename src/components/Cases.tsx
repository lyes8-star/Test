"use client";

import { useEffect, useRef, useState } from "react";
import { caseStudies } from "@/lib/site";
import { useModal } from "@/components/ModalProvider";

function MetricCounter({
  value,
  prefix,
  suffix,
}: {
  value: number;
  prefix: string;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        if (reduce) {
          setDisplay(value);
          return;
        }
        const start = performance.now();
        const duration = 1100;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="display text-[clamp(2rem,4vw,2.75rem)] tracking-[-0.04em] text-[var(--signal)]">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function Cases() {
  const { open } = useModal();

  return (
    <section id="realisations" className="section">
      <div className="container">
        <p className="eyebrow reveal-on-scroll text-[var(--signal)]">Réalisations</p>
        <h2 className="display reveal-on-scroll mt-3 max-w-[16ch] text-[clamp(1.85rem,4vw,2.85rem)] text-[var(--ink)]">
          Preuves de valorisation Google
        </h2>
        <p
          className="reveal-on-scroll mt-4 max-w-2xl text-lg text-[var(--ink-soft)]"
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          Trois parcours représentatifs — local, PWA, Ads — avec un résultat mesurable.
        </p>

        <ul className="mt-12 list-none space-y-0 border-t border-[var(--line)] p-0">
          {caseStudies.map((c, i) => (
            <li
              key={c.id}
              className="reveal-on-scroll grid gap-6 border-b border-[var(--line)] py-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12"
              style={{ ["--reveal-delay" as string]: `${100 + i * 100}ms` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt=""
                width={640}
                height={400}
                className="w-full rounded-[0.75rem] object-cover"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--ink-soft)]">
                  <span className="display mr-3 text-[1.5rem] text-[var(--ink)] opacity-30">{c.number}</span>
                  {c.sector}
                </p>
                <h3 className="display mt-3 text-[clamp(1.4rem,2.5vw,1.85rem)] text-[var(--ink)]">{c.title}</h3>
                <p className="mt-3 max-w-xl text-[var(--ink-soft)]">{c.summary}</p>
                <p className="mt-6 flex flex-wrap items-baseline gap-3">
                  <MetricCounter value={c.metricValue} prefix={c.metricPrefix} suffix={c.metricSuffix} />
                  <span className="text-sm text-[var(--ink-soft)]">{c.metricLabel}</span>
                </p>
                <button
                  type="button"
                  className="btn btn-secondary mt-6 min-h-11"
                  onClick={() => open("devis")}
                >
                  Demander un devis
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
