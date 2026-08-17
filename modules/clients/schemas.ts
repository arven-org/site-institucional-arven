import { z } from "zod";
import { optionalText, uuidSchema } from "@/lib/validation/zod-helpers";

const emailOpt = z.preprocess(
  (v) => {
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    return trimmed.length === 0 ? null : trimmed;
  },
  z.union([z.literal(null), z.email("Email invalido.")]),
);

export const clientCreateSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto.").max(255),
  trade_name: optionalText(255),
  document: optionalText(32),
  email: emailOpt,
  phone: optionalText(64),
  notes: optionalText(2000),
});

export type ClientCreateInput = z.input<typeof clientCreateSchema>;
export type ClientCreateValues = z.infer<typeof clientCreateSchema>;

export const clientUpdateSchema = clientCreateSchema.extend({
  id: uuidSchema,
});

export type ClientUpdateValues = z.infer<typeof clientUpdateSchema>;
