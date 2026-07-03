"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { fmt } from "@/lib/utils";
import { Plus, Trash2, Save, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toaster";

type OrderOption = { id: string; orderNo: string; customer: { name: string } };
type Line = { id?: string; category: string; description: string; quantity: number; unit: string; unitCost: number; totalCost: number };
type JobCost = {
  id: string; salesOrderId: string; revenueQuoted: number; revenueActual: number; notes: string;
  salesOrder: { orderNo: string; customer: { name: string } };
  lines: Line[];
};

const CATEGORIES = ["Material", "Labour", "Printing", "Vinyl", "Fabrication", "Electrical", "Transport", "Subcontract", "Overhead", "Other"];
const EMPTY_LINE: Line = { category: "Material", description: "", quantity: 1, unit: "Nos", unitCost: 0, totalCost: 0 };

export default function JobCostingPage() {
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [revenueQuoted, setRevenueQuoted] = useState(0);
  const [revenueActual, setRevenueActual] = useState(0);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([{ ...EMPTY_LINE }]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const { data: orders } = useApi<OrderOption[]>("/sales-orders?limit=200");
  const existingUrl = selectedOrderId ? `/job-costing?salesOrderId=${selectedOrderId}` : "";
  const { data: existing, refetch } = useApi<JobCost | null>(existingUrl);

  function loadExisting(jc: JobCost | null) {
    if (jc) {
      setRevenueQuoted(jc.revenueQuoted);
      setRevenueActual(jc.revenueActual);
      setNotes(jc.notes ?? "");
      setLines(jc.lines.length ? jc.lines : [{ ...EMPTY_LINE }]);
    } else {
      setRevenueQuoted(0); setRevenueActual(0); setNotes(""); setLines([{ ...EMPTY_LINE }]);
    }
  }

  const prevOrderId = useState("")[0];
  if (selectedOrderId && selectedOrderId !== prevOrderId && existing !== undefined) {
    // handled via useEffect pattern below
  }

  function handleOrderChange(id: string) {
    setSelectedOrderId(id);
    setRevenueQuoted(0); setRevenueActual(0); setNotes(""); setLines([{ ...EMPTY_LINE }]);
  }

  function updateLine(i: number, field: keyof Line, val: string | number) {
    setLines(ls => ls.map((l, idx) => {
      if (idx !== i) return l;
      const updated = { ...l, [field]: val };
      if (field === "quantity" || field === "unitCost") {
        updated.totalCost = Number(updated.quantity) * Number(updated.unitCost);
      }
      return updated;
    }));
  }

  function addLine() { setLines(ls => [...ls, { ...EMPTY_LINE }]); }
  function removeLine(i: number) { setLines(ls => ls.filter((_, idx) => idx !== i)); }

  const totalCost = lines.reduce((s, l) => s + Number(l.totalCost), 0);
  const revenue = revenueActual > 0 ? revenueActual : revenueQuoted;
  const grossProfit = revenue - totalCost;
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  async function save() {
    if (!selectedOrderId) return toast.error("Select a sales order");
    setSaving(true);
    try {
      await api.post("/job-costing", { salesOrderId: selectedOrderId, revenueQuoted, revenueActual, notes, lines });
      toast.success("Job cost saved");
      refetch();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Job Costing" />
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-5">

        {/* Order Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <label className="block text-xs font-semibold text-slate-600 mb-2">Select Sales Order</label>
          <select value={selectedOrderId}
            onChange={e => handleOrderChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm max-w-md">
            <option value="">— Choose an order —</option>
            {(orders ?? []).map(o => (
              <option key={o.id} value={o.id}>{o.orderNo} — {o.customer?.name}</option>
            ))}
          </select>
          {existing && (
            <button onClick={() => loadExisting(existing)}
              className="mt-2 text-xs text-indigo-600 hover:underline">Load saved cost sheet</button>
          )}
        </div>

        {selectedOrderId && (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Quoted Revenue", value: fmt(revenueQuoted), color: "blue", icon: <DollarSign size={16} /> },
                { label: "Total Cost", value: fmt(totalCost), color: "amber", icon: <DollarSign size={16} /> },
                { label: "Gross Profit", value: fmt(grossProfit), color: grossProfit >= 0 ? "emerald" : "red", icon: <TrendingUp size={16} /> },
                { label: "Margin %", value: `${margin.toFixed(1)}%`, color: margin >= 20 ? "emerald" : margin >= 10 ? "amber" : "red", icon: <AlertCircle size={16} /> },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-3 items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${c.color}-50 text-${c.color}-600`}>{c.icon}</div>
                  <div>
                    <p className="text-xs text-slate-500">{c.label}</p>
                    <p className={`text-lg font-bold text-${c.color}-600`}>{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Revenue</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quoted Revenue (₹)</label>
                  <input type="number" value={revenueQuoted}
                    onChange={e => setRevenueQuoted(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Actual Revenue (₹) <span className="text-slate-400 font-normal">- if different</span></label>
                  <input type="number" value={revenueActual}
                    onChange={e => setRevenueActual(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
            </div>

            {/* Cost Lines */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">Cost Line Items</h3>
                <button onClick={addLine} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800">
                  <Plus size={12} /> Add Line
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    {["Category", "Description", "Qty", "Unit", "Unit Cost", "Total", ""].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {lines.map((l, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">
                          <select value={l.category} onChange={e => updateLine(i, "category", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-xs w-full">
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input value={l.description} onChange={e => updateLine(i, "description", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-xs w-full min-w-32" placeholder="Description" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={l.quantity} onChange={e => updateLine(i, "quantity", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-xs w-16" />
                        </td>
                        <td className="px-3 py-2">
                          <input value={l.unit} onChange={e => updateLine(i, "unit", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-xs w-16" placeholder="Nos" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={l.unitCost} onChange={e => updateLine(i, "unitCost", e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-xs w-24" />
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-700 text-xs">{fmt(l.totalCost)}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={5} className="px-3 py-2 text-xs font-bold text-slate-600 text-right">Total Cost:</td>
                    <td className="px-3 py-2 text-sm font-bold text-slate-800">{fmt(totalCost)}</td>
                    <td />
                  </tr></tfoot>
                </table>
              </div>
            </div>

            {/* Notes + Save */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none mb-4" />
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Save size={14} /> {saving ? "Saving…" : "Save Cost Sheet"}
              </button>
            </div>
          </>
        )}

        {!selectedOrderId && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <TrendingUp size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">Select a Sales Order to start job costing</p>
            <p className="text-xs text-slate-400 mt-1">Track material, labour, and overhead costs per job and monitor gross margin</p>
          </div>
        )}
      </div>
    </div>
  );
}
