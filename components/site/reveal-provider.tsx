"use client";

import { useEffect } from "react";

/**
 * Observa todos os elementos [data-reveal] e revela ao entrar na viewport.
 * Mantido fora dos componentes de secao para que continuem server components.
 */
export function RevealProvider() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (nodes.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      nodes.forEach((n) => {
        n.classList.add("is-in");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((n) => {
      io.observe(n);
    });
    return () => {
      io.disconnect();
    };
  }, []);

  return null;
}
