import { describe, it, expect } from "vitest";
import { str, num, normBranch, normEnum, phoneKey, rowNo, maxTrailingInt, hasRole } from "@/lib/bulk-helpers";

describe("str", () => {
  it("trims and stringifies, empty string for null/undefined", () => {
    expect(str("  Kumar  ")).toBe("Kumar");
    expect(str(null)).toBe("");
    expect(str(undefined)).toBe("");
    expect(str(42)).toBe("42");
  });
});

describe("num", () => {
  it("parses numbers and strips thousands separators", () => {
    expect(num("1,200")).toBe(1200);
    expect(num("50000")).toBe(50000);
  });
  it("falls back to 0 for blanks and garbage", () => {
    expect(num("")).toBe(0);
    expect(num(null)).toBe(0);
    expect(num("abc")).toBe(0);
  });
});

describe("normBranch", () => {
  it("accepts and uppercases valid branch codes, including HO", () => {
    expect(normBranch("tvm")).toBe("TVM");
    expect(normBranch("HO")).toBe("HO");
    expect(normBranch("clt")).toBe("CLT");
  });
  it("rejects invalid branch codes", () => {
    expect(normBranch("Mumbai")).toBeNull();
    expect(normBranch("")).toBeNull();
  });
});

describe("normEnum", () => {
  it("uppercases and converts spaces/hyphens to underscores", () => {
    expect(normEnum("cold call")).toBe("COLD_CALL");
    expect(normEnum("walk-in")).toBe("WALK_IN");
  });
});

describe("phoneKey", () => {
  it("strips all non-digit characters for dedup comparison", () => {
    expect(phoneKey("+91 98765-43210")).toBe("919876543210");
    expect(phoneKey("(987) 654-3210")).toBe("9876543210");
  });
});

describe("rowNo", () => {
  it("uses __row when present, else position + 2 (header + 1-index)", () => {
    expect(rowNo({ __row: 7 }, 99)).toBe(7);
    expect(rowNo({}, 0)).toBe(2);
    expect(rowNo({}, 5)).toBe(7);
  });
});

describe("maxTrailingInt", () => {
  it("finds the highest trailing integer across formatted IDs", () => {
    expect(maxTrailingInt(["C001", "C012", "C007"])).toBe(12);
    expect(maxTrailingInt(["EMP-7", "EMP-23", "EMP-3"])).toBe(23);
  });
  it("returns 0 when nothing matches, so numbering doesn't collide on an empty table", () => {
    expect(maxTrailingInt([])).toBe(0);
    expect(maxTrailingInt([null, undefined, "no-digits-here"])).toBe(0);
  });
});

describe("hasRole", () => {
  it("matches space/underscore-insensitively", () => {
    expect(hasRole("IT Admin", ["IT_ADMIN", "MD"])).toBe(true);
    expect(hasRole("IT_ADMIN", ["IT Admin"])).toBe(true);
  });
  it("rejects roles not in the allowed list", () => {
    expect(hasRole("Sales Executive", ["MD", "IT Admin"])).toBe(false);
  });
});
