"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { LeadIntent } from "@/lib/site/lead-gate";
import { LeadModal } from "./modal";

interface LeadGateContextValue {
  /** Abre o pop-up de qualificacao para a intencao dada (agendar ou ebook). */
  open: (intent: LeadIntent) => void;
}

const LeadGateContext = createContext<LeadGateContextValue | null>(null);

/**
 * Provider do gate de leads. Envolve o site inteiro, expoe `open(intent)` e
 * hospeda o unico modal da pagina. O modal so aparece quando um CTA chama open.
 */
export function LeadGateProvider({ children }: { children: React.ReactNode }) {
  const [intent, setIntent] = useState<LeadIntent | null>(null);
  // `session` guarda a ultima abertura e sobrevive ao fechamento, para o
  // conteudo nao piscar vazio durante a animacao de saida. `key` remonta o
  // fluxo (zera passo e respostas) a cada nova abertura.
  const [session, setSession] = useState<{ intent: LeadIntent; key: number } | null>(null);

  const open = useCallback((next: LeadIntent) => {
    setIntent(next);
    setSession((prev) => ({ intent: next, key: (prev?.key ?? 0) + 1 }));
  }, []);

  const value = useMemo<LeadGateContextValue>(() => ({ open }), [open]);

  return (
    <LeadGateContext.Provider value={value}>
      {children}
      <LeadModal
        open={intent !== null}
        session={session}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIntent(null);
        }}
      />
    </LeadGateContext.Provider>
  );
}

/** Hook dos CTAs. Fora do provider vira no-op seguro (nao quebra render). */
export function useLeadGate(): LeadGateContextValue {
  const ctx = useContext(LeadGateContext);
  return ctx ?? { open: () => undefined };
}
