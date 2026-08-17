/**
 * RLS de growth_scenarios + growth_monthly:
 *  - select aberto
 *  - escrita so owner/admin
 *  - constraint month_start primeiro do mes
 *  - cascade delete: apagar cenario apaga seus growth_monthly
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

describeRls("RLS growth_*", () => {
  const adminEmail = uniqueEmail("admin");
  const memberEmail = uniqueEmail("member");
  const serviceClient = makeServiceClient();
  let adminClient: Awaited<ReturnType<typeof signInAs>>;
  let memberClient: Awaited<ReturnType<typeof signInAs>>;
  let adminId = "";
  let memberId = "";
  let scenarioId = "";

  beforeAll(async () => {
    const a = await createTestUser(serviceClient, adminEmail, "admin");
    const m = await createTestUser(serviceClient, memberEmail, "member");
    adminId = a.id;
    memberId = m.id;
    adminClient = await signInAs(adminEmail, a.password);
    memberClient = await signInAs(memberEmail, m.password);
  }, 30_000);

  afterAll(async () => {
    if (scenarioId) await serviceClient.from("growth_scenarios").delete().eq("id", scenarioId);
    if (adminId) await deleteUser(serviceClient, adminId);
    if (memberId) await deleteUser(serviceClient, memberId);
  });

  it("admin cria cenario", async () => {
    const { data, error } = await adminClient
      .from("growth_scenarios")
      .insert({
        name: `Cenario Teste ${Date.now().toString()}`,
        kind: "forecast",
        churn_assumption_bps: 250,
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBeDefined();
    if (data?.id) scenarioId = data.id;
  });

  it("member LE, mas NAO cria", async () => {
    const { data: read } = await memberClient.from("growth_scenarios").select("id").limit(1);
    expect(read).not.toBeNull();

    const { error } = await memberClient.from("growth_scenarios").insert({
      name: "member tentativa",
      kind: "meta",
      churn_assumption_bps: 100,
    });
    expect(error).not.toBeNull();
  });

  it("CHECK: month_start nao-primeiro-do-mes rejeitado", async () => {
    const { error } = await adminClient.from("growth_monthly").insert({
      scenario_id: scenarioId,
      month_start: "2026-01-15",
      target_active_clients: 30,
    });
    expect(error).not.toBeNull();
    expect(error?.message ?? "").toMatch(/first_of_month/i);
  });

  it("admin cria growth_monthly com primeiro do mes", async () => {
    const { error } = await adminClient.from("growth_monthly").insert({
      scenario_id: scenarioId,
      month_start: "2026-02-01",
      target_active_clients: 25,
      planned_new_contracts: 4,
      ticket_growth_bps: 200,
      capacity_new_contracts: 5,
    });
    expect(error).toBeNull();
  });

  it("UNIQUE: dois growth_monthly no mesmo mes pro mesmo cenario rejeitado", async () => {
    const { error } = await adminClient.from("growth_monthly").insert({
      scenario_id: scenarioId,
      month_start: "2026-02-01",
      target_active_clients: 99,
    });
    expect(error).not.toBeNull();
  });

  it("member NAO altera growth_monthly", async () => {
    const { data: month } = await adminClient
      .from("growth_monthly")
      .select("id")
      .eq("scenario_id", scenarioId)
      .eq("month_start", "2026-02-01")
      .single();
    const { error, data } = await memberClient
      .from("growth_monthly")
      .update({ target_active_clients: 1 })
      .eq("id", month!.id)
      .select();
    const touched = error === null ? data.length : 0;
    expect(touched).toBe(0);
  });
});
