import { describe, it, expect } from "vitest";
import { contractCreateSchema } from "../schemas";

const validUuid = "11111111-1111-4111-8111-111111111111";

describe("contractCreateSchema", () => {
  it("aceita payload minimo valido", () => {
    const result = contractCreateSchema.safeParse({
      client_id: validUuid,
      mrr_reais: "3.500,00",
      start_date: "2026-01-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mrr_reais).toBe(350000);
      expect(result.data.status).toBe("active");
      expect(result.data.source).toBe("manual");
      expect(result.data.end_date).toBeNull();
    }
  });

  it("rejeita mrr negativo", () => {
    const r = contractCreateSchema.safeParse({
      client_id: validUuid,
      mrr_reais: "-100,00",
      start_date: "2026-01-01",
    });
    expect(r.success).toBe(false);
  });

  it("rejeita end_date < start_date", () => {
    const r = contractCreateSchema.safeParse({
      client_id: validUuid,
      mrr_reais: "100,00",
      start_date: "2026-06-01",
      end_date: "2026-05-01",
    });
    expect(r.success).toBe(false);
  });

  it("aceita end_date vazio", () => {
    const r = contractCreateSchema.safeParse({
      client_id: validUuid,
      mrr_reais: "100,00",
      start_date: "2026-01-01",
      end_date: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.end_date).toBeNull();
  });

  it("aceita formato 1234.56 (ingles)", () => {
    const r = contractCreateSchema.safeParse({
      client_id: validUuid,
      mrr_reais: "1234.56",
      start_date: "2026-01-01",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.mrr_reais).toBe(123456);
  });

  it("renewal_of opcional, valida uuid se preenchido", () => {
    const ok = contractCreateSchema.safeParse({
      client_id: validUuid,
      mrr_reais: "100,00",
      start_date: "2026-01-01",
      renewal_of: "",
    });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.renewal_of).toBeNull();

    const bad = contractCreateSchema.safeParse({
      client_id: validUuid,
      mrr_reais: "100,00",
      start_date: "2026-01-01",
      renewal_of: "nao-uuid",
    });
    expect(bad.success).toBe(false);
  });
});
