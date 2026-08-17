"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { canTransition } from "@/modules/contracts/states";
import {
  contractCreateSchema,
  contractTransitionSchema,
  contractUpdateSchema,
} from "@/modules/contracts/schemas";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  fieldErrors?: Record<string, string[]>;
  message?: string;
}

export async function createContract(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireUser();
  const parsed = contractCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error), message: "Verifique o formulario." };
  }

  const supabase = await getServerSupabase();
  const { mrr_reais, ...rest } = parsed.data;
  const insert = { ...rest, mrr_cents: mrr_reais };
  const { data, error } = await supabase.from("contracts").insert(insert).select("id").single();
  if (error) return mapPgError(error);

  revalidatePath("/contratos");
  revalidatePath("/dashboard");
  if (rest.client_id) revalidatePath(`/clientes/${rest.client_id}`);
  return { ok: true, data: { id: data.id } };
}

export async function updateContract(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireUser();
  const parsed = contractUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error), message: "Verifique o formulario." };
  }

  const supabase = await getServerSupabase();
  const { id, mrr_reais, ...rest } = parsed.data;
  const patch = { ...rest, mrr_cents: mrr_reais };

  const { error, data } = await supabase.from("contracts").update(patch).eq("id", id).select("id");
  if (error) return mapPgError(error);
  if (data.length === 0) {
    return { ok: false, message: "Acesso negado ou contrato nao encontrado." };
  }

  revalidatePath("/contratos");
  revalidatePath(`/contratos/${id}`);
  revalidatePath("/dashboard");
  return { ok: true, data: { id } };
}

export async function transitionContractStatus(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requireUser();
  const parsed = contractTransitionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Entrada invalida." };
  }
  const { id, to } = parsed.data;

  const supabase = await getServerSupabase();
  const { data: current, error: readErr } = await supabase
    .from("contracts")
    .select("status, client_id")
    .eq("id", id)
    .single();
  if (readErr) {
    return { ok: false, message: "Contrato nao encontrado." };
  }

  if (!canTransition(current.status, to)) {
    return {
      ok: false,
      message: `Transicao invalida: ${current.status} -> ${to}.`,
    };
  }

  const { error: upErr } = await supabase.from("contracts").update({ status: to }).eq("id", id);
  if (upErr) return mapPgError(upErr);

  revalidatePath("/contratos");
  revalidatePath(`/contratos/${id}`);
  revalidatePath("/dashboard");
  if (current.client_id) revalidatePath(`/clientes/${current.client_id}`);
  return { ok: true, data: { id } };
}

function mapPgError(error: { code?: string; message: string }): ActionResult<never> {
  if (error.code === "23514") {
    return { ok: false, message: "Dados violam uma regra do contrato. Confira os campos." };
  }
  if (error.code === "42501") {
    return { ok: false, message: "Acesso negado. Voce precisa de role admin ou owner." };
  }
  return { ok: false, message: error.message };
}

function flatten(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
