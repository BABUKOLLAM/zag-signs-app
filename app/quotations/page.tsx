"use client";
import { useState, useCallback } from "react";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import QuotationPrintTemplate, { type QuotationData } from "@/components/QuotationPrintTemplate";
import DriveButton from "@/components/DriveButton";
import DocumentsPanel from "@/components/DocumentsPanel";
import { Eye, Printer, RefreshCw, X } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-orange-100 text-orange-700",
};

interface QuotationItem {
  description: string; qty: number; unit: string; unitPrice: number; total: number;
}

interface Quotation {
  id: string; quotationNo: string; status: string; statusLabel: string;
  subtotal: number; tax: number; discount: number; total: number;
  validUntil: string; terms: string; notes: string; createdAt: string;
  customerId: string; customerName: string;
  items: QuotationItem[];
}

export default function QuotationsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [printData, setPrintData] = useState<QuotationData | null>(null);
  const [loadingPrint, setLoadingPrint] = useState(false);

  const { data, loading, error, refetch } = useApi<Quotation[]>("/quotations", {
    status: statusFilter || undefined,
    limit: 100,
  });

  const quotations = data ?? [];

  const handlePrint = useCallback(async (q: Quotation) => {
    setLoadingPrint(true);
    try {
      // Fetch full quotation data (includes customer object with company name)
      const full = await api.get<{ data: QuotationData }>(`/quotations/${q.id}`);
      const qData: QuotationData = { ...full.data, customerName: q.customerName };
      setPrintData(qData);
      // Small delay so React renders the print zone, then trigger print
      setTimeout(() => { window.print(); }, 300);
    } catch {
      alert("Failed to load quotation data for printing.");
    } finally {
      setLoadingPrint(false);
    }
  }, []);

  return (
    <div>
      <TopBar title="Quotations" />
      <div className="p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: quotations.length },
            { label: "Approved", value: quotations.filter((q) => q.status === "APPROVED").length },
            { label: "Pending", value: quotations.filter((q) => q.status === "SENT").length },
            { label: "Total Value", value: fmt(quotations.reduce((s, q) => s + q.total, 0)) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap items-center">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <button onClick={refetch} title="Refresh"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
            <DriveButton
              filename={`Quotations_${new Date().toISOString().slice(0,10)}`}
              rows={quotations.map((q) => ({
                "Quote No": q.quotationNo, "Customer": q.customerName,
                "Status": q.statusLabel, "Created": q.createdAt,
                "Valid Until": q.validUntil, "Total (₹)": q.total,
              }))}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : quotations.length === 0 ? (
            <EmptyState label="No quotations found" hint="Quotations will appear here once created." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Quote No</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Created</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Valid Until</th>
                    <th className="text-right px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-indigo-600 font-medium">{q.quotationNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{q.customerName || "—"}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{q.createdAt}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{q.validUntil || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmt(q.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[q.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {q.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(q)}
                            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                            <Eye size={12} /> View
                          </button>
                          <button onClick={() => handlePrint(q)} disabled={loadingPrint}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40">
                            <Printer size={12} /> {loadingPrint ? "…" : "PDF"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── VIEW MODAL ────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start p-6 border-b">
              <div>
                <h2 className="text-base font-bold text-gray-900">{selected.quotationNo}</h2>
                <p className="text-sm text-gray-500">{selected.customerName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[selected.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {selected.statusLabel}
                </span>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
              </div>
            </div>
            <div className="p-6">
              <table className="w-full mb-5 border border-gray-100 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500">
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Qty</th>
                    <th className="text-left p-3">Unit</th>
                    <th className="text-right p-3">Rate</th>
                    <th className="text-right p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item, i) => (
                    <tr key={i} className="text-sm border-t border-gray-50">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-right">{item.qty}</td>
                      <td className="p-3">{item.unit}</td>
                      <td className="p-3 text-right">{fmt(item.unitPrice)}</td>
                      <td className="p-3 text-right font-medium">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {selected.tax > 0 && (
                    <tr className="text-sm border-t border-gray-100">
                      <td colSpan={4} className="p-3 text-right text-gray-500">Tax</td>
                      <td className="p-3 text-right">{fmt(selected.tax)}</td>
                    </tr>
                  )}
                  {selected.discount > 0 && (
                    <tr className="text-sm border-t border-gray-100">
                      <td colSpan={4} className="p-3 text-right text-gray-500">Discount</td>
                      <td className="p-3 text-right text-green-600">-{fmt(selected.discount)}</td>
                    </tr>
                  )}
                  <tr className="font-bold text-sm bg-indigo-50">
                    <td colSpan={4} className="p-3 text-right text-gray-700">Grand Total</td>
                    <td className="p-3 text-right text-indigo-700 text-base">{fmt(selected.total)}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="border-t mt-4 pt-4">
                <DocumentsPanel relatedTo={selected.id} relatedType="QUOTATION" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => { setSelected(null); handlePrint(selected); }}
                  disabled={loadingPrint}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  <Printer size={14} /> {loadingPrint ? "Loading…" : "Print / PDF"}
                </button>
                <button onClick={() => setSelected(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HIDDEN PRINT ZONE (shown only during window.print()) ─────────── */}
      <div id="zag-print-zone" style={{ display: "none" }}>
        {printData && <QuotationPrintTemplate q={printData} />}
      </div>
    </div>
  );
}
