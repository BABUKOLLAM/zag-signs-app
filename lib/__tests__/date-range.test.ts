import { describe, it, expect } from "vitest";
import {
  isValidYmd, isValidMonth, addDays, diffDays, todayIst, monthToRange, fyStart, fyLabel,
  presetRange, matchPreset, parseRange, parseRangeParams, rangeToWhere, dateWhere,
  monthsInRange, formatRange, istDayOf, MAX_SPAN_DAYS,
} from "../date-range";

// 10 Nov 2026, 20:00 UTC = 11 Nov 2026, 01:30 India — a deliberate day-boundary case.
const LATE_UTC = new Date("2026-11-10T20:00:00Z");
// Tue 10 Nov 2026, 10:00 India.
const NOW = new Date("2026-11-10T04:30:00Z");

describe("isValidYmd", () => {
  it("accepts real dates in range", () => {
    expect(isValidYmd("2026-11-10")).toBe(true);
    expect(isValidYmd("2024-02-29")).toBe(true);
    expect(isValidYmd("2000-01-01")).toBe(true);
    expect(isValidYmd("2100-12-31")).toBe(true);
  });
  it("rejects malformed, impossible or out-of-range dates", () => {
    for (const bad of [
      "2026-2-01", "2026-02-1", "26-02-01", "2026/02/01", "2026-02-01T00:00", " 2026-02-01",
      "2026-02-30", "2025-02-29", "2026-13-01", "2026-00-10", "2026-01-00",
      "1999-12-31", "2101-01-01", "", "abc", "20260201",
    ]) expect(isValidYmd(bad), bad).toBe(false);
    expect(isValidYmd(undefined)).toBe(false);
    expect(isValidYmd(20260201)).toBe(false);
  });
});

describe("isValidMonth / monthToRange", () => {
  it("maps a month to its full inclusive range", () => {
    expect(monthToRange("2026-11")).toEqual({ from: "2026-11-01", to: "2026-11-30" });
    expect(monthToRange("2024-02")).toEqual({ from: "2024-02-01", to: "2024-02-29" });
    expect(monthToRange("2025-02")).toEqual({ from: "2025-02-01", to: "2025-02-28" });
    expect(monthToRange("2026-12")).toEqual({ from: "2026-12-01", to: "2026-12-31" });
  });
  it("rejects bad months", () => {
    for (const bad of ["2026-13", "2026-00", "2026-1", "1999-12", "2101-01", "2026-11-01"]) {
      expect(isValidMonth(bad), bad).toBe(false);
      expect(monthToRange(bad)).toBeNull();
    }
  });
});

describe("day arithmetic", () => {
  it("adds across month/year/leap boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(diffDays("2026-01-01", "2026-12-31")).toBe(364);
    expect(diffDays("2026-11-10", "2026-11-10")).toBe(0);
  });
});

describe("India time", () => {
  it("todayIst follows Asia/Kolkata, not UTC", () => {
    expect(todayIst(LATE_UTC)).toBe("2026-11-11");
    expect(todayIst(new Date("2026-11-10T18:29:59Z"))).toBe("2026-11-10");
    expect(todayIst(new Date("2026-11-10T18:30:00Z"))).toBe("2026-11-11");
    expect(istDayOf(new Date("2026-03-31T19:00:00Z"))).toBe("2026-04-01");
  });
});

describe("Indian financial year", () => {
  it("starts on 1 April", () => {
    expect(fyStart("2026-04-01")).toBe("2026-04-01");
    expect(fyStart("2026-03-31")).toBe("2025-04-01");
    expect(fyStart("2026-11-10")).toBe("2026-04-01");
    expect(fyStart("2027-01-15")).toBe("2026-04-01");
    expect(fyLabel("2026-11-10")).toBe("2026-27");
    expect(fyLabel("2100-01-01")).toBe("2099-00");
  });
});

