/**
 * RLS de mrr_snapshots e contract_status_log:
 * authenticated le, ninguem escreve direto (so service-role).
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

describeRls("RLS snapshots + status_log", () => {
  const adminEmail = uniqueEmail("admin");
  const serviceClient = makeServiceClient();
  let adminClient: Awaited<ReturnType<typeof signInAs>>;
  let adminId = "";

  beforeAll(async () => {
    const a = await createTestUser(serviceClient, adminEmail, "admin");
    adminId = a.id;
    adminClient = await signInAs(adminEmail, a.password);

    // Seed um snapshot
    await serviceClient.from("mrr_snapshots").insert({
      snapshot_date: "2026-05-24",
      mrr_cents: 6410000,
      active_clients: 21,
      active_contracts: 21,
      new_mrr_cents: 0,
      churned_mrr_cents: 0,
    });
  }, 30_000);

  afterAll(async () => {
    await serviceClient.from("mrr_snapshots").delete().eq("snapshot_date", "2026-05-24");
    if (adminId) await deleteUser(serviceClient, adminId);
  });

  it("admin LE snapshots", async () => {
    const { data, error } = await adminClient
      .from("mrr_snapshots")
      .select("snapshot_date, mrr_cents");
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });

  it("admin NAO INSERE snapshot", async () => {
    const { error } = await adminClient.from("mrr_snapshots").insert({
      snapshot_date: "2026-05-25",
      mrr_cents: 1,
      active_clients: 1,
      active_contracts: 1,
      new_mrr_cents: 0,
      churned_mrr_cents: 0,
    });
    expect(error).not.toBeNull();
  });

  it("admin NAO UPDATE snapshot", async () => {
    const { error, data } = await adminClient
      .from("mrr_snapshots")
      .update({ mrr_cents: 1 })
      .eq("snapshot_date", "2026-05-24")
      .select();
    const touched = error === null ? data.length : 0;
    expect(touched).toBe(0);
  });

  it("admin LE log, NAO INSERE", async () => {
    const { data: logs } = await adminClient.from("contract_status_log").select("id").limit(1);
    expect(Array.isArray(logs)).toBe(true);

    // Cria contrato pra ter um id valido pro insert tentativo
    const { data: client } = await serviceClient
      .from("clients")
      .insert({ name: "log-client" })
      .select("id")
      .single();
    const { data: contract } = await serviceClient
      .from("contracts")
      .insert({ client_id: client!.id, mrr_cents: 1, start_date: "2026-01-01" })
      .select("id")
      .single();

    const { error: insertErr } = await adminClient.from("contract_status_log").insert({
      contract_id: contract!.id,
      to_status: "active",
    });
    expect(insertErr).not.toBeNull();

    await serviceClient.from("contracts").delete().eq("id", contract!.id);
    await serviceClient.from("clients").delete().eq("id", client!.id);
  });
});
