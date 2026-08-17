/**
 * Estados do contrato e transicoes permitidas.
 * Espelha o enum public.contract_status no banco.
 *
 * O motor de transicao da fatia 5 (status engine) consulta este modulo
 * pra decidir o que e legal automaticamente vs manual:
 *
 *   - draft -> active: aprovacao manual (portao do Google Form).
 *   - draft -> canceled: descarte manual de um rascunho que veio errado.
 *   - active -> ended: automatico, quando end_date chega (cron).
 *   - active -> canceled: manual (churn e decisao de negocio).
 *   - ended/canceled: terminais. Nao voltam por fluxo de aplicacao.
 *     Caminho de correcao manual usa service-role direto no banco.
 */
import type { Database } from "@/lib/supabase/types";

export type ContractStatus = Database["public"]["Enums"]["contract_status"];

export const CONTRACT_STATUSES = [
  "draft",
  "active",
  "ended",
  "canceled",
] as const satisfies readonly ContractStatus[];

const ALLOWED_TRANSITIONS: Record<ContractStatus, readonly ContractStatus[]> = {
  draft: ["active", "canceled"],
  active: ["ended", "canceled"],
  ended: [],
  canceled: [],
};

export function canTransition(from: ContractStatus, to: ContractStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: ContractStatus, to: ContractStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transicao invalida de status: ${from} -> ${to}.`);
  }
}

/**
 * Estados que contam no MRR. Util pra filtros agregados na UI ate o
 * snapshot diario estar populado.
 */
export const MRR_COUNTING_STATUSES = ["active"] as const satisfies readonly ContractStatus[];
