import { describe, it, expect } from "vitest";
import { z } from "zod";
import { centsSchema, isoDateSchema, parseOrThrow, uuidSchema } from "../zod-helpers";

describe("uuidSchema", () => {
  it("aceita uuid v4", () => {
    expect(uuidSchema.parse("550e8400-e29b-41d4-a716-446655440000")).toBeTypeOf("string");
  });

  it("rejeita string nao uuid", () => {
    expect(uuidSchema.safeParse("nao-uuid").success).toBe(false);
  });
});

describe("isoDateSchema", () => {
  it("aceita YYYY-MM-DD", () => {
    expect(isoDateSchema.parse("2026-05-24")).toBe("2026-05-24");
  });

  it("rejeita formato errado", () => {
    expect(isoDateSchema.safeParse("24/05/2026").success).toBe(false);
    expect(isoDateSchema.safeParse("2026-5-24").success).toBe(false);
  });
});

describe("centsSchema", () => {
  it("aceita bigint", () => {
    expect(centsSchema.parse(123n)).toBe(123n);
  });

  it("aceita inteiro", () => {
    expect(centsSchema.parse(123)).toBe(123n);
  });

  it("aceita string de digitos", () => {
    expect(centsSchema.parse("64100000")).toBe(64100000n);
    expect(centsSchema.parse("-100")).toBe(-100n);
  });

  it("rejeita float", () => {
    expect(centsSchema.safeParse(100.5).success).toBe(false);
  });

  it("rejeita string com formato invalido", () => {
    expect(centsSchema.safeParse("R$ 100").success).toBe(false);
    expect(centsSchema.safeParse("100.50").success).toBe(false);
  });
});

describe("parseOrThrow", () => {
  it("retorna dado parseado em sucesso", () => {
    expect(parseOrThrow(z.string(), "ok")).toBe("ok");
  });

  it("joga ValidationError em falha", () => {
    expect(() => parseOrThrow(z.string(), 123)).toThrow();
  });
});
