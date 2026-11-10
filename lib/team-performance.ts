// Pure helpers for /api/sales/team/performance (unit-tested, no DB).
import { diffDays, monthToRange, monthsInRange, type DateRange } from "./date-range";

export type TargetKey =
  | "callsTarget" | "visitsTarget" | "followUpsTarget"
  | "ordersTarget" | "revenueTarget" | "collectionTarget";

export const TARGET_KEYS: TargetKey[] = [
  "callsTarget", "visitsTarget", "followUpsTarget", "ordersTarget", "revenueTarget", "collectionTarget",
];

export type MonthlyTarget = { month: string } & Partial<Record<TargetKey, number | null>>;

/**
 * Share of each touched month that the range covers, e.g. 1–10 Nov →
 * { "2026-11": 10/30 }. A whole month is 1, so a one-month range gives
 * exactly that month's target (unchanged from before).
 */
export function monthCoverage(range: DateRange): Record<string, number> {
  const out: Record<string, number> = {};
  for (const ym of monthsInRange(range)) {
    const m = monthToRange(ym)!;
    const from = range.from > m.from ? range.from : m.from;
    const to = range.to < m.to ? range.to : m.to;
    out[ym] = (diffDays(from, to) + 1) / (diffDays(m.from, m.to) + 1);
  }
  return out;
}

/** Monthly targets pro-rated by the days of each month inside the range, then summed. */
export function proratedTargets(rows: MonthlyTarget[], range: DateRange): Record<TargetKey, number> | null {
  if (!rows.length) return null;
  const cover = monthCoverage(range);
  const sum = Object.fromEntries(TARGET_KEYS.map((k) => [k, 0])) as Record<TargetKey, number>;
  for (const r of rows) {
    const f = cover[r.month] ?? 0;
    for (const k of TARGET_KEYS) sum[k] += (Number(r[k]) || 0) * f;
  }
  for (const k of TARGET_KEYS) sum[k] = Math.round(sum[k] * 100) / 100;
  return sum;
}

type Q = { proposedById: string | null } | null | undefined;
type SO = { quotation?: Q } | null | undefined;

/** Whose collection is it? The quotation's proposer, via the order or the invoice. */
export function collectionOwner(c: {
  salesOrder?: SO;
  invoice?: { salesOrder?: SO; quotation?: Q } | null;
}): string | null {
  return (
    c.salesOrder?.quotation?.proposedById ??
    c.invoice?.salesOrder?.quotation?.proposedById ??
    c.invoice?.quotation?.proposedById ??
    null
  );
}

export function pct(actual: number, target: number | undefined | null): number {
  return target ? Math.round((actual / target) * 100) : 0;
}
