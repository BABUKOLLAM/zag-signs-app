// Shared From–To date-range maths. Pure and isomorphic: used by the
// <DateRangeFilter> component in the browser AND by API routes on the server
// (which run in UTC on Vercel), so nothing here may depend on the host's
// local timezone.
//
// Conventions:
//  - A "day" string is strict YYYY-MM-DD (no time, no offset).
//  - Ranges are inclusive at both ends: { from: "2026-11-01", to: "2026-11-10" }
//    means 1 Nov 00:00 through 10 Nov 23:59:59.999.
//  - "Today", "this week", etc. are evaluated in India time (Asia/Kolkata,
//    UTC+05:30, no DST).
//  - Financial year is the Indian FY: 1 April – 31 March.
//  - Weeks start on Monday.

export type Ymd = string;

export interface DateRange {
  from: Ymd;
  to: Ymd;
}

/** How a column stores its date, which decides where the day boundaries fall.
 *  - "date":      a calendar date saved as UTC midnight (what `new Date("YYYY-MM-DD")`
 *                 produces, and what the lists display via toISOString().slice(0,10)).
 *  - "timestamp": a real instant (createdAt, startTime …); days are India days. */
export type DateBasis = "date" | "timestamp";

export const IST_OFFSET_MINUTES = 330;
export const MIN_YEAR = 2000;
export const MAX_YEAR = 2100;
/** Longest span a list filter may request (inclusive days). Two years covers
 *  "last FY vs this FY" comparisons without letting one request scan forever. */
export const MAX_SPAN_DAYS = 731;

