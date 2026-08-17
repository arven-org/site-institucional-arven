/**
 * Aritmetica de dinheiro em centavos. Bigint internamente pra ate ~9 quatrilhoes.
 * Nunca operar com floats. Nunca guardar reais. Centavos sao a unica fonte da verdade.
 */

export type Cents = bigint;

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function toCents(input: number | string | bigint): Cents {
  if (typeof input === "bigint") return input;

  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new RangeError("Valor invalido para centavos.");
    }
    return BigInt(Math.round(input));
  }

  const cleaned = input.replace(/[^0-9-]/g, "");
  if (cleaned === "" || cleaned === "-") {
    throw new RangeError("Valor invalido para centavos.");
  }
  return BigInt(cleaned);
}

/**
 * Recebe reais como numero ou string ("1.234,56" ou "1234.56") e devolve centavos.
 * Para usar so na fronteira (import, form input). Internamente sempre centavos.
 */
export function reaisToCents(input: number | string): Cents {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) throw new RangeError("Valor invalido.");
    return BigInt(Math.round(input * 100));
  }

  const trimmed = input.trim();
  if (trimmed === "") throw new RangeError("Valor vazio.");

  const negative = trimmed.startsWith("-");
  const body = negative ? trimmed.slice(1) : trimmed;

  let normalized: string;
  if (body.includes(",")) {
    normalized = body.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = body;
  }

  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) throw new RangeError(`Valor invalido: ${input}`);

  const cents = BigInt(Math.round(parsed * 100));
  return negative ? -cents : cents;
}

export function formatBRL(cents: Cents): string {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const whole = abs / 100n;
  const fraction = abs % 100n;
  const fractionStr = fraction.toString().padStart(2, "0");
  const wholeNum = Number(whole);
  if (whole > BigInt(Number.MAX_SAFE_INTEGER)) {
    return `${negative ? "-" : ""}R$ ${whole.toString()},${fractionStr}`;
  }
  const formatted = BRL.format(wholeNum + Number(`0.${fractionStr}`));
  return negative ? `-${formatted}` : formatted;
}

export function sumCents(values: Iterable<Cents>): Cents {
  let total = 0n;
  for (const value of values) total += value;
  return total;
}

export function centsEqual(a: Cents, b: Cents): boolean {
  return a === b;
}
