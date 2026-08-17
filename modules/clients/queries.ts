import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors";

export interface ClientRow {
  id: string;
  name: string;
  trade_name: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export async function listClients(): Promise<ClientRow[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("clients_with_status")
    .select("id, name, trade_name, document, email, phone, notes, status, created_at, updated_at")
    .order("name", { ascending: true });
  if (error) throw error;
  return data.map((row) => ({
    ...row,
    status: row.status === "active" ? ("active" as const) : ("inactive" as const),
  })) as ClientRow[];
}

export async function getClient(id: string): Promise<ClientRow> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("clients_with_status")
    .select("id, name, trade_name, document, email, phone, notes, status, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new NotFoundError("Cliente");
  return {
    ...data,
    status: data.status === "active" ? "active" : "inactive",
  } as ClientRow;
}

export interface ClientOption {
  id: string;
  name: string;
  trade_name: string | null;
}

export async function listClientOptions(): Promise<ClientOption[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, trade_name")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}
