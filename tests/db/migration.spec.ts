/**
 * Integration: runMigration contra Supabase local com fixture sintetica.
 * Verifica idempotencia (rodar 2x nao duplica) e que o snapshot fecha o dia.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { MigrationFile } from "@/scripts/migration/schema";
import { runMigration } from "@/scripts/migration/run";
import { dbEnabled, makeServiceClient, url, service } from "./helpers";

const describeMig = dbEnabled ? describe : describe.skip;

describeMig("migration runner", () => {
  const fixture: MigrationFile = {
    snapshot_date: "2026-05-23",
    expected_total_cents: 250000 + 175000 + 100000,
    clients: [
      {
        seed_ref: "TEST-MIG-001",
        name: "Migration Test A",
        trade_name: null,
        document: "TEST-MIG-DOC-A",
        email: null,
        phone: null,
        contracts: [
          {
            seed_ref: "TEST-MIG-001-C1",
            mrr_cents: 250000,
            start_date: "2024-01-01",
            end_date: null,
          },
        ],
      },
      {
        seed_ref: "TEST-MIG-002",
        name: "Migration Test B (multi-contract)",
        trade_name: null,
        document: "TEST-MIG-DOC-B",
        email: null,
        phone: null,
        contracts: [
          {
            seed_ref: "TEST-MIG-002-C1",
            mrr_cents: 175000,
            start_date: "2024-06-15",
            end_date: "2027-01-01",
          },
          {
            seed_ref: "TEST-MIG-002-C2",
            mrr_cents: 100000,
            start_date: "2025-02-01",
            end_date: null,
          },
        ],
      },
    ],
  };

  const seedRefs = ["TEST-MIG-001-C1", "TEST-MIG-002-C1", "TEST-MIG-002-C2"];
  const docs = ["TEST-MIG-DOC-A", "TEST-MIG-DOC-B"];
  const serviceClient = makeServiceClient();

  beforeAll(async () => {
    await serviceClient
      .from("contracts")
      .delete()
      .eq("source", "migration")
      .in("source_ref", seedRefs);
    await serviceClient.from("clients").delete().in("document", docs);
    await serviceClient.from("mrr_snapshots").delete().eq("snapshot_date", "2026-05-23");
  });

  afterAll(async () => {
    await serviceClient
      .from("contracts")
      .delete()
      .eq("source", "migration")
      .in("source_ref", seedRefs);
    await serviceClient.from("clients").delete().in("document", docs);
    await serviceClient.from("mrr_snapshots").delete().eq("snapshot_date", "2026-05-23");
  });

  it("primeira execucao insere clientes + contratos + snapshot", async () => {
    const result = await runMigration(fixture, { url: url!, serviceKey: service! });
    expect(result.ok).toBe(true);
    expect(result.snapshot_created).toBe(true);
    expect(result.per_client).toHaveLength(2);
    expect(result.per_client.every((c) => c.client_action === "inserted")).toBe(true);
    const allContracts = result.per_client.flatMap((c) => c.contracts);
    expect(allContracts).toHaveLength(3);
    expect(allContracts.every((c) => c.contract_action === "inserted")).toBe(true);
  });

  it("segunda execucao e idempotente: reusa clientes e pula contratos", async () => {
    const result = await runMigration(fixture, { url: url!, serviceKey: service! });
    expect(result.per_client.every((c) => c.client_action === "reused")).toBe(true);
    const allContracts = result.per_client.flatMap((c) => c.contracts);
    expect(allContracts.every((c) => c.contract_action === "skipped_exists")).toBe(true);
    expect(result.snapshot_created).toBe(false);
  });

  it("snapshot grava os totais corretos", async () => {
    const { data } = await serviceClient
      .from("mrr_snapshots")
      .select("mrr_cents, active_clients, active_contracts, new_mrr_cents, churned_mrr_cents")
      .eq("snapshot_date", "2026-05-23")
      .single();
    expect(data).not.toBeNull();
    expect(data?.churned_mrr_cents).toBe(0);
    expect(Number(data?.new_mrr_cents)).toBe(Number(data?.mrr_cents));
  });
});
