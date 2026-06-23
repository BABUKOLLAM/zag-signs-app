// Server-side helpers shared by the /api/<entity>/bulk routes.
// No next-auth imports here so it stays a lightweight pure module.

export const VALID_BRANCHES = ["TVM", "KTYM", "EKM", "CLT"] as const;

export interface RowResult {
  created: number;
  skipped: { row: number; reason: string }[];
  errors:  { row: number; reason: string }[];
}

/** Trim any value to a string ("" for null/undefined). */
export function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

/** Parse a number, falling back to 0 for blanks/garbage. */
export function num(v: unknown): number {
  if (v === "" || v == null) return 0;
  const n = Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Validate & normalise a branch code; null if invalid. */
export function normBranch(v: unknown): string | null {
  const s = str(v).toUpperCase();
  return (VALID_BRANCHES as readonly string[]).includes(s) ? s : null;
}

/** Normalise an enum-ish value: UPPER, spaces/hyphens → underscore. */
export function normEnum(v: unknown): string {
  return str(v).toUpperCase().replace(/[\s-]+/g, "_");
}

/** Phone reduced to digits — used as a duplicate key. */
export function phoneKey(v: unknown): string {
  return str(v).replace(/\D/g, "");
}

/** The spreadsheet row number the client attached (__row), else position+2. */
export function rowNo(r: Record<string, unknown>, i: number): number {
  return typeof r.__row === "number" ? r.__row : i + 2;
}

/**
 * Highest trailing integer across a set of formatted IDs, e.g.
 * ["C001","C012","EMP-7"] → 12. Returns 0 when none match.
 * Used to derive the next sequence number from the MAX existing number
 * (not the row count) so deleted rows can't cause a duplicate-ID collision.
 */
export function maxTrailingInt(values: (string | null | undefined)[]): number {
  let max = 0;
  for (const v of values) {
    const m = /(\d+)\s*$/.exec(v ?? "");
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return max;
}

/** True if the session role matches any allowed label (space/underscore-insensitive). */
export function hasRole(role: string | undefined | null, allowed: string[]): boolean {
  const norm = (s: string) => s.replace(/\s+/g, "_").toUpperCase();
  const r = norm(role ?? "");
  return allowed.some((a) => norm(a) === r);
}
