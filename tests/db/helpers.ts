/**
 * Helpers compartilhados pelas suites de RLS.
 *  - cria usuarios (admin/member/owner) reproduzindo a regra de teste
 *    da fatia 1
 *  - retorna clients autenticados como cada um
 *  - cleanup centralizado
 *
 * Skipa silenciosamente se .env nao tiver as keys (CI fora do banco).
 */
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@supabase/supabase-js";

export type AppRole = Database["public"]["Enums"]["app_role"];

type AuthedClient = ReturnType<typeof createClient<Database>>;

export const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dbEnabled = Boolean(url && anon && service);

export function makeServiceClient(): AuthedClient {
  return createClient<Database>(url!, service!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function createTestUser(
  serviceClient: AuthedClient,
  email: string,
  role: AppRole,
): Promise<{ id: string; password: string }> {
  const password = "test-password-123!";
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  const id = data.user.id;
  const { error: upErr } = await serviceClient.from("profiles").update({ role }).eq("id", id);
  if (upErr) throw upErr;

  return { id, password };
}

export async function signInAs(email: string, password: string): Promise<AuthedClient> {
  const client = createClient<Database>(url!, anon!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

export async function deleteUser(serviceClient: AuthedClient, id: string): Promise<void> {
  await serviceClient.auth.admin.deleteUser(id);
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}+${Date.now().toString()}-${Math.random().toString(36).slice(2, 8)}@arven.test`;
}
