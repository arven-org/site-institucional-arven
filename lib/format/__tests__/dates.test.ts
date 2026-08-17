import { describe, it, expect } from "vitest";
import { formatDate, formatDateLong, formatDateTime, formatRelative } from "../dates";

describe("formatDate", () => {
  it("formata YYYY-MM-DD pra dd/mm/yyyy", () => {
    expect(formatDate("2026-05-24")).toBe("24/05/2026");
  });

  it("retorna string vazia pra null/undefined", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });

  it("nao desliza dia entre fusos", () => {
    // Mesmo problema da fatia 1: data sem hora vira meianoite UTC,
    // que em -03:00 e 21h do dia anterior. Helper forca 12:00Z.
    expect(formatDate("2026-01-01")).toBe("01/01/2026");
  });
});

describe("formatDateLong", () => {
  it("usa mes por extenso", () => {
    const out = formatDateLong("2026-05-24");
    expect(out).toMatch(/maio/i);
    expect(out).toContain("2026");
  });
});

describe("formatDateTime", () => {
  it("inclui hora", () => {
    const out = formatDateTime("2026-05-24T10:00:00Z");
    expect(out).toMatch(/\d{2}:\d{2}/);
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-05-24T12:00:00Z");

  it("'agora' ou similar pra muito recente", () => {
    expect(formatRelative(new Date("2026-05-24T11:59:30Z"), now)).toMatch(/segundos|agora/i);
  });

  it("horas atras", () => {
    expect(formatRelative(new Date("2026-05-24T09:00:00Z"), now)).toMatch(/h(ora)?/i);
  });

  it("futuro: em N dias", () => {
    expect(formatRelative(new Date("2026-05-29T12:00:00Z"), now)).toMatch(/dias|dia/i);
  });
});
