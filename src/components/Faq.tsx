"use client";

import { useState } from "react";
import { faqItems } from "@/lib/site";

export function Faq() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);

  return (
    <section id="faq" className="section bg-white">
      <div className="container">
        <p className="eyebrow reveal-on-scroll text-[var(--signal)]">FAQ</p>
        <h2 className="display reveal-on-scroll mt-3 max-w-[14ch] text-[clamp(1.85rem,4vw,2.85rem)] text-[var(--ink)]">
          Questions fréquentes
        </h2>
        <div className="mt-10 border-t border-[var(--line)]">
          {faqItems.map((item, i) => {
            const open = openId === item.id;
            return (
              <div
                key={item.id}
                className="reveal-on-scroll border-b border-[var(--line)]"
                style={{ ["--reveal-delay" as string]: `${60 + i * 50}ms` }}
              >
                <button
                  type="button"
                  className="flex min-h-14 w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={open}
                  aria-controls={`${item.id}-panel`}
                  id={`${item.id}-button`}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span className="display text-[1.05rem] tracking-[-0.02em] text-[var(--ink)] sm:text-[1.2rem]">
                    {item.question}
                  </span>
                  <span
                    aria-hidden
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line)] text-lg transition-transform ${
                      open ? "rotate-45 bg-[var(--ink)] text-white" : "text-[var(--ink)]"
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  id={`${item.id}-panel`}
                  role="region"
                  aria-labelledby={`${item.id}-button`}
                  className={`faq-panel grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 max-w-2xl text-[var(--ink-soft)]">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
