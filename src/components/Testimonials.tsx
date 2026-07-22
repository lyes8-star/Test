"use client";

import { testimonials } from "@/lib/site";

export function Testimonials() {
  return (
    <section id="temoignages" className="section">
      <div className="container">
        <p className="eyebrow reveal-on-scroll text-[var(--signal)]">Témoignages</p>
        <h2 className="display reveal-on-scroll mt-3 max-w-[14ch] text-[clamp(1.85rem,4vw,2.85rem)] text-[var(--ink)]">
          Ce que les équipes retiennent
        </h2>
        <ul className="mt-12 list-none border-t border-[var(--line)] p-0">
          {testimonials.map((t, i) => (
            <li
              key={t.id}
              className="reveal-on-scroll border-b border-[var(--line)] py-9"
              style={{ ["--reveal-delay" as string]: `${80 + i * 90}ms` }}
            >
              <blockquote className="display max-w-3xl text-[clamp(1.25rem,2.8vw,1.85rem)] leading-[1.25] tracking-[-0.03em] text-[var(--ink)]">
                « {t.quote} »
              </blockquote>
              <p className="mt-5 text-sm font-semibold text-[var(--ink)]">{t.name}</p>
              <p className="text-sm text-[var(--ink-soft)]">{t.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
