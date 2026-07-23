"use client";

import { useEffect } from "react";

/** IntersectionObserver: adds `.is-inview` to `.reveal-on-scroll` and scrolls `--reveal-p` on `.scroll-progress`. */
export function ScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal-on-scroll"));
    const progressNodes = Array.from(document.querySelectorAll<HTMLElement>(".scroll-progress"));

    if (reduce) {
      nodes.forEach((el) => el.classList.add("is-inview"));
      progressNodes.forEach((el) => el.style.setProperty("--reveal-p", "1"));
      return;
    }

    const revealIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            revealIo.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const progressIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const p = Math.min(1, Math.max(0, entry.intersectionRatio));
          el.style.setProperty("--reveal-p", String(p));
          if (p > 0.55) el.classList.add("is-inview");
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );

    nodes.forEach((el) => revealIo.observe(el));
    progressNodes.forEach((el) => progressIo.observe(el));

    return () => {
      revealIo.disconnect();
      progressIo.disconnect();
    };
  }, []);

  return null;
}
