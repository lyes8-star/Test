"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
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

function CaseMedia({ src, title }: { src: string; title: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (reduceRef.current) return;
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    const r = frame.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const rotY = px * 8;
    const rotX = -py * 6;
    frame.style.setProperty("--tilt-x", `${rotX}deg`);
    frame.style.setProperty("--tilt-y", `${rotY}deg`);
    img.style.transform = `scale(1.06) translate(${px * -4}%, ${py * -3}%)`;
  }

  function onPointerLeave() {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (frame) {
      frame.style.setProperty("--tilt-x", "0deg");
      frame.style.setProperty("--tilt-y", "0deg");
      frame.classList.remove("is-active");
    }
    if (img) img.style.transform = "";
  }

  function onPointerDown() {
    frameRef.current?.classList.add("is-active");
  }

  return (
    <div
      ref={frameRef}
      className="case-media-frame scroll-progress reveal-on-scroll"
      role="img"
      tabIndex={0}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onBlur={onPointerLeave}
      aria-label={`Visuel : ${title}`}
    >
      <span className="case-media-beam" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        width={640}
        height={400}
        className="case-media-img"
        loading="lazy"
      />
    </div>
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
              className="case-item grid gap-6 border-b border-[var(--line)] py-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12"
            >
              <CaseMedia src={c.image} title={c.title} />
              <div
                className="reveal-on-scroll"
                style={{ ["--reveal-delay" as string]: `${160 + i * 80}ms` }}
              >
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
