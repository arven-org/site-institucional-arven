import { z } from "zod";
import { isoDateSchema, optionalText, uuidSchema } from "@/lib/validation/zod-helpers";
import { reaisToCents } from "@/lib/money/cents";
import { CONTRACT_STATUSES } from "@/modules/contracts/states";

const optionalIsoDate = z.preprocess(
  (v) => {
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    return trimmed.length === 0 ? null : trimmed;
  },
  z.union([z.literal(null), isoDateSchema]),
);

const optionalUuid = z.preprocess(
  (v) => {
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    return trimmed.length === 0 ? null : trimmed;
  },
  z.union([z.literal(null), uuidSchema]),
);

/**
 * Schema do form: o usuario digita reais como string no formato brasileiro
 * ("3.500,00"). Convertemos pra centavos (number) na fronteira.
 */
export const contractCreateSchema = z
  .object({
    client_id: uuidSchema,
    mrr_reais: z
      .string()
      .trim()
      .min(1, "Valor obrigatorio.")
      .transform((value, ctx): number => {
        try {
          const cents = reaisToCents(value);
          if (cents < 0n) {
            ctx.addIssue({ code: "custom", message: "Valor nao pode ser negativo." });
            return z.NEVER;
          }
          if (cents > BigInt(Number.MAX_SAFE_INTEGER)) {
            ctx.addIssue({ code: "custom", message: "Valor acima do limite suportado." });
            return z.NEVER;
          }
          return Number(cents);
        } catch {
          ctx.addIssue({ code: "custom", message: "Valor invalido. Use 1.234,56." });
          return z.NEVER;
        }
      }),
    start_date: isoDateSchema,
    end_date: optionalIsoDate,
    status: z.enum(CONTRACT_STATUSES).default("active"),
    source: z.enum(["manual", "google_form", "migration"]).default("manual"),
    source_ref: optionalText(255),
    renewal_of: optionalUuid,
  })
  .superRefine((data, ctx) => {
    if (data.end_date && data.end_date < data.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Data de fim nao pode ser anterior ao inicio.",
      });
    }
  });

export type ContractCreateInput = z.input<typeof contractCreateSchema>;
export type ContractCreateValues = z.infer<typeof contractCreateSchema>;

export const contractUpdateSchema = contractCreateSchema.and(z.object({ id: uuidSchema }));

export type ContractUpdateValues = z.infer<typeof contractUpdateSchema>;

export const contractTransitionSchema = z.object({
  id: uuidSchema,
  to: z.enum(CONTRACT_STATUSES),
});

export type ContractTransitionInput = z.infer<typeof contractTransitionSchema>;
