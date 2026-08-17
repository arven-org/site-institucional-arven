import { describe, it, expect } from "vitest";
import { centsEqual, formatBRL, reaisToCents, sumCents, toCents } from "../cents";

describe("toCents", () => {
  it("passa bigint sem alteracao", () => {
    expect(toCents(12345n)).toBe(12345n);
  });

  it("arredonda numero pra inteiro", () => {
    expect(toCents(100.4)).toBe(100n);
    expect(toCents(100.6)).toBe(101n);
  });

  it("parseia string de digitos", () => {
    expect(toCents("12345")).toBe(12345n);
    expect(toCents("-12345")).toBe(-12345n);
  });

  it("rejeita NaN e Infinity", () => {
    expect(() => toCents(Number.NaN)).toThrow(RangeError);
    expect(() => toCents(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it("rejeita string vazia", () => {
    expect(() => toCents("")).toThrow(RangeError);
    expect(() => toCents("-")).toThrow(RangeError);
  });
});

describe("reaisToCents", () => {
  it("aceita formato brasileiro 1.234,56", () => {
    expect(reaisToCents("1.234,56")).toBe(123456n);
  });

  it("aceita formato ingles 1234.56", () => {
    expect(reaisToCents("1234.56")).toBe(123456n);
  });

  it("aceita numero", () => {
    expect(reaisToCents(641)).toBe(64100n);
    expect(reaisToCents(641.0)).toBe(64100n);
  });

  it("preserva sinal negativo", () => {
    expect(reaisToCents("-100,50")).toBe(-10050n);
  });

  it("rejeita entrada invalida", () => {
    expect(() => reaisToCents("abc")).toThrow();
    expect(() => reaisToCents("")).toThrow();
  });

  it("nao perde precisao em valores comuns de MRR", () => {
    expect(reaisToCents("64100,00")).toBe(6410000n);
  });
});

describe("formatBRL", () => {
  it("formata zero", () => {
    expect(formatBRL(0n)).toMatch(/0,00/);
  });

  it("formata milhares e centavos", () => {
    expect(formatBRL(6410000n)).toMatch(/64\.100,00/);
  });

  it("formata negativos", () => {
    const out = formatBRL(-10050n);
    expect(out.startsWith("-")).toBe(true);
  });
});

describe("sumCents", () => {
  it("soma iteravel de centavos", () => {
    expect(sumCents([100n, 200n, 300n])).toBe(600n);
  });

  it("soma vazio = zero", () => {
    expect(sumCents([])).toBe(0n);
  });

  it("soma fixture com 21 entradas igual ao MRR atual (R$ 64.100)", () => {
    // Valores ficticios, sao validados de verdade na fatia 4 com o seed real.
    // A intencao aqui e provar que `sumCents` aguenta o tamanho e formato.
    const contracts: bigint[] = [...Array.from({ length: 20 }, () => 300000n), 410000n];
    expect(contracts.length).toBe(21);
    expect(sumCents(contracts)).toBe(6410000n);
  });
});

describe("centsEqual", () => {
  it("compara bigints", () => {
    expect(centsEqual(100n, 100n)).toBe(true);
    expect(centsEqual(100n, 101n)).toBe(false);
  });
});
