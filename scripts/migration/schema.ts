/**
 * Schema do JSON de migracao do ArvenOS.
 * Validacao acontece ANTES de tocar no banco.
 * Erro daqui = aborta sem efeito colateral.
 *
 * Estrutura permite N contratos por cliente: o mesmo cliente juridico
 * pode ter mais de um contrato ativo simultaneo (ex: planos diferentes).
 */
import { z } from "zod";
import { todayInAppTZ } from "@/lib/dates/billing";

const seedRefRe = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;

const contractSchema = z.object({
  seed_ref: z
    .string()
    .regex(
      seedRefRe,
      "seed_ref invalido: maiusculas, numeros, _ ou -, 2-32 chars (ex: ARV-001-C1).",
    ),
  mrr_cents: z
    .number()
    .int("mrr_cents precisa ser inteiro (centavos).")
    .nonnegative("mrr_cents nao pode ser negativo."),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "start_date deve ser YYYY-MM-DD."),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "end_date deve ser YYYY-MM-DD.")
    .nullable()
    .default(null),
});

const clientEntrySchema = z.object({
  seed_ref: z
    .string()
    .regex(
      seedRefRe,
      "seed_ref do cliente invalido: maiusculas, numeros, _ ou -, 2-32 chars (ex: ARV-001).",
    ),
  name: z.string().trim().min(2).max(255),
  trade_name: z.string().trim().min(1).max(255).nullable().default(null),
  document: z.string().trim().min(1, "document e obrigatorio na migracao.").max(32),
  email: z.email().nullable().default(null),
  phone: z.string().trim().min(1).max(64).nullable().default(null),
  contracts: z.array(contractSchema).min(1, "Pelo menos 1 contrato por cliente."),
});

export const migrationFileSchema = z
  .object({
    snapshot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "snapshot_date deve ser YYYY-MM-DD."),
    expected_total_cents: z.number().int().positive("expected_total_cents precisa ser > 0."),
    clients: z.array(clientEntrySchema).min(1, "Pelo menos 1 cliente."),
  })
  .superRefine((data, ctx) => {
    const today = todayInAppTZ();
    if (data.snapshot_date > today) {
      ctx.addIssue({
        code: "custom",
        path: ["snapshot_date"],
        message: `snapshot_date no futuro (${data.snapshot_date} > hoje ${today}).`,
      });
    }

    const seenClientRef = new Set<string>();
    const seenContractRef = new Set<string>();
    const seenDoc = new Set<string>();
    let sum = 0;

    data.clients.forEach((c, i) => {
      if (seenClientRef.has(c.seed_ref)) {
        ctx.addIssue({
          code: "custom",
          path: ["clients", i, "seed_ref"],
          message: `seed_ref de cliente duplicado: ${c.seed_ref}.`,
        });
      }
      seenClientRef.add(c.seed_ref);

      if (seenDoc.has(c.document)) {
        ctx.addIssue({
          code: "custom",
          path: ["clients", i, "document"],
          message: `document duplicado: ${c.document}.`,
        });
      }
      seenDoc.add(c.document);

      c.contracts.forEach((ct, j) => {
        if (seenContractRef.has(ct.seed_ref)) {
          ctx.addIssue({
            code: "custom",
            path: ["clients", i, "contracts", j, "seed_ref"],
            message: `seed_ref de contrato duplicado: ${ct.seed_ref}.`,
          });
        }
        seenContractRef.add(ct.seed_ref);

        if (ct.start_date > today) {
          ctx.addIssue({
            code: "custom",
            path: ["clients", i, "contracts", j, "start_date"],
            message: `start_date no futuro (${ct.start_date}).`,
          });
        }
        if (ct.end_date && ct.end_date < ct.start_date) {
          ctx.addIssue({
            code: "custom",
            path: ["clients", i, "contracts", j, "end_date"],
            message: "end_date anterior ao start_date.",
          });
        }

        sum += ct.mrr_cents;
      });
    });

    if (sum !== data.expected_total_cents) {
      ctx.addIssue({
        code: "custom",
        path: ["expected_total_cents"],
        message: `Soma dos contratos (${String(sum)}) nao bate com expected_total_cents (${String(data.expected_total_cents)}). Diff = ${String(sum - data.expected_total_cents)}.`,
      });
    }
  });

export type MigrationFile = z.infer<typeof migrationFileSchema>;
export type MigrationClient = MigrationFile["clients"][number];
export type MigrationContract = MigrationClient["contracts"][number];
