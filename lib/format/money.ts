import { formatBRL as formatBRLFromCents } from "@/lib/money/cents";

export const formatBRL = formatBRLFromCents;

/**
 * Versao para numero em centavos vindo do PostgREST (que retorna bigint como number).
 */
export function formatBRLFromNumber(cents: number | null | undefined): string {
  if (cents == null) return "R$ 0,00";
  return formatBRLFromCents(BigInt(Math.round(cents)));
}