describe("presets (now = Tue 10 Nov 2026 in India)", () => {
  const r = (id: Parameters<typeof presetRange>[0], now = NOW) => presetRange(id, now);
  it("computes each preset with inclusive ends", () => {
    expect(r("today")).toEqual({ from: "2026-11-10", to: "2026-11-10" });
    expect(r("yesterday")).toEqual({ from: "2026-11-09", to: "2026-11-09" });
    expect(r("this-week")).toEqual({ from: "2026-11-09", to: "2026-11-10" }); // Monday start
    expect(r("last-7")).toEqual({ from: "2026-11-04", to: "2026-11-10" });
    expect(r("mtd")).toEqual({ from: "2026-11-01", to: "2026-11-10" });
    expect(r("last-month")).toEqual({ from: "2026-10-01", to: "2026-10-31" });
    expect(r("last-30")).toEqual({ from: "2026-10-12", to: "2026-11-10" });
    expect(r("this-quarter")).toEqual({ from: "2026-10-01", to: "2026-11-10" });
    expect(r("fytd")).toEqual({ from: "2026-04-01", to: "2026-11-10" });
  });
  it("last 7 / last 30 span exactly 7 / 30 days", () => {
    const l7 = r("last-7"); const l30 = r("last-30");
    expect(diffDays(l7.from, l7.to) + 1).toBe(7);
    expect(diffDays(l30.from, l30.to) + 1).toBe(30);
  });
  it("uses the India date near midnight", () => {
    expect(r("today", LATE_UTC)).toEqual({ from: "2026-11-11", to: "2026-11-11" });
  });
  it("handles Sunday (week still starts Monday) and January", () => {
    const sunday = new Date("2026-11-15T06:00:00Z");
    expect(r("this-week", sunday)).toEqual({ from: "2026-11-09", to: "2026-11-15" });
    const jan = new Date("2027-01-05T06:00:00Z");
    expect(r("last-month", jan)).toEqual({ from: "2026-12-01", to: "2026-12-31" });
    expect(r("this-quarter", jan)).toEqual({ from: "2027-01-01", to: "2027-01-05" });
    expect(r("fytd", jan)).toEqual({ from: "2026-04-01", to: "2027-01-05" });
  });
  it("FY to date on 1 April is a single day; quarter starts in April", () => {
    const apr1 = new Date("2026-04-01T06:00:00Z");
    expect(r("fytd", apr1)).toEqual({ from: "2026-04-01", to: "2026-04-01" });
    expect(r("this-quarter", apr1)).toEqual({ from: "2026-04-01", to: "2026-04-01" });
  });
  it("matchPreset recognises a preset range", () => {
    expect(matchPreset({ from: "2026-11-01", to: "2026-11-10" }, NOW)).toBe("mtd");
    expect(matchPreset({ from: "2026-11-02", to: "2026-11-10" }, NOW)).toBeNull();
    expect(matchPreset(null, NOW)).toBeNull();
  });
});

describe("parseRange", () => {
  it("no params → no filter", () => {
    expect(parseRange({})).toEqual({ ok: true, range: null });
    expect(parseRange({ from: "", to: "  " })).toEqual({ ok: true, range: null });
  });
  it("valid from/to", () => {
    expect(parseRange({ from: "2026-11-01", to: "2026-11-10" })).toEqual({ ok: true, range: { from: "2026-11-01", to: "2026-11-10" } });
    expect(parseRange({ from: "2026-11-10", to: "2026-11-10" })).toEqual({ ok: true, range: { from: "2026-11-10", to: "2026-11-10" } });
  });
  it("rejects from > to, bad formats, out-of-range years", () => {
    expect(parseRange({ from: "2026-11-10", to: "2026-11-01" }).ok).toBe(false);
    expect(parseRange({ from: "2026-11-1", to: "2026-11-10" }).ok).toBe(false);
    expect(parseRange({ from: "1999-12-31", to: "2000-01-05" }).ok).toBe(false);
    expect(parseRange({ from: "2026-11-01", to: "2101-01-01" }).ok).toBe(false);
    expect(parseRange({ from: "2026-02-30", to: "2026-03-01" }).ok).toBe(false);
  });
  it("enforces the max span", () => {
    expect(parseRange({ from: "2025-01-01", to: addDays("2025-01-01", MAX_SPAN_DAYS - 1) }).ok).toBe(true);
    const tooLong = parseRange({ from: "2025-01-01", to: addDays("2025-01-01", MAX_SPAN_DAYS) });
    expect(tooLong.ok).toBe(false);
    expect(parseRange({ from: "2026-11-01", to: "2026-11-10" }, { maxSpanDays: 5 }).ok).toBe(false);
  });
  it("legacy month maps to that month; from/to win over month", () => {
    expect(parseRange({ month: "2026-02" })).toEqual({ ok: true, range: { from: "2026-02-01", to: "2026-02-28" } });
    expect(parseRange({ month: "2026-2" }).ok).toBe(false);
    expect(parseRange({ from: "2026-11-01", to: "2026-11-02", month: "2026-02" }))
      .toEqual({ ok: true, range: { from: "2026-11-01", to: "2026-11-02" } });
  });
  it("open-ended: from only runs to today (India); to only goes back the max span", () => {
    expect(parseRange({ from: "2026-11-01" }, { now: NOW })).toEqual({ ok: true, range: { from: "2026-11-01", to: "2026-11-10" } });
    expect(parseRange({ from: "2026-12-25" }, { now: NOW })).toEqual({ ok: true, range: { from: "2026-12-25", to: "2026-12-25" } });
    const toOnly = parseRange({ to: "2026-11-10" });
    expect(toOnly.ok && toOnly.range && diffDays(toOnly.range.from, toOnly.range.to) + 1).toBe(MAX_SPAN_DAYS);
    expect(parseRange({ to: "2000-01-10" })).toEqual({ ok: true, range: { from: "2000-01-01", to: "2000-01-10" } });
    expect(parseRange({ from: "2001-01-01" }, { now: NOW }).ok).toBe(false); // too long
  });
  it("parseRangeParams can ignore month", () => {
    const sp = new URLSearchParams("month=2026-10");
    expect(parseRangeParams(sp)).toEqual({ ok: true, range: { from: "2026-10-01", to: "2026-10-31" } });
    expect(parseRangeParams(sp, { allowMonth: false })).toEqual({ ok: true, range: null });
  });
});

