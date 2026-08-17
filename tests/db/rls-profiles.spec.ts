/**
 * Testes de RLS na tabela `profiles`.
 *
 * Padrao adotado pra suite RLS:
 *  1. Service-role cria 2 usuarios de teste (admin + member).
 *  2. Pra cada usuario, abre um client autenticado e exercita as policies:
 *     - SELECT: cada um ve so o que pode
 *     - UPDATE: usuario edita o proprio, nao edita o do outro
 *     - UPDATE de role: member nao consegue, admin consegue
 *     - INSERT direto: bloqueado pra todos
 *     - DELETE direto: bloqueado pra todos
 *  3. Cleanup do service-role: apaga os usuarios via auth admin
 *     (cascade derruba profiles).
 *
 * Roda contra Supabase local. Skipa silenciosamente se as envs nao estiverem
 * definidas, pra nao quebrar CI quando o stack ainda nao subiu.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

type AppRole = "owner" | "admin" | "member";

interface TestDB {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: { id: string; email: string; display_name?: string | null; role?: AppRole };
        Update: { display_name?: string | null; role?: AppRole; email?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { app_role: AppRole };
    CompositeTypes: Record<string, never>;
  };
}

type Client = ReturnType<typeof createClient<TestDB>>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

const enabled = Boolean(url && anon && service);

const describeRls = enabled ? describe : describe.skip;

describeRls("RLS profiles", () => {
  const stamp = Date.now().toString();
  const admin = { email: `admin+${stamp}@arven.test`, password: "test-password-123!" };
  const member = { email: `member+${stamp}@arven.test`, password: "test-password-123!" };

  let adminId = "";
  let memberId = "";
  let adminClient: Client;
  let memberClient: Client;
  let serviceClient: Client;

  beforeAll(async () => {
    serviceClient = createClient<TestDB>(url!, service!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: a, error: aErr } = await serviceClient.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
    });
    if (aErr) throw aErr;
    adminId = a.user.id;

    const { data: m, error: mErr } = await serviceClient.auth.admin.createUser({
      email: member.email,
      password: member.password,
      email_confirm: true,
    });
    if (mErr) throw mErr;
    memberId = m.user.id;

    const { error: upErr } = await serviceClient
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", adminId);
    if (upErr) throw upErr;

    adminClient = createClient<TestDB>(url!, anon!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: la } = await adminClient.auth.signInWithPassword(admin);
    if (la) throw la;

    memberClient = createClient<TestDB>(url!, anon!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: lm } = await memberClient.auth.signInWithPassword(member);
    if (lm) throw lm;
  }, 30_000);

  afterAll(async () => {
    if (adminId) await serviceClient.auth.admin.deleteUser(adminId);
    if (memberId) await serviceClient.auth.admin.deleteUser(memberId);
  });

  it("member ve so o proprio profile", async () => {
    const { data, error } = await memberClient.from("profiles").select("id, role");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0]?.id).toBe(memberId);
    expect(data?.[0]?.role).toBe("member");
  });

  it("admin ve todos os profiles", async () => {
    const { data, error } = await adminClient.from("profiles").select("id");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    const ids = data?.map((r) => r.id) ?? [];
    expect(ids).toContain(adminId);
    expect(ids).toContain(memberId);
  });

  it("member atualiza o proprio display_name", async () => {
    const { error } = await memberClient
      .from("profiles")
      .update({ display_name: "Member Test" })
      .eq("id", memberId);
    expect(error).toBeNull();
  });

  it("member NAO atualiza profile do admin", async () => {
    const { error, data } = await memberClient
      .from("profiles")
      .update({ display_name: "tentativa" })
      .eq("id", adminId)
      .select();
    const rowsTouched = error === null ? data.length : 0;
    expect(rowsTouched).toBe(0);
  });

  it("member NAO troca a propria role", async () => {
    const { error } = await memberClient
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", memberId);
    expect(error).not.toBeNull();
  });

  it("admin troca a role de um member", async () => {
    const { error } = await adminClient
      .from("profiles")
      .update({ role: "member" })
      .eq("id", memberId);
    expect(error).toBeNull();
  });

  it("INSERT direto via client autenticado e negado", async () => {
    const { error } = await memberClient
      .from("profiles")
      .insert({ id: crypto.randomUUID(), email: "x@arven.test" });
    expect(error).not.toBeNull();
  });

  it("DELETE direto via client autenticado e negado", async () => {
    const { error, data } = await memberClient
      .from("profiles")
      .delete()
      .eq("id", memberId)
      .select();
    const rowsDeleted = error === null ? data.length : 0;
    expect(rowsDeleted).toBe(0);
  });
});
