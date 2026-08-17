"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import {
  clientCreateSchema,
  clientUpdateSchema,
  type ClientCreateValues,
  type ClientUpdateValues,
} from "@/modules/clients/schemas";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  fieldErrors?: Record<string, string[]>;
  message?: string;
}

export async function createClient(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireUser();
  const parsed = clientCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: flatten(parsed.error),
      message: "Verifique os campos do formulario.",
    };
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("clients")
    .insert(parsed.data satisfies ClientCreateValues)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Ja existe cliente com este documento." };
    }
    if (error.code === "42501") {
      return { ok: false, message: "Acesso negado. Voce precisa de role admin ou owner." };
    }
    return { ok: false, message: error.message };
  }

  revalidatePath("/clientes");
  return { ok: true, data: { id: data.id } };
}

export async function updateClient(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireUser();
  const parsed = clientUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: flatten(parsed.error),
      message: "Verifique os campos do formulario.",
    };
  }

  const { id, ...patch } = parsed.data satisfies ClientUpdateValues;
  const supabase = await getServerSupabase();
  const { error, data } = await supabase.from("clients").update(patch).eq("id", id).select("id");
  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Ja existe cliente com este documento." };
    }
    return { ok: false, message: error.message };
  }
  if (data.length === 0) {
    return { ok: false, message: "Acesso negado ou cliente nao encontrado." };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { ok: true, data: { id } };
}

function flatten(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
