/**
 * Views publicas:
 *  - contracts_active_today: so retorna o que e contabilizavel hoje
 *  - clients_with_status: status derivado bate com presenca de contrato ativo
 *  - mrr_current: soma confere com inputs
 *
 * RLS herda das tabelas (security_invoker=true). Roda como admin, garante
 * que o resultado e o esperado.
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

describeRls("views publicas", () => {
  const adminEmail = uniqueEmail("admin");
  const serviceClient = makeServiceClient();
  let adminClient: Awaited<ReturnType<typeof signInAs>>;
  let adminId = "";
  let activeClientId = "";
  let inactiveClientId = "";
  let activeContractId = "";
  let canceledContractId = "";

  beforeAll(async () => {
    const a = await createTestUser(serviceClient, adminEmail, "admin");
    adminId = a.id;
    adminClient = await signInAs(adminEmail, a.password);

    const today = new Date().toISOString().slice(0, 10);

    // Cliente A: tem contrato active vigente -> deve aparecer em active_today
    const { data: ac } = await serviceClient
      .from("clients")
      .insert({ name: `view-active-${today}` })
      .select("id")
      .single();
    activeClientId = ac!.id;

    const { data: ctrA } = await serviceClient
      .from("contracts")
      .insert({
        client_id: activeClientId,
        mrr_cents: 500000,
        start_date: "2026-01-01",
        end_date: "2027-01-01",
        status: "active",
      })
      .select("id")
      .single();
    activeContractId = ctrA!.id;

    // Cliente B: contrato canceled -> NAO conta em active_today, status inactive
    const { data: ic } = await serviceClient
      .from("clients")
      .insert({ name: `view-inactive-${today}` })
      .select("id")
      .single();
    inactiveClientId = ic!.id;

    const { data: ctrB } = await serviceClient
      .from("contracts")
      .insert({
        client_id: inactiveClientId,
        mrr_cents: 200000,
        start_date: "2026-01-01",
        end_date: "2027-01-01",
        status: "active",
      })
      .select("id")
      .single();
    canceledContractId = ctrB!.id;

    await serviceClient
      .from("contracts")
      .update({ status: "canceled" })
      .eq("id", canceledContractId);
  }, 30_000);

  afterAll(async () => {
    if (activeContractId) await serviceClient.from("contracts").delete().eq("id", activeContractId);
    if (canceledContractId)
      await serviceClient.from("contracts").delete().eq("id", canceledContractId);
    if (activeClientId) await serviceClient.from("clients").delete().eq("id", activeClientId);
    if (inactiveClientId) await serviceClient.from("clients").delete().eq("id", inactiveClientId);
    if (adminId) await deleteUser(serviceClient, adminId);
  });

  it("contracts_active_today contem o contrato ativo", async () => {
    const { data, error } = await adminClient
      .from("contracts_active_today")
      .select("id")
      .eq("id", activeContractId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("contracts_active_today NAO contem o cancelado", async () => {
    const { data, error } = await adminClient
      .from("contracts_active_today")
      .select("id")
      .eq("id", canceledContractId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("clients_with_status: cliente com active e 'active'", async () => {
    const { data } = await adminClient
      .from("clients_with_status")
      .select("id, status")
      .eq("id", activeClientId)
      .single();
    expect(data?.status).toBe("active");
  });

  it("clients_with_status: cliente so com canceled e 'inactive'", async () => {
    const { data } = await adminClient
      .from("clients_with_status")
      .select("id, status")
      .eq("id", inactiveClientId)
      .single();
    expect(data?.status).toBe("inactive");
  });

  it("mrr_current >= 500000 (o nosso contrato ativo)", async () => {
    const { data, error } = await adminClient
      .from("mrr_current")
      .select("mrr_cents, active_contracts")
      .single();
    expect(error).toBeNull();
    expect(data?.mrr_cents ?? 0).toBeGreaterThanOrEqual(500000);
    expect(data?.active_contracts ?? 0).toBeGreaterThanOrEqual(1);
  });
});