const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;
const DAY_MS = 86_400_000;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function fromParts(y: number, m: number, d: number): Ymd {
  // m is 1-based. Date.UTC normalises overflow (e.g. day 0 = last day of previous month).
  const t = new Date(Date.UTC(y, m - 1, d));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

function parts(ymd: Ymd): [number, number, number] {
  const m = YMD_RE.exec(ymd);
  if (!m) throw new Error(`Invalid date: ${ymd}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Strict YYYY-MM-DD, a real calendar day, year 2000–2100. */
export function isValidYmd(s: unknown): s is Ymd {
  if (typeof s !== "string") return false;
  const m = YMD_RE.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < MIN_YEAR || y > MAX_YEAR || mo < 1 || mo > 12 || d < 1) return false;
  return fromParts(y, mo, d) === s; // rejects 2026-02-30, 2026-13-01 …
}

/** Strict YYYY-MM within 2000–2100. */
export function isValidMonth(s: unknown): s is string {
  if (typeof s !== "string") return false;
  const m = MONTH_RE.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  return y >= MIN_YEAR && y <= MAX_YEAR && mo >= 1 && mo <= 12;
}

export function addDays(ymd: Ymd, n: number): Ymd {
  const [y, m, d] = parts(ymd);
  return fromParts(y, m, d + n);
}

/** Whole days from a to b (b - a). */
export function diffDays(a: Ymd, b: Ymd): number {
  const [ay, am, ad] = parts(a);
  const [by, bm, bd] = parts(b);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY_MS);
}

/** Today's date in India. */
export function todayIst(now: Date = new Date()): Ymd {
  const t = new Date(now.getTime() + IST_OFFSET_MINUTES * 60_000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** The calendar day an instant falls on, in India. */
export function istDayOf(instant: Date): Ymd {
  return todayIst(instant);
}

export function monthToRange(month: string): DateRange | null {
  if (!isValidMonth(month)) return null;
  const [y, m] = month.split("-").map(Number);
  return { from: fromParts(y, m, 1), to: fromParts(y, m + 1, 0) };
}

/** First day of the Indian FY containing `ymd` (1 April). */
export function fyStart(ymd: Ymd): Ymd {
  const [y, m] = parts(ymd);
  return fromParts(m >= 4 ? y : y - 1, 4, 1);
}

/** FY label like "2026-27" for the FY containing `ymd`. */
export function fyLabel(ymd: Ymd): string {
  const start = Number(fyStart(ymd).slice(0, 4));
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

export const PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this-week", label: "This week" },
  { id: "last-7", label: "Last 7 days" },
  { id: "mtd", label: "This month to date" },
  { id: "last-month", label: "Last month" },
  { id: "last-30", label: "Last 30 days" },
  { id: "this-quarter", label: "This quarter" },
  { id: "fytd", label: "This FY to date" },
] as const;

export type PresetId = (typeof PRESETS)[number]["id"];

/** Range for a preset, evaluated against India's "today". Every preset that
 *  includes the current period ends today (to-date), never in the future. */
export function presetRange(id: PresetId, now: Date = new Date()): DateRange {
  const today = todayIst(now);
  const [y, m, d] = parts(today);
  switch (id) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const yd = addDays(today, -1);
      return { from: yd, to: yd };
    }
    case "this-week": {
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
      const sinceMonday = (dow + 6) % 7;
      return { from: addDays(today, -sinceMonday), to: today };
    }
    case "last-7":
      return { from: addDays(today, -6), to: today };
    case "mtd":
      return { from: fromParts(y, m, 1), to: today };
    case "last-month":
      return { from: fromParts(y, m - 1, 1), to: fromParts(y, m, 0) };
    case "last-30":
      return { from: addDays(today, -29), to: today };
    case "this-quarter": {
      // Calendar quarters; they coincide with Indian FY quarters (Q1 = Apr–Jun).
      const qStartMonth = Math.floor((m - 1) / 3) * 3 + 1;
      return { from: fromParts(y, qStartMonth, 1), to: today };
    }
    case "fytd":
      return { from: fyStart(today), to: today };
  }
}

/** Which preset (if any) a range corresponds to today — for highlighting. */
export function matchPreset(range: DateRange | null, now: Date = new Date()): PresetId | null {
  if (!range) return null;
  for (const p of PRESETS) {
    const r = presetRange(p.id, now);
    if (r.from === range.from && r.to === range.to) return p.id;
  }
  return null;
}

export type ParseResult =
  | { ok: true; range: DateRange | null }
  | { ok: false; error: string };

export interface ParseOptions {
  maxSpanDays?: number;
  /** Clock override for tests (used to fill a missing `to`). */
  now?: Date;
}

/**
 * Validates from/to (and the legacy `month=YYYY-MM`) query parameters.
 *  - neither from nor to (and no month) → { ok: true, range: null } (no filter)
 *  - only from → up to today (India), or just that day if it is in the future
 *  - only to   → the longest allowed span ending on that day (never before 2000)
 *  - month alone → that whole month (old links keep working)
 *  - from/to take precedence over month when both are present
 */
export function parseRange(
  input: { from?: string | null; to?: string | null; month?: string | null },
  opts: ParseOptions = {},
): ParseResult {
  const maxSpan = opts.maxSpanDays ?? MAX_SPAN_DAYS;
  const rawFrom = input.from?.trim() || "";
  const rawTo = input.to?.trim() || "";
  const rawMonth = input.month?.trim() || "";

  if (!rawFrom && !rawTo) {
    if (!rawMonth) return { ok: true, range: null };
    const r = monthToRange(rawMonth);
    if (!r) return { ok: false, error: "month must be YYYY-MM between 2000 and 2100" };
    return { ok: true, range: r };
  }

  if (rawFrom && !isValidYmd(rawFrom)) return { ok: false, error: "from must be a valid YYYY-MM-DD date between 2000 and 2100" };
  if (rawTo && !isValidYmd(rawTo)) return { ok: false, error: "to must be a valid YYYY-MM-DD date between 2000 and 2100" };
  let from = rawFrom;
  let to = rawTo;
  if (!to) {
    const today = todayIst(opts.now);
    to = from > today ? from : today;
  }
  if (!from) {
    const earliest = `${MIN_YEAR}-01-01`;
    const start = diffDays(earliest, to) + 1 > maxSpan ? addDays(to, -(maxSpan - 1)) : earliest;
    from = start;
  }
  if (from > to) return { ok: false, error: "from must be on or before to" };
  const span = diffDays(from, to) + 1;
  if (span > maxSpan) return { ok: false, error: `Date range is too long (max ${maxSpan} days)` };
  return { ok: true, range: { from, to } };
}

/** Same as parseRange, reading straight from URLSearchParams. */
export function parseRangeParams(sp: URLSearchParams, opts: ParseOptions & { allowMonth?: boolean } = {}): ParseResult {
  return parseRange(
    {
      from: sp.get("from"),
      to: sp.get("to"),
      month: opts.allowMonth === false ? null : sp.get("month"),
    },
    opts,
  );
}

/** UTC instant at which an India day starts. */
export function istDayStartUtc(ymd: Ymd): Date {
  const [y, m, d] = parts(ymd);
  return new Date(Date.UTC(y, m - 1, d) - IST_OFFSET_MINUTES * 60_000);
}

/**
 * Half-open Prisma filter { gte, lt } covering the inclusive range.
 * Using `lt` the day after `to` avoids the 23:59:59.999 off-by-one.
 */
export function rangeToWhere(range: DateRange, basis: DateBasis): { gte: Date; lt: Date } {
  const end = addDays(range.to, 1);
  if (basis === "timestamp") {
    return { gte: istDayStartUtc(range.from), lt: istDayStartUtc(end) };
  }
  const [fy, fm, fd] = parts(range.from);
  const [ey, em, ed] = parts(end);
  return { gte: new Date(Date.UTC(fy, fm - 1, fd)), lt: new Date(Date.UTC(ey, em - 1, ed)) };
}

/** Prisma fragment `{ [field]: { gte, lt } }`, or `{}` when there is no range. */
export function dateWhere<F extends string>(
  field: F,
  range: DateRange | null,
  basis: DateBasis,
): { [K in F]?: { gte: Date; lt: Date } } {
  if (!range) return {};
  return { [field]: rangeToWhere(range, basis) } as { [K in F]?: { gte: Date; lt: Date } };
}

/** Human label, e.g. "1 Nov 2026 – 10 Nov 2026" or "10 Nov 2026". */
export function formatRange(range: DateRange | null): string {
  if (!range) return "All dates";
  const f = (s: Ymd) => {
    const [y, m, d] = parts(s);
    const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
    return `${d} ${mon} ${y}`;
  };
  return range.from === range.to ? f(range.from) : `${f(range.from)} – ${f(range.to)}`;
}

/** List of YYYY-MM months touched by a range (inclusive) — for month-keyed data. */
export function monthsInRange(range: DateRange): string[] {
  const out: string[] = [];
  let [y, m] = parts(range.from);
  const [ty, tm] = parts(range.to);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${pad(m)}`);
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}