describe("rangeToWhere", () => {
  const nov = { from: "2026-11-01", to: "2026-11-10" };
  it("calendar-date basis uses UTC midnights, end exclusive the day after `to`", () => {
    expect(rangeToWhere(nov, "date")).toEqual({
      gte: new Date("2026-11-01T00:00:00.000Z"),
      lt: new Date("2026-11-11T00:00:00.000Z"),
    });
  });
  it("timestamp basis uses India midnights (UTC-05:30)", () => {
    expect(rangeToWhere(nov, "timestamp")).toEqual({
      gte: new Date("2026-10-31T18:30:00.000Z"),
      lt: new Date("2026-11-10T18:30:00.000Z"),
    });
  });
  it("a single day covers exactly 24h and includes 23:59 India, excludes next 00:00", () => {
    const w = rangeToWhere({ from: "2026-11-10", to: "2026-11-10" }, "timestamp");
    const inside = new Date("2026-11-10T18:29:59.999Z"); // 23:59:59.999 IST
    const outside = new Date("2026-11-10T18:30:00.000Z"); // 00:00 IST on the 11th
    expect(inside >= w.gte && inside < w.lt).toBe(true);
    expect(outside >= w.gte && outside < w.lt).toBe(false);
    expect(w.lt.getTime() - w.gte.getTime()).toBe(86_400_000);
  });
  it("a date saved via new Date('YYYY-MM-DD') lands inside its own day", () => {
    const w = rangeToWhere({ from: "2026-11-10", to: "2026-11-10" }, "date");
    const saved = new Date("2026-11-10");
    expect(saved >= w.gte && saved < w.lt).toBe(true);
    expect(new Date("2026-11-11") < w.lt).toBe(false);
  });
  it("dateWhere returns {} without a range", () => {
    expect(dateWhere("createdAt", null, "timestamp")).toEqual({});
    expect(Object.keys(dateWhere("createdAt", nov, "timestamp"))).toEqual(["createdAt"]);
  });
});

describe("helpers", () => {
  it("monthsInRange lists every month touched", () => {
    expect(monthsInRange({ from: "2026-11-15", to: "2026-11-20" })).toEqual(["2026-11"]);
    expect(monthsInRange({ from: "2026-11-30", to: "2027-02-01" })).toEqual(["2026-11", "2026-12", "2027-01", "2027-02"]);
  });
  it("formatRange", () => {
    expect(formatRange(null)).toBe("All dates");
    expect(formatRange({ from: "2026-11-10", to: "2026-11-10" })).toBe("10 Nov 2026");
    expect(formatRange({ from: "2026-04-01", to: "2026-11-10" })).toBe("1 Apr 2026 – 10 Nov 2026");
  });
});
