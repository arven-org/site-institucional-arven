import { describe, it, expect } from "vitest";
import { migrationFileSchema } from "../schema";

const base = {
  snapshot_date: "2026-05-25",
  expected_total_cents: 350000,
  clients: [
    {
      seed_ref: "ARV-001",
      name: "Acme Ltda",
      trade_name: "Acme",
      document: "00.000.000/0001-00",
      email: "x@a.com",
      phone: "(11) 99999-0000",
      contracts: [
        {
          seed_ref: "ARV-001-C1",
          mrr_cents: 350000,
          start_date: "2024-03-01",
          end_date: null,
        },
      ],
    },
  ],
};

describe("migrationFileSchema", () => {
  it("aceita payload valido minimo", () => {
    expect(migrationFileSchema.safeParse(base).success).toBe(true);
  });

  it("rejeita soma divergente", () => {
    const r = migrationFileSchema.safeParse({
      ...base,
      expected_total_cents: 999_999,
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(JSON.stringify(r.error)).toMatch(/nao bate/);
    }
  });

  it("rejeita seed_ref de cliente invalido", () => {
    const r = migrationFileSchema.safeParse({
      ...base,
      clients: [{ ...base.clients[0]!, seed_ref: "arv 001" }],
      expected_total_cents: 350000,
    });
    expect(r.success).toBe(false);
  });

  it("rejeita seed_ref de contrato invalido", () => {
    const r = migrationFileSchema.safeParse({
      ...base,
      clients: [
        {
          ...base.clients[0]!,
          contracts: [{ ...base.clients[0]!.contracts[0]!, seed_ref: "abc" }],
        },
      ],
    });
    expect(r.success).toBe(false);
  });

  it("rejeita document vazio", () => {
    const r = migrationFileSchema.safeParse({
      ...base,
      clients: [{ ...base.clients[0]!, document: "" }],
    });
    expect(r.success).toBe(false);
  });

  it("rejeita mrr_cents negativo", () => {
    const r = migrationFileSchema.safeParse({
      ...base,
      expected_total_cents: -100,
      clients: [
        {
          ...base.clients[0]!,
          contracts: [{ ...base.clients[0]!.contracts[0]!, mrr_cents: -100 }],
        },
      ],
    });
    expect(r.success).toBe(false);
  });

  it("rejeita seed_ref de cliente duplicado", () => {
    const c = base.clients[0]!;
    const r = migrationFileSchema.safeParse({
      ...base,
      expected_total_cents: 700000,
      clients: [
        c,
        {
          ...c,
          document: "11.111.111/0001-11",
          contracts: [{ ...c.contracts[0]!, seed_ref: "ARV-002-C1" }],
        },
      ],
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(JSON.stringify(r.error)).toMatch(/seed_ref de cliente duplicado/);
    }
  });

  it("rejeita seed_ref de contrato duplicado entre clientes", () => {
    const c = base.clients[0]!;
    const r = migrationFileSchema.safeParse({
      ...base,
      expected_total_cents: 700000,
      clients: [
        c,
        {
          ...c,
          seed_ref: "ARV-002",
          document: "11.111.111/0001-11",
          // mantem o mesmo seed_ref do contrato, deve quebrar
        },
      ],
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(JSON.stringify(r.error)).toMatch(/seed_ref de contrato duplicado/);
    }
  });

  it("rejeita document duplicado", () => {
    const c = base.clients[0]!;
    const r = migrationFileSchema.safeParse({
      ...base,
      expected_total_cents: 700000,
      clients: [
        c,
        {
          ...c,
          seed_ref: "ARV-002",
          contracts: [{ ...c.contracts[0]!, seed_ref: "ARV-002-C1" }],
        },
      ],
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(JSON.stringify(r.error)).toMatch(/document duplicado/);
    }
  });

  it("rejeita start_date no futuro", () => {
    const r = migrationFileSchema.safeParse({
      ...base,
      clients: [
        {
          ...base.clients[0]!,
          contracts: [{ ...base.clients[0]!.contracts[0]!, start_date: "2099-01-01" }],
        },
      ],
    });
    expect(r.success).toBe(false);
  });

  it("rejeita end_date < start_date", () => {
    const r = migrationFileSchema.safeParse({
      ...base,
      clients: [
        {
          ...base.clients[0]!,
          contracts: [
            {
              seed_ref: "ARV-001-C1",
              mrr_cents: 350000,
              start_date: "2024-12-01",
              end_date: "2024-06-01",
            },
          ],
        },
      ],
    });
    expect(r.success).toBe(false);
  });

  it("aceita cliente com multiplos contratos somando direito", () => {
    const r = migrationFileSchema.safeParse({
      snapshot_date: "2026-05-25",
      expected_total_cents: 700000,
      clients: [
        {
          ...base.clients[0]!,
          contracts: [
            { seed_ref: "ARV-001-C1", mrr_cents: 350000, start_date: "2024-03-01", end_date: null },
            { seed_ref: "ARV-001-C2", mrr_cents: 350000, start_date: "2024-09-01", end_date: null },
          ],
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("valida soma exata pra R$ 64.100 com 19 clientes (estilo migracao real)", () => {
    const clients = Array.from({ length: 18 }, (_, i) => ({
      seed_ref: `ARV-${(i + 1).toString().padStart(3, "0")}`,
      name: `Cliente ${(i + 1).toString()}`,
      trade_name: null,
      document: `${(i + 1).toString().padStart(2, "0")}.000.000/0001-00`,
      email: null,
      phone: null,
      contracts: [
        {
          seed_ref: `ARV-${(i + 1).toString().padStart(3, "0")}-C1`,
          mrr_cents: 300000,
          start_date: "2024-01-01",
          end_date: null,
        },
      ],
    }));
    // Cliente 19 (estilo SPADER) com 2 contratos
    clients.push({
      seed_ref: "ARV-019",
      name: "Cliente 19",
      trade_name: null,
      document: "99.000.000/0001-00",
      email: null,
      phone: null,
      contracts: [
        { seed_ref: "ARV-019-C1", mrr_cents: 510000, start_date: "2024-01-01", end_date: null },
        { seed_ref: "ARV-019-C2", mrr_cents: 500000, start_date: "2024-01-01", end_date: null },
      ],
    });
    const total = 18 * 300000 + 510000 + 500000;
    expect(total).toBe(6_410_000);

    const r = migrationFileSchema.safeParse({
      snapshot_date: "2026-05-25",
      expected_total_cents: total,
      clients,
    });
    expect(r.success).toBe(true);
  });
});
