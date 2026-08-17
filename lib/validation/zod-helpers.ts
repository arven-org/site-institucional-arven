import { z } from "zod";

export const uuidSchema = z.uuid();

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado YYYY-MM-DD.");

/**
 * Centavos sempre como bigint, mas no transporte (JSON, form) chega como string ou number.
 * Coerce com seguranca, rejeitando floats e valores nao inteiros.
 */
export const centsSchema = z.union([z.string(), z.number(), z.bigint()]).transform((value, ctx) => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      ctx.addIssue({ code: "custom", message: "Centavos devem ser inteiros." });
      return z.NEVER;
    }
    return BigInt(value);
  }
  if (!/^-?\d+$/.test(value)) {
    ctx.addIssue({ code: "custom", message: "Centavos invalidos." });
    return z.NEVER;
  }
  return BigInt(value);
});

/**
 * Converte string vazia (depois de trim) em null. Util pra fields opcionais
 * que vem de formulario (text input sempre traz pelo menos "").
 */
export function emptyToNull(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  if (v.length === 0) return null;
  return v;
}

/**
 * Schema pra campo de texto opcional: aceita string ou nada, e devolve
 * `string | null` (nunca undefined). Garante compatibilidade com
 * exactOptionalPropertyTypes + tipos gerados pelo Supabase.
 */
export function optionalText(max: number) {
  return z.preprocess((v) => {
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    return trimmed.length === 0 ? null : trimmed;
  }, z.string().max(max).nullable());
}

/**
 * Coloque na fronteira: parseia ou joga ValidationError tipado.
 * Use `.safeParse` direto quando voce quer tratar o erro inline.
 */
export function parseOrThrow<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const flat = z.treeifyError(result.error);
    const err = new Error("Entrada invalida.");
    Object.assign(err, { name: "ValidationError", details: flat });
    throw err;
  }
  return result.data;
}
