"use client";
// Shared From–To date filter for lists and reports.
//
// State lives in the URL (?from=YYYY-MM-DD&to=YYYY-MM-DD) so a filtered view
// can be bookmarked or shared, and the legacy ?month=YYYY-MM links still open
// on that month. Pages using useDateRangeQuery must render inside <Suspense>
// (Next.js requires it for useSearchParams on prerendered routes).
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, X } from "lucide-react";
import {
  PRESETS, presetRange, matchPreset, parseRange, isValidYmd, diffDays,
  MAX_SPAN_DAYS, type DateRange, type PresetId,
} from "@/lib/date-range";

interface QueryOptions {
  /** Range used when the URL carries none. Omit (or return null) for "All dates". */
  defaultRange?: () => DateRange | null;
}

/** Reads/writes the from–to range in the page URL. */
export function useDateRangeQuery(opts: QueryOptions = {}) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const from = sp.get("from");
  const to = sp.get("to");
  const month = sp.get("month");
  const { defaultRange } = opts;

  const parsed = useMemo(() => parseRange({ from, to, month }), [from, to, month]);
  const range: DateRange | null = useMemo(() => {
    if (parsed.ok && parsed.range) return parsed.range;
    return defaultRange ? defaultRange() : null;
    // defaultRange is expected to be stable in meaning; re-evaluate only when the URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed]);
  const urlError = parsed.ok ? null : parsed.error;

  const setRange = useCallback((next: DateRange | null) => {
    const q = new URLSearchParams(sp.toString());
    q.delete("month");
    if (next) { q.set("from", next.from); q.set("to", next.to); }
    else { q.delete("from"); q.delete("to"); }
    const s = q.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }, [sp, router, pathname]);

  /** Query params to pass to the API (undefined values are dropped by useApi). */
  const params = { from: range?.from, to: range?.to };

  return { range, setRange, params, urlError };
}

interface Props {
  value: DateRange | null;
  onChange: (r: DateRange | null) => void;
  /** What the dates mean on this page, e.g. "Visit date", "Created". */
  basisLabel: string;
  /** Show the "All dates" option (clears the filter). Default true. */
  allowAll?: boolean;
  /** Error from the URL (e.g. a hand-edited link) — shown once, filter falls back. */
  urlError?: string | null;
  className?: string;
}

const inputCls =
  "border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-full sm:w-[9.5rem] focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function DateRangeFilter(props: Props) {
  // Remount the editor whenever the applied range changes so its draft resets.
  const k = props.value ? `${props.value.from}|${props.value.to}` : "all";
  return <Editor key={k} {...props} />;
}

function Editor({ value, onChange, basisLabel, allowAll = true, urlError, className = "" }: Props) {
  const [from, setFrom] = useState(value?.from ?? "");
  const [to, setTo] = useState(value?.to ?? "");
  const preset = matchPreset(value);

  let error: string | null = null;
  if (from || to) {
    if (!isValidYmd(from) || !isValidYmd(to)) error = "Enter both dates (2000–2100)";
    else if (from > to) error = "From must be on or before To";
    else if (diffDays(from, to) + 1 > MAX_SPAN_DAYS) error = `Max ${MAX_SPAN_DAYS} days`;
  }

  const commit = (f: string, t: string) => {
    if (isValidYmd(f) && isValidYmd(t) && f <= t && diffDays(f, t) + 1 <= MAX_SPAN_DAYS) {
      if (f !== value?.from || t !== value?.to) onChange({ from: f, to: t });
    }
  };

  const onPreset = (id: string) => {
    if (id === "all") { onChange(null); return; }
    if (id === "custom") return;
    onChange(presetRange(id as PresetId));
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 w-full sm:w-auto ${className}`} role="group" aria-label={`${basisLabel} date range`}>
      <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
        <CalendarRange size={14} aria-hidden /> {basisLabel}
      </span>
      <select
        aria-label="Date range preset"
        value={value ? (preset ?? "custom") : "all"}
        onChange={(e) => onPreset(e.target.value)}
        className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none w-full sm:w-auto"
      >
        {allowAll && <option value="all">All dates</option>}
        {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        <option value="custom" disabled={!!preset || !value}>Custom range</option>
      </select>
      <div className="flex items-center gap-1 w-full sm:w-auto">
        <input
          type="date" aria-label="From date" value={from} min="2000-01-01" max="2100-12-31"
          onChange={(e) => { setFrom(e.target.value); commit(e.target.value, to || e.target.value); }}
          className={inputCls}
        />
        <span className="text-gray-400 text-xs">to</span>
        <input
          type="date" aria-label="To date" value={to} min={from || "2000-01-01"} max="2100-12-31"
          onChange={(e) => { setTo(e.target.value); commit(from || e.target.value, e.target.value); }}
          className={inputCls}
        />
        {allowAll && value && (
          <button type="button" onClick={() => onChange(null)} title="Clear dates" aria-label="Clear dates"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <X size={14} />
          </button>
        )}
      </div>
      {(error || urlError) && (
        <span className="text-xs text-red-600 w-full sm:w-auto" role="alert">
          {error ?? `Link dates ignored: ${urlError}`}
        </span>
      )}
    </div>
  );
}
