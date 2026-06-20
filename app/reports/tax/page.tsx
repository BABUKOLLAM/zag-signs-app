"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { LoadingState, ErrorState } from "@/components/States";
import { FileText, RefreshCw } from "lucide-react";
import DriveButton from "@/components/DriveButton";

interface TaxSummaryRow {
  taxRate: number;
  count: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

interface TaxQuotation {
  id: string;
  quotationNo: string;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  customer: { company: string; name: string } | null;
}

interface TaxReport {
  summary: TaxSummaryRow[];
  totals: { count: number; subtotal: number; taxAmount: number; total: number };
  quotations: TaxQuotation[];
}

const RATE_BADGE: Record<number, string> = {
  0:  "bg-gray-100 text-gray-600",
  5:  "bg-blue-100 text-blue-700",
  12: "bg-amber-100 text-amber-700",
  18: "bg-red-100 text-red-700",
};

export default function TaxReportPage() {
  const [from, setFrom] = useState("");
  const [to,   setTo]   = useState("");
  const [activeRate, setActiveRate] = useState<number | null>(null);

  const { data, loading, error, refetch } = useApi<TaxReport>("/reports/tax", {
    from: from || undefined,
    to:   to   || undefined,
  });

  const report    = data;
  const rows      = report?.quotations ?? [];
  const filtered  = activeRate !== null
    ? rows.filter((q) => (q.taxRate ?? 0) === activeRate)
    : rows;

  const exportRows = filtered.map((q) => ({
    "Quote No":      q.quotationNo,
    "Customer":      q.customer?.company || q.customer?.name || "—",
    "Date":          q.createdAt,
    "GST Rate":      `${q.taxRate ?? 0}%`,
    "Subtotal (₹)":  q.subtotal,
    "GST (₹)":       q.tax,
    "Total (₹)":     q.total,
  }));

  return (
    <div>
      <TopBar title="GST Tax Report" />
      <div className="p-4 md:p-6 space-y-5">

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-end justify-between">
          <div className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
            </div>
            <button onClick={refetch}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <DriveButton filename={`GST_Report_${from || "all"}_${to || "all"}`} rows={exportRows} />
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refetch} /> : !report ? null : (
          <>
            {/* Summary cards by rate */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([0, 5, 12, 18] as const).map((rate) => {
                const row = report.summary.find((s) => s.taxRate === rate);
                const isActive = activeRate === rate;
                return (
                  <button key={rate} onClick={() => setActiveRate(isActive ? null : rate)}
                    className={`rounded-xl border shadow-sm p-4 text-left transition-all ${
                      isActive ? "border-indigo-400 bg-indigo-50" : "border-gray-100 bg-white hover:border-indigo-200"
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RATE_BADGE[rate]}`}>
                        {rate === 0 ? "Exempt" : `GST ${rate}%`}
                      </span>
                      <span className="text-xs text-gray-400">{row?.count ?? 0} quotes</span>
                    </div>
                    {rate > 0 ? (
                      <>
                        <p className="text-xs text-gray-500">CGST @ {rate / 2}%</p>
                        <p className="text-sm font-semibold text-gray-800">{fmt((row?.taxAmount ?? 0) / 2)}</p>
                        <p className="text-xs text-gray-500 mt-1">SGST @ {rate / 2}%</p>
                        <p className="text-sm font-semibold text-gray-800">{fmt((row?.taxAmount ?? 0) / 2)}</p>
                        <p className="text-xs text-gray-400 mt-1">Total GST: {fmt(row?.taxAmount ?? 0)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500">Taxable Value</p>
                        <p className="text-sm font-semibold text-gray-800">{fmt(row?.subtotal ?? 0)}</p>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Grand totals bar */}
            <div className="bg-indigo-600 text-white rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Quotations", value: String(report.totals.count) },
                { label: "Total Taxable Value", value: fmt(report.totals.subtotal) },
                { label: "Total GST Collected", value: fmt(report.totals.taxAmount) },
                { label: "Grand Total", value: fmt(report.totals.total) },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-indigo-200">{s.label}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Detail table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText size={14} />
                  {activeRate !== null ? `GST ${activeRate}% transactions` : "All transactions"}
                  <span className="text-xs text-gray-400">({filtered.length})</span>
                </div>
                {activeRate !== null && (
                  <button onClick={() => setActiveRate(null)} className="text-xs text-indigo-600 hover:underline">
                    Clear filter
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs text-gray-500 font-medium">
                      <th className="text-left px-4 py-3">Quote No</th>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
                      <th className="text-center px-4 py-3">GST Rate</th>
                      <th className="text-right px-4 py-3">Taxable Value</th>
                      <th className="text-right px-4 py-3">CGST</th>
                      <th className="text-right px-4 py-3">SGST</th>
                      <th className="text-right px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={8} className="text-center text-gray-400 py-10 text-sm">No data for selected period / filter.</td></tr>
                    ) : filtered.map((q) => {
                      const rate = q.taxRate ?? 0;
                      const half = q.tax / 2;
                      return (
                        <tr key={q.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-indigo-600 font-medium">{q.quotationNo}</td>
                          <td className="px-4 py-3 text-gray-800">{q.customer?.company || q.customer?.name || "—"}</td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{q.createdAt}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RATE_BADGE[rate] ?? "bg-gray-100 text-gray-600"}`}>
                              {rate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{fmt(q.subtotal)}</td>
                          <td className="px-4 py-3 text-right">{rate > 0 ? fmt(half) : "—"}</td>
                          <td className="px-4 py-3 text-right">{rate > 0 ? fmt(half) : "—"}</td>
                          <td className="px-4 py-3 text-right font-semibold">{fmt(q.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {filtered.length > 0 && (
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold text-sm">
                        <td colSpan={4} className="px-4 py-3 text-right text-gray-600">Subtotals</td>
                        <td className="px-4 py-3 text-right">{fmt(filtered.reduce((s, q) => s + q.subtotal, 0))}</td>
                        <td className="px-4 py-3 text-right">{fmt(filtered.reduce((s, q) => s + q.tax / 2, 0))}</td>
                        <td className="px-4 py-3 text-right">{fmt(filtered.reduce((s, q) => s + q.tax / 2, 0))}</td>
                        <td className="px-4 py-3 text-right">{fmt(filtered.reduce((s, q) => s + q.total, 0))}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
