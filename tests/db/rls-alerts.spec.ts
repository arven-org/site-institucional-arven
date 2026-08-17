/**
 * RLS de alerts: leitura aberta, update aberto (acknowledge/resolve),
 * insert/delete bloqueados pra qualquer authenticated.
 * Trigger de status carimba acknowledged_at/resolved_at.
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

describeRls("RLS + triggers alerts", () => {
  const memberEmail = uniqueEmail("member");
  const serviceClient = makeServiceClient();
  let memberClient: Awaited<ReturnType<typeof signInAs>>;
  let memberId = "";
  let contractId = "";
  let alertId = "";

  beforeAll(async () => {
    const m = await createTestUser(serviceClient, memberEmail, "member");
    memberId = m.id;
    memberClient = await signInAs(memberEmail, m.password);

    const { data: client } = await serviceClient
      .from("clients")
      .insert({ name: "Cliente Alerta" })
      .select("id")
      .single();
    const { data: contract } = await serviceClient
      .from("contracts")
      .insert({
        client_id: client!.id,
        mrr_cents: 100000,
        start_date: "2026-01-01",
        end_date: "2026-06-15",
      })
      .select("id")
      .single();
    contractId = contract!.id;

    const { data: alert } = await serviceClient
      .from("alerts")
      .insert({
        contract_id: contractId,
        type: "expiring",
        trigger_date: "2026-05-15",
      })
      .select("id")
      .single();
    alertId = alert!.id;
  }, 30_000);

  afterAll(async () => {
    if (alertId) await serviceClient.from("alerts").delete().eq("id", alertId);
    if (contractId) {
      const { data: c } = await serviceClient
        .from("contracts")
        .select("client_id")
        .eq("id", contractId)
        .single();
      await serviceClient.from("contracts").delete().eq("id", contractId);
      if (c?.client_id) await serviceClient.from("clients").delete().eq("id", c.client_id);
    }
    if (memberId) await deleteUser(serviceClient, memberId);
  });

  it("member LE alerta", async () => {
    const { data, error } = await memberClient
      .from("alerts")
      .select("id, status")
      .eq("id", alertId);
    expect(error).toBeNull();
    expect(data?.[0]?.status).toBe("pending");
  });

  it("member ACKNOWLEDGE: trigger preenche acknowledged_at", async () => {
    const { error } = await memberClient
      .from("alerts")
      .update({ status: "acknowledged" })
      .eq("id", alertId);
    expect(error).toBeNull();

    const { data } = await memberClient
      .from("alerts")
      .select("status, acknowledged_at, acknowledged_by, resolved_at")
      .eq("id", alertId)
      .single();
    expect(data?.status).toBe("acknowledged");
    expect(data?.acknowledged_at).not.toBeNull();
    expect(data?.acknowledged_by).toBe(memberId);
    expect(data?.resolved_at).toBeNull();
  });

  it("member RESOLVE: trigger preenche resolved_at", async () => {
    const { error } = await memberClient
      .from("alerts")
      .update({ status: "resolved" })
      .eq("id", alertId);
    expect(error).toBeNull();

    const { data } = await memberClient
      .from("alerts")
      .select("status, resolved_at, resolved_by")
      .eq("id", alertId)
      .single();
    expect(data?.status).toBe("resolved");
    expect(data?.resolved_at).not.toBeNull();
    expect(data?.resolved_by).toBe(memberId);
  });

  it("member NAO INSERE alerta (so cron)", async () => {
    const { error } = await memberClient.from("alerts").insert({
      contract_id: contractId,
      type: "renewal_due",
      trigger_date: "2026-07-01",
    });
    expect(error).not.toBeNull();
  });

  it("member NAO DELETA alerta", async () => {
    const { data: created } = await serviceClient
      .from("alerts")
      .insert({
        contract_id: contractId,
        type: "renewal_due",
        trigger_date: "2026-08-01",
      })
      .select("id")
      .single();

    const { error, data } = await memberClient
      .from("alerts")
      .delete()
      .eq("id", created!.id)
      .select();
    const deleted = error === null ? data.length : 0;
    expect(deleted).toBe(0);

    await serviceClient.from("alerts").delete().eq("id", created!.id);
  });
});
