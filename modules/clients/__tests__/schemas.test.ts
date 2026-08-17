import { describe, it, expect } from "vitest";
import { clientCreateSchema } from "../schemas";

describe("clientCreateSchema", () => {
  it("aceita nome basico", () => {
    const r = clientCreateSchema.safeParse({ name: "Arven Solutions" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.trade_name).toBeNull();
      expect(r.data.email).toBeNull();
    }
  });

  it("rejeita nome curto", () => {
    expect(clientCreateSchema.safeParse({ name: "a" }).success).toBe(false);
  });

  it("converte string vazia em null", () => {
    const r = clientCreateSchema.safeParse({
      name: "Arven",
      trade_name: "",
      document: "",
      email: "",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.trade_name).toBeNull();
      expect(r.data.document).toBeNull();
      expect(r.data.email).toBeNull();
    }
  });

  it("valida email se preenchido", () => {
    const bad = clientCreateSchema.safeParse({ name: "Arven", email: "nao-email" });
    expect(bad.success).toBe(false);
  });

  it("aceita email valido", () => {
    const r = clientCreateSchema.safeParse({ name: "Arven", email: " contato@arven.com " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("contato@arven.com");
  });
});
