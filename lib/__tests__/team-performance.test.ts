import { describe, it, expect } from "vitest";
import { monthCoverage, proratedTargets, collectionOwner, pct } from "../team-performance";

const T = { callsTarget: 30, visitsTarget: 10, followUpsTarget: 20, ordersTarget: 3, revenueTarget: 300000, collectionTarget: 90000 };

describe("monthCoverage", () => {
  it("whole month = 1, partial months by days", () => {
    expect(monthCoverage({ from: "2026-11-01", to: "2026-11-30" })).toEqual({ "2026-11": 1 });
    expect(monthCoverage({ from: "2026-11-01", to: "2026-11-10" })).toEqual({ "2026-11": 10 / 30 });
    const c = monthCoverage({ from: "2026-10-22", to: "2026-11-05" });
    expect(c["2026-10"]).toBeCloseTo(10 / 31);
    expect(c["2026-11"]).toBeCloseTo(5 / 30);
    expect(monthCoverage({ from: "2024-02-01", to: "2024-02-29" })).toEqual({ "2024-02": 1 });
  });
});

describe("proratedTargets", () => {
  it("one full month = that month's target (unchanged behaviour)", () => {
    expect(proratedTargets([{ month: "2026-11", ...T }], { from: "2026-11-01", to: "2026-11-30" })).toEqual(T);
  });
  it("10 of 30 days = one third of the month", () => {
    const r = proratedTargets([{ month: "2026-11", ...T }], { from: "2026-11-01", to: "2026-11-10" })!;
    expect(r.callsTarget).toBe(10);
    expect(r.revenueTarget).toBe(100000);
  });
  it("sums pro-rated parts across months", () => {
    const r = proratedTargets(
      [{ month: "2026-10", ...T, callsTarget: 31 }, { month: "2026-11", ...T, callsTarget: 30 }],
      { from: "2026-10-30", to: "2026-11-02" },
    )!;
    expect(r.callsTarget).toBe(4); // 2 days of Oct (1/day) + 2 days of Nov (1/day)
  });
  it("null when no target rows", () => {
    expect(proratedTargets([], { from: "2026-11-01", to: "2026-11-30" })).toBeNull();
  });
});

describe("collectionOwner", () => {
  it("prefers the order's quotation, then the invoice's order, then the invoice's quotation", () => {
    expect(collectionOwner({ salesOrder: { quotation: { proposedById: "a" } }, invoice: { quotation: { proposedById: "b" } } })).toBe("a");
    expect(collectionOwner({ salesOrder: null, invoice: { salesOrder: { quotation: { proposedById: "c" } }, quotation: { proposedById: "b" } } })).toBe("c");
    expect(collectionOwner({ invoice: { salesOrder: null, quotation: { proposedById: "b" } } })).toBe("b");
    expect(collectionOwner({ salesOrder: null, invoice: null })).toBeNull();
  });
});

describe("pct", () => {
  it("guards zero targets", () => {
    expect(pct(5, 10)).toBe(50);
    expect(pct(5, 0)).toBe(0);
    expect(pct(5, null)).toBe(0);
  });
});
