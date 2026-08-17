import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors";
import type { ContractStatus } from "@/modules/contracts/states";

export interface ContractRow {
  id: string;
  client_id: string;
  client_name: string;
  status: ContractStatus;
  mrr_cents: number;
  start_date: string;
  end_date: string | null;
  canceled_at: string | null;
  ended_at: string | null;
  renewal_of: string | null;
  pdf_path: string | null;
  source: "manual" | "google_form" | "migration";
  source_ref: string | null;
  created_at: string;
  updated_at: string;
}

const SELECT_WITH_CLIENT = `
  id, client_id, status, mrr_cents, start_date, end_date,
  canceled_at, ended_at, renewal_of, pdf_path, source, source_ref,
  created_at, updated_at,
  client:client_id ( name )
` as const;

interface RawWithJoin {
  id: string;
  client_id: string;
  status: ContractStatus;
  mrr_cents: number;
  start_date: string;
  end_date: string | null;
  canceled_at: string | null;
  ended_at: string | null;
  renewal_of: string | null;
  pdf_path: string | null;
  source: ContractRow["source"];
  source_ref: string | null;
  created_at: string;
  updated_at: string;
  client: { name: string } | { name: string }[] | null;
}

function pickClientName(row: RawWithJoin): string {
  if (!row.client) return "";
  if (Array.isArray(row.client)) return row.client[0]?.name ?? "";
  return row.client.name;
}

export interface ListContractsFilters {
  status?: ContractStatus[];
  search?: string;
}

export async function listContracts(filters: ListContractsFilters = {}): Promise<ContractRow[]> {
  const supabase = await getServerSupabase();
  let query = supabase
    .from("contracts")
    .select(SELECT_WITH_CLIENT)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as RawWithJoin[]).map((row) => toContractRow(row));
}

export async function listContractsByClient(clientId: string): Promise<ContractRow[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("contracts")
    .select(SELECT_WITH_CLIENT)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as RawWithJoin[]).map((row) => toContractRow(row));
}

export async function getContract(id: string): Promise<ContractRow> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("contracts")
    .select(SELECT_WITH_CLIENT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new NotFoundError("Contrato");
  const row = data as unknown;
  return toContractRow(row as RawWithJoin);
}

export interface ContractStatusLogEntry {
  id: string;
  from_status: ContractStatus | null;
  to_status: ContractStatus;
  changed_at: string;
  changed_by: string | null;
}

export async function getContractStatusHistory(id: string): Promise<ContractStatusLogEntry[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("contract_status_log")
    .select("id, from_status, to_status, changed_at, changed_by")
    .eq("contract_id", id)
    .order("changed_at", { ascending: false });
  if (error) throw error;
  return data;
}

export interface CurrentMrr {
  mrr_cents: number;
  active_clients: number;
  active_contracts: number;
}

export async function getCurrentMrr(): Promise<CurrentMrr> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("mrr_current")
    .select("mrr_cents, active_clients, active_contracts")
    .single();
  if (error) throw error;
  return {
    mrr_cents: data.mrr_cents ?? 0,
    active_clients: data.active_clients ?? 0,
    active_contracts: data.active_contracts ?? 0,
  };
}

function toContractRow(row: RawWithJoin): ContractRow {
  const { client: _client, ...rest } = row;
  return { ...rest, client_name: pickClientName(row) };
}
