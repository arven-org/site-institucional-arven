/**
 * Logica de execucao da migracao. Separada do CLI pra ser testavel.
 * Importa service-role: BYPASSA RLS. So roda em scripts/ por regra ESLint.
 */
import { createClient } from "@supabase/supabase-js";
import { formatBRL } from "@/lib/money/cents";
import type { Database } from "@/lib/supabase/types";
import type { MigrationClient, MigrationContract, MigrationFile } from "@/scripts/migration/schema";

export interface RunOptions {
  url: string;
  serviceKey: string;
}

export interface ContractResult {
  contract_seed_ref: string;
  contract_id: string;
  contract_action: "inserted" | "skipped_exists";
  mrr_cents: number;
}

export interface ClientResult {
  client_seed_ref: string;
  client_id: string;
  client_action: "inserted" | "reused";
  contracts: ContractResult[];
}

export interface RunResult {
  ok: boolean;
  message: string;
  expected_total_cents: number;
  computed_total_cents: number;
  diff_cents: number;
  snapshot_date: string;
  snapshot_created: boolean;
  active_contracts: number;
  active_clients: number;
  per_client: ClientResult[];
}

type Client = ReturnType<typeof createClient<Database>>;

export async function runMigration(data: MigrationFile, opts: RunOptions): Promise<RunResult> {
  const supabase = createClient<Database>(opts.url, opts.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const perClient: ClientResult[] = [];

  for (const entry of data.clients) {
    const result = await upsertEntry(supabase, entry);
    perClient.push(result);
  }

  // Validacao 1: soma dos contratos que a migracao processou.
  // Le do banco pra pegar valor REAL (pega drift se algum contrato pre-existente
  // tem mrr_cents diferente do que o JSON declara).
  const seedRefs = perClient.flatMap((c) => c.contracts.map((ct) => ct.contract_seed_ref));
  const migrationTotals = await readMigrationTotal(supabase, seedRefs);
  const diff = migrationTotals.computed_total_cents - data.expected_total_cents;

  if (diff !== 0) {
    return {
      ok: false,
      message: `MRR dos contratos migrados no banco (${formatBRL(BigInt(migrationTotals.computed_total_cents))}) nao bate com esperado (${formatBRL(BigInt(data.expected_total_cents))}). Diff = ${formatBRL(BigInt(diff))}. Investigue antes de criar snapshot.`,
      expected_total_cents: data.expected_total_cents,
      computed_total_cents: migrationTotals.computed_total_cents,
      diff_cents: diff,
      snapshot_date: data.snapshot_date,
      snapshot_created: false,
      active_contracts: migrationTotals.active_contracts,
      active_clients: migrationTotals.active_clients,
      per_client: perClient,
    };
  }

  // Snapshot reflete o estado LIVE do MRR (todos contratos ativos, nao so
  // os da migracao). Se a migracao e o unico source, os dois batem; em
  // testes/futuro pode haver contratos manuais que tambem contam.
  const liveTotals = await readActiveTotals(supabase);

  const snapshotCreated = await ensureSnapshot(supabase, {
    snapshot_date: data.snapshot_date,
    mrr_cents: liveTotals.computed_total_cents,
    active_clients: liveTotals.active_clients,
    active_contracts: liveTotals.active_contracts,
  });

  return {
    ok: true,
    message: `Migracao concluida. ${perClient.length.toString()} clientes processados. MRR migrado: ${formatBRL(BigInt(migrationTotals.computed_total_cents))}. Snapshot do dia: ${formatBRL(BigInt(liveTotals.computed_total_cents))}.`,
    expected_total_cents: data.expected_total_cents,
    computed_total_cents: migrationTotals.computed_total_cents,
    diff_cents: 0,
    snapshot_date: data.snapshot_date,
    snapshot_created: snapshotCreated,
    active_contracts: migrationTotals.active_contracts,
    active_clients: migrationTotals.active_clients,
    per_client: perClient,
  };
}

async function readMigrationTotal(supabase: Client, seedRefs: string[]): Promise<Totals> {
  if (seedRefs.length === 0) {
    return { computed_total_cents: 0, active_clients: 0, active_contracts: 0 };
  }
  const { data, error } = await supabase
    .from("contracts")
    .select("mrr_cents, client_id, status")
    .eq("source", "migration")
    .in("source_ref", seedRefs);
  if (error) throw error;
  const active = data.filter((r) => r.status === "active");
  const total = active.reduce((acc, r) => acc + r.mrr_cents, 0);
  const clients = new Set(active.map((r) => r.client_id)).size;
  return {
    computed_total_cents: total,
    active_clients: clients,
    active_contracts: active.length,
  };
}

async function upsertEntry(supabase: Client, entry: MigrationClient): Promise<ClientResult> {
  // 1. Cliente: por document (unique), reaproveita se existe.
  const { data: existingClient, error: cReadErr } = await supabase
    .from("clients")
    .select("id")
    .eq("document", entry.document)
    .maybeSingle();
  if (cReadErr) throw cReadErr;

  let clientId: string;
  let clientAction: ClientResult["client_action"];

  if (existingClient) {
    clientId = existingClient.id;
    clientAction = "reused";
  } else {
    const { data: created, error: cErr } = await supabase
      .from("clients")
      .insert({
        name: entry.name,
        trade_name: entry.trade_name,
        document: entry.document,
        email: entry.email,
        phone: entry.phone,
      })
      .select("id")
      .single();
    if (cErr) throw cErr;
    clientId = created.id;
    clientAction = "inserted";
  }

  // 2. Para cada contrato do cliente, upsert por seed_ref (unique parcial).
  const contracts: ContractResult[] = [];
  for (const ct of entry.contracts) {
    contracts.push(await upsertContract(supabase, clientId, ct));
  }

  return {
    client_seed_ref: entry.seed_ref,
    client_id: clientId,
    client_action: clientAction,
    contracts,
  };
}

async function upsertContract(
  supabase: Client,
  clientId: string,
  ct: MigrationContract,
): Promise<ContractResult> {
  const { data: existing, error: readErr } = await supabase
    .from("contracts")
    .select("id")
    .eq("source", "migration")
    .eq("source_ref", ct.seed_ref)
    .maybeSingle();
  if (readErr) throw readErr;

  if (existing) {
    return {
      contract_seed_ref: ct.seed_ref,
      contract_id: existing.id,
      contract_action: "skipped_exists",
      mrr_cents: ct.mrr_cents,
    };
  }

  const { data: inserted, error: insErr } = await supabase
    .from("contracts")
    .insert({
      client_id: clientId,
      mrr_cents: ct.mrr_cents,
      start_date: ct.start_date,
      end_date: ct.end_date,
      status: "active",
      source: "migration",
      source_ref: ct.seed_ref,
    })
    .select("id")
    .single();
  if (insErr) throw insErr;

  return {
    contract_seed_ref: ct.seed_ref,
    contract_id: inserted.id,
    contract_action: "inserted",
    mrr_cents: ct.mrr_cents,
  };
}

interface Totals {
  computed_total_cents: number;
  active_clients: number;
  active_contracts: number;
}

async function readActiveTotals(supabase: Client): Promise<Totals> {
  const { data, error } = await supabase
    .from("mrr_current")
    .select("mrr_cents, active_clients, active_contracts")
    .single();
  if (error) throw error;
  return {
    computed_total_cents: data.mrr_cents ?? 0,
    active_clients: data.active_clients ?? 0,
    active_contracts: data.active_contracts ?? 0,
  };
}

/**
 * Cria snapshot do dia se ainda nao existe. Idempotente: a tabela tem
 * UNIQUE (snapshot_date), entao re-rodar nao duplica.
 */
async function ensureSnapshot(
  supabase: Client,
  payload: {
    snapshot_date: string;
    mrr_cents: number;
    active_clients: number;
    active_contracts: number;
  },
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("mrr_snapshots")
    .select("id")
    .eq("snapshot_date", payload.snapshot_date)
    .maybeSingle();

  if (existing) return false;

  const { error } = await supabase.from("mrr_snapshots").insert({
    snapshot_date: payload.snapshot_date,
    mrr_cents: payload.mrr_cents,
    active_clients: payload.active_clients,
    active_contracts: payload.active_contracts,
    new_mrr_cents: payload.mrr_cents, // marco zero da serie
    churned_mrr_cents: 0,
  });
  if (error) throw error;
  return true;
}
