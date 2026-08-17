/**
 * Aritmetica de datas pra cobranca de contratos.
 * TZ fixa em America/Sao_Paulo pra evitar deslize de fronteira de dia.
 */

export const APP_TIMEZONE = "America/Sao_Paulo" as const;

/**
 * Retorna a data atual no formato YYYY-MM-DD no fuso da aplicacao.
 */
export function todayInAppTZ(now: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

/**
 * Adiciona N dias a uma date string YYYY-MM-DD. Pura, sem TZ envolvido,
 * porque tipo `date` do Postgres nao tem fuso.
 */
export function addDays(isoDate: string, days: number): string {
  const [yearStr, monthStr, dayStr] = isoDate.split("-");
  if (!yearStr || !monthStr || !dayStr) {
    throw new RangeError(`Data invalida: ${isoDate}`);
  }
  const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr)));
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear().toString().padStart(4, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Numero de dias inteiros entre duas date strings (b - a). Negativo se b < a.
 */
export function daysBetween(a: string, b: string): number {
  const toUTC = (s: string): number => {
    const [y, m, d] = s.split("-");
    if (!y || !m || !d) throw new RangeError(`Data invalida: ${s}`);
    return Date.UTC(Number(y), Number(m) - 1, Number(d));
  };
  const ms = toUTC(b) - toUTC(a);
  return Math.round(ms / 86_400_000);
}

/**
 * True se a data esta vencida em relacao a hoje (data < hoje no fuso da app).
 */
export function isPastDue(isoDate: string, today = todayInAppTZ()): boolean {
  return daysBetween(today, isoDate) < 0;
}
