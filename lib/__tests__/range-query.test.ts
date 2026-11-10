import { describe, it, expect } from "vitest";
import { rangeFromQuery } from "../api-helpers";

describe("rangeFromQuery (API validation)", () => {
  it("returns the range for valid input", () => {
    const r = rangeFromQuery(new URLSearchParams("from=2026-11-01&to=2026-11-10"));
    expect(r.error).toBeNull();
    expect(r.range).toEqual({ from: "2026-11-01", to: "2026-11-10" });
  });
  it("returns null range when no dates are given", () => {
    expect(rangeFromQuery(new URLSearchParams("status=NEW"))).toEqual({ range: null, error: null });
  });
  it.each([
    "from=2026-11-10&to=2026-11-01",
    "from=2026-11-1&to=2026-11-10",
    "from=1999-01-01&to=1999-01-02",
    "from=2020-01-01&to=2026-01-01",
    "month=2026-13",
  ])("answers 400 for %s", async (q) => {
    const r = rangeFromQuery(new URLSearchParams(q));
    expect(r.range).toBeNull();
    expect(r.error?.status).toBe(400);
    expect((await r.error!.json()).error).toMatch(/from|to|month|range/i);
  });
  it("ignores month when the route opts out", () => {
    expect(rangeFromQuery(new URLSearchParams("month=2026-13"), { allowMonth: false })).toEqual({ range: null, error: null });
  });
});
