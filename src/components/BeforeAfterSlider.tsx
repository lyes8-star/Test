"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  beforeSrc?: string;
  afterSrc?: string;
  beforeAlt?: string;
  afterAlt?: string;
};

export function BeforeAfterSlider({
  beforeSrc = "/compare/before.svg",
  afterSrc = "/compare/after.svg",
  beforeAlt = "Exemple de site hors normes, peu accessible et peu visible sur Google",
  afterAlt = "Exemple de site après accompagnement Crevia : clair, rapide, prêt pour Google",
}: Props) {
  const [pos, setPos] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setFromClientX(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <section id="avant-apres" className="section section-alt ba-section">
      <div className="container">
        <p className="eyebrow reveal-on-scroll text-[var(--signal)]">Avant / Après</p>
        <h2 className="display reveal-on-scroll mt-3 max-w-[18ch] text-[clamp(1.85rem,4vw,2.85rem)] text-[var(--ink)]">
          Du site hors normes au résultat Crevia
        </h2>
        <p
          className="reveal-on-scroll mt-4 max-w-2xl text-lg text-[var(--ink-soft)]"
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          Glissez le curseur : à gauche l’existant illisible, à droite une présence Google claire,
          accessible et prête à convertir.
        </p>
      </div>

      <div className="ba-compare-wrap reveal-on-scroll mt-10" style={{ ["--reveal-delay" as string]: "140ms" }}>
        <div
          ref={frameRef}
          className="ba-compare"
          style={{ ["--pos" as string]: `${pos}%` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img className="ba-compare-img ba-compare-after" src={afterSrc} alt={afterAlt} width={1600} height={900} draggable={false} />
          <div className="ba-compare-before-clip" aria-hidden="true">
            <img className="ba-compare-img ba-compare-before" src={beforeSrc} alt="" width={1600} height={900} draggable={false} />
          </div>
          <div className="ba-compare-handle" aria-hidden="true">
            <span className="ba-compare-handle-line" />
            <span className="ba-compare-handle-knob">↔</span>
          </div>
          <span className="ba-compare-label ba-compare-label-before">Avant</span>
          <span className="ba-compare-label ba-compare-label-after">Après</span>
          <label className="ba-compare-sr-only" htmlFor="ba-range">
            Comparer avant et après
          </label>
          <input
            id="ba-range"
            className="ba-compare-range"
            type="range"
            min={0}
            max={100}
            value={pos}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)} pour cent côté avant`}
            onChange={(e) => setPos(Number(e.target.value))}
          />
        </div>
      </div>
    </section>
  );
}
