/* eslint-disable no-console -- script CLI. */

/**
 * Importa os clientes ATIVOS do ArvenOS pro Arven Contratos OS.
 *
 * Uso:
 *   pnpm migrate:arvenos                   # le scripts/data/migration-clients.json
 *   pnpm migrate:arvenos --file=path.json  # custom
 *   pnpm migrate:arvenos --dry-run         # valida o JSON e sai, sem tocar no banco
 *
 * Pre-requisitos:
 *   - Supabase local rodando (pnpm db:start)
 *   - .env.local com SUPABASE_SERVICE_ROLE_KEY
 *
 * Idempotencia: re-rodar nao duplica clientes (upsert por document) nem
 * contratos (unique source_ref pra source=migration).
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrationFileSchema } from "@/scripts/migration/schema";
import { runMigration } from "@/scripts/migration/run";
import { formatBRL } from "@/lib/money/cents";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, "../.env.local") });

const args = parseArgs(process.argv.slice(2));
const filePath = args.file ?? resolve(here, "data/migration-clients.json");

main(filePath, args.dryRun).catch((err: unknown) => {
  console.error("\nFalhou:", err instanceof Error ? err.message : err);
  process.exit(1);
});

async function main(path: string, dryRun: boolean) {
  console.log(`\nLendo ${path}...`);
  const raw = readJson(path);
  const parsed = migrationFileSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("\nJSON invalido:");
    console.error(JSON.stringify(z.treeifyError(parsed.error), null, 2));
    process.exit(1);
  }

  const data = parsed.data;
  const totalContracts = data.clients.reduce((acc, c) => acc + c.contracts.length, 0);
  console.log(
    `\nValidado:\n  snapshot_date: ${data.snapshot_date}\n  clientes: ${String(data.clients.length)}\n  contratos: ${String(totalContracts)}\n  esperado: ${formatBRL(BigInt(data.expected_total_cents))}`,
  );

  if (dryRun) {
    console.log("\nDry-run, nada gravado.");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY faltando no .env.local.",
    );
  }

  console.log("\nExecutando migracao...");
  const result = await runMigration(data, { url, serviceKey });

  for (const c of result.per_client) {
    const clientTag = c.client_action === "inserted" ? "novo " : "reuso";
    console.log(`  [${c.client_seed_ref}] cliente ${clientTag}`);
    for (const ct of c.contracts) {
      const contractTag = ct.contract_action === "inserted" ? "novo " : "skip ";
      console.log(
        `    [${ct.contract_seed_ref}] contrato ${contractTag} ${formatBRL(BigInt(ct.mrr_cents))}`,
      );
    }
  }

  console.log(
    `\nMigrados nesta passada: ${formatBRL(BigInt(result.computed_total_cents))} em ${String(result.active_contracts)} contratos / ${String(result.active_clients)} clientes.`,
  );

  if (!result.ok) {
    console.error(`\nABORTADO: ${result.message}`);
    process.exit(2);
  }

  console.log(
    `\n${result.snapshot_created ? "Snapshot criado" : "Snapshot ja existia"} pra ${result.snapshot_date}.`,
  );
  console.log("\n" + result.message);
}

interface ParsedArgs {
  file: string | null;
  dryRun: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  let file: string | null = null;
  let dryRun = false;
  for (const arg of argv) {
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg.startsWith("--file=")) {
      file = arg.slice("--file=".length);
    }
  }
  return { file, dryRun };
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as unknown;
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      throw new Error(
        `Arquivo nao encontrado: ${path}\n` +
          `Copie scripts/data/migration-clients.example.json pra scripts/data/migration-clients.json e preencha com os clientes.`,
      );
    }
    throw err;
  }
}
