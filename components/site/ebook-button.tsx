"use client";

import { adv } from "@/lib/site/content";
import { useLeadGate } from "./lead-gate/provider";

/**
 * CTA do ebook (metodo ADv). Abre o pop-up de qualificacao (intent "ebook") e,
 * ao final, redireciona para o checkout (brand.checkoutUrl). Nao e download:
 * o acesso e pago, entao o botao leva o lead qualificado ao pagamento.
 */
export function EbookButton({
  label = adv.materialLabel,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const { open } = useLeadGate();

  return (
    <button
      type="button"
      onClick={() => {
        open("ebook");
      }}
      className={`group inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
      style={{ backgroundColor: "var(--cream)", color: "var(--ink)" }}
    >
      {label}
      <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
    </button>
  );
}
