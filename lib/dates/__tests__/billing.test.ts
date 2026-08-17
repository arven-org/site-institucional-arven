import { describe, it, expect } from "vitest";
import { addDays, daysBetween, isPastDue, todayInAppTZ, APP_TIMEZONE } from "../billing";

describe("APP_TIMEZONE", () => {
  it("e America/Sao_Paulo", () => {
    expect(APP_TIMEZONE).toBe("America/Sao_Paulo");
  });
});

describe("todayInAppTZ", () => {
  it("retorna YYYY-MM-DD valido", () => {
    const today = todayInAppTZ();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("usa fuso de Sao Paulo na fronteira do dia", () => {
    // 2026-01-01 02:00 UTC = 2025-12-31 23:00 em Sao Paulo
    const newYearUtc = new Date("2026-01-01T02:00:00Z");
    expect(todayInAppTZ(newYearUtc)).toBe("2025-12-31");
  });
});

describe("addDays", () => {
  it("adiciona dias positivos", () => {
    expect(addDays("2026-01-01", 30)).toBe("2026-01-31");
  });

  it("atravessa virada de mes", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("atravessa virada de ano", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("aceita dias negativos", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("respeita ano bissexto (2028)", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("rejeita data invalida", () => {
    expect(() => addDays("bug", 1)).toThrow(RangeError);
  });
});

describe("daysBetween", () => {
  it("calcula diferenca positiva", () => {
    expect(daysBetween("2026-01-01", "2026-01-31")).toBe(30);
  });

  it("calcula diferenca negativa quando b < a", () => {
    expect(daysBetween("2026-01-31", "2026-01-01")).toBe(-30);
  });

  it("retorna zero pra mesma data", () => {
    expect(daysBetween("2026-05-24", "2026-05-24")).toBe(0);
  });
});

describe("isPastDue", () => {
  it("passado e past due", () => {
    expect(isPastDue("2020-01-01", "2026-05-24")).toBe(true);
  });

  it("hoje nao e past due", () => {
    expect(isPastDue("2026-05-24", "2026-05-24")).toBe(false);
  });

  it("futuro nao e past due", () => {
    expect(isPastDue("2026-12-31", "2026-05-24")).toBe(false);
  });
});
