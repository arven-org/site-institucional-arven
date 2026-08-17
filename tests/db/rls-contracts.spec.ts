/**
 * RLS de public.contracts + constraints + triggers
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createTestUser,
  dbEnabled,
  deleteUser,
  makeServiceClient,
  signInAs,
  uniqueEmail,
} from "./helpers";

const describeRls = dbEnabled ? describe : describe.skip;

describeRls("RLS + constraints + triggers contracts", () => {
  const adminEmail = uniqueEmail("admin");
  const memberEmail = uniqueEmail("member");

  const serviceClient = makeServiceClient();
  let adminClient: Awaited<ReturnType<typeof signInAs>>;
  let memberClient: Awaited<ReturnType<typeof signInAs>>;
  let adminId = "";
  let memberId = "";
  let clientId = "";

  beforeAll(async () => {
    const a = await createTestUser(serviceClient, adminEmail, "admin");
    const m = await createTestUser(serviceClient, memberEmail, "member");
    adminId = a.id;
    memberId = m.id;
    adminClient = await signInAs(adminEmail, a.password);
    memberClient = await signInAs(memberEmail, m.password);

    const { data, error } = await serviceClient
      .from("clients")
      .insert({ name: "Cliente Contrato", document: `CLT-${Date.now().toString()}` })
      .select("id")
      .single();
    if (error) throw error;
    clientId = data.id;
  }, 30_000);

  afterAll(async () => {
    if (clientId) await serviceClient.from("contracts").delete().eq("client_id", clientId);
    if (clientId) await serviceClient.from("clients").delete().eq("id", clientId);
    if (adminId) await deleteUser(serviceClient, adminId);
    if (memberId) await deleteUser(serviceClient, memberId);
  });

  it("admin cria contrato draft", async () => {
    const { data, error } = await adminClient
      .from("contracts")
      .insert({
        client_id: clientId,
        mrr_cents: 350000,
        start_date: "2026-01-01",
        end_date: "2027-01-01",
      })
      .select("id, status, canceled_at, ended_at")
      .single();
    expect(error).toBeNull();
    expect(data?.status).toBe("draft");
    expect(data?.canceled_at).toBeNull();
    expect(data?.ended_at).toBeNull();
  });

  it("member NAO cria contrato", async () => {
    const { error } = await memberClient.from("contracts").insert({
      client_id: clientId,
      mrr_cents: 100000,
      start_date: "2026-01-01",
    });
    expect(error).not.toBeNull();
  });

  it("CHECK: mrr_cents negativo rejeitado", async () => {
    const { error } = await adminClient.from("contracts").insert({
      client_id: clientId,
      mrr_cents: -1,
      start_date: "2026-01-01",
    });
    expect(error).not.toBeNull();
    expect(error?.message ?? "").toMatch(/mrr_nonneg/i);
  });

  it("CHECK: end_date < start_date rejeitado", async () => {
    const { error } = await adminClient.from("contracts").insert({
      client_id: clientId,
      mrr_cents: 100000,
      start_date: "2026-06-01",
      end_date: "2026-05-01",
    });
    expect(error).not.toBeNull();
    expect(error?.message ?? "").toMatch(/dates_order/i);
  });

  it("trigger: status -> canceled carimba canceled_at e log e populado", async () => {
    const { data: created, error: cErr } = await adminClient
      .from("contracts")
      .insert({
        client_id: clientId,
        mrr_cents: 200000,
        start_date: "2026-01-01",
      })
      .select("id")
      .single();
    expect(cErr).toBeNull();
    const contractId = created!.id;

    // active primeiro (draft -> active)
    const { error: e1 } = await adminClient
      .from("contracts")
      .update({ status: "active" })
      .eq("id", contractId);
    expect(e1).toBeNull();

    // active -> canceled
    const { error: e2 } = await adminClient
      .from("contracts")
      .update({ status: "canceled" })
      .eq("id", contractId);
    expect(e2).toBeNull();

    const { data: post } = await adminClient
      .from("contracts")
      .select("status, canceled_at, ended_at")
      .eq("id", contractId)
      .single();
    expect(post?.status).toBe("canceled");
    expect(post?.canceled_at).not.toBeNull();
    expect(post?.ended_at).toBeNull();

    const { data: log } = await adminClient
      .from("contract_status_log")
      .select("from_status, to_status")
      .eq("contract_id", contractId)
      .order("changed_at", { ascending: true });
    const transitions = log?.map((l) => `${l.from_status ?? "-"}->${l.to_status}`) ?? [];
    expect(transitions).toEqual(["-->draft", "draft->active", "active->canceled"]);
  });

  it("trigger: status -> ended carimba ended_at, nao mexe em canceled_at", async () => {
    const { data: created } = await adminClient
      .from("contracts")
      .insert({
        client_id: clientId,
        mrr_cents: 150000,
        start_date: "2026-01-01",
        end_date: "2026-12-31",
      })
      .select("id")
      .single();
    const contractId = created!.id;
    await adminClient.from("contracts").update({ status: "active" }).eq("id", contractId);
    await adminClient.from("contracts").update({ status: "ended" }).eq("id", contractId);
    const { data: post } = await adminClient
      .from("contracts")
      .select("status, canceled_at, ended_at")
      .eq("id", contractId)
      .single();
    expect(post?.status).toBe("ended");
    expect(post?.ended_at).not.toBeNull();
    expect(post?.canceled_at).toBeNull();
  });

  it("member NAO altera contrato", async () => {
    const { data: created } = await adminClient
      .from("contracts")
      .insert({
        client_id: clientId,
        mrr_cents: 100000,
        start_date: "2026-01-01",
      })
      .select("id")
      .single();
    const contractId = created!.id;
    const { error, data } = await memberClient
      .from("contracts")
      .update({ mrr_cents: 999999 })
      .eq("id", contractId)
      .select();
    const touched = error === null ? data.length : 0;
    expect(touched).toBe(0);
  });

  it("ninguem deleta contrato direto, nem admin", async () => {
    const { data: created } = await adminClient
      .from("contracts")
      .insert({
        client_id: clientId,
        mrr_cents: 100000,
        start_date: "2026-01-01",
      })
      .select("id")
      .single();
    const contractId = created!.id;
    const { error, data } = await adminClient
      .from("contracts")
      .delete()
      .eq("id", contractId)
      .select();
    const deleted = error === null ? data.length : 0;
    expect(deleted).toBe(0);
  });
});
