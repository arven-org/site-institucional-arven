import { describe, it, expect } from "vitest";
import {
  CONTRACT_STATUSES,
  MRR_COUNTING_STATUSES,
  canTransition,
  assertTransition,
} from "../states";

describe("CONTRACT_STATUSES", () => {
  it("tem os 4 estados do spec", () => {
    expect(CONTRACT_STATUSES).toEqual(["draft", "active", "ended", "canceled"]);
  });
});

describe("canTransition", () => {
  it("draft pode virar active", () => {
    expect(canTransition("draft", "active")).toBe(true);
  });

  it("draft pode virar canceled (descarte de rascunho)", () => {
    expect(canTransition("draft", "canceled")).toBe(true);
  });

  it("active pode virar ended (vencimento)", () => {
    expect(canTransition("active", "ended")).toBe(true);
  });

  it("active pode virar canceled (churn)", () => {
    expect(canTransition("active", "canceled")).toBe(true);
  });

  it("draft NAO pode virar ended (nao vigeu)", () => {
    expect(canTransition("draft", "ended")).toBe(false);
  });

  it("ended e terminal", () => {
    expect(canTransition("ended", "active")).toBe(false);
    expect(canTransition("ended", "canceled")).toBe(false);
    expect(canTransition("ended", "draft")).toBe(false);
  });

  it("canceled e terminal", () => {
    expect(canTransition("canceled", "active")).toBe(false);
    expect(canTransition("canceled", "ended")).toBe(false);
    expect(canTransition("canceled", "draft")).toBe(false);
  });
});

describe("assertTransition", () => {
  it("nao lanca em transicao valida", () => {
    expect(() => {
      assertTransition("draft", "active");
    }).not.toThrow();
  });

  it("lanca em transicao invalida", () => {
    expect(() => {
      assertTransition("ended", "active");
    }).toThrow(/Transicao invalida/);
  });
});

describe("MRR_COUNTING_STATUSES", () => {
  it("so active conta no MRR", () => {
    expect(MRR_COUNTING_STATUSES).toEqual(["active"]);
  });
});
