"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Observa todos os elementos [data-reveal] e revela ao entrar na viewport.
 * Mantido fora dos componentes de secao para que continuem server components.
 *
 * Vive no layout do grupo (site), que persiste entre navegacoes client-side:
 * o efeito roda de novo a cada rota (usePathname) e um MutationObserver cobre
 * nos que chegam depois do commit (streaming/suspense). Sem isso, voltar do
 * blog pra home deixava o texto invisivel (nos novos nunca eram observados).
 */
export function RevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = reduce
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-in");
                io?.unobserve(entry.target);
              }
            }
          },
          { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
        );

    const seen = new WeakSet<Element>();

    function reveal(node: HTMLElement) {
      if (seen.has(node)) return;
      seen.add(node);
      if (io) {
        io.observe(node);
      } else {
        node.classList.add("is-in");
      }
    }

    function scan(root: ParentNode) {
      for (const node of root.querySelectorAll<HTMLElement>("[data-reveal]")) {
        reveal(node);
      }
    }

    scan(document);

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const added of mutation.addedNodes) {
          if (!(added instanceof HTMLElement)) continue;
          if (added.matches("[data-reveal]")) reveal(added);
          scan(added);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io?.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
