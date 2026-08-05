"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { fmt } from "@/lib/utils";
import { Plus, Trash2, Pencil, Save, X, Wallet, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { useToast } from "@/components/Toaster";

const BRANCHES = ["HO", "TVM", "KTYM", "EKM", "CLT"];
const CATEGORIES = ["Materials", "Labour", "Salaries", "Marketing", "Fleet & Transport", "Utilities", "Rent", "Procurement", "Overheads", "Other"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Budget = {
  id: string;
  branch: string;
  category: string;
  fiscalYear: number;
  month: number;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  notes: string;
  createdBy: string;
};

const EMPTY_FORM = {
  branch: "HO",
  category: "Materials",
  fiscalYear: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  budgetedAmount: 0,
  actualAmount: 0,
  notes: "",
};

export default function BudgetsPage() {
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const { data: budgets, loading, refetch } = useApi<Budget[]>("/budgets", {
    branch: branchFilter || undefined,
    fiscalYear: yearFilter || undefined,
    month: monthFilter || undefined,
  });

  const rows = budgets ?? [];
  const totalBudgeted = rows.reduce((s, b) => s + b.budgetedAmount, 0);
  const totalActual = rows.reduce((s, b) => s + b.actualAmount, 0);
  const totalVariance = totalBudgeted - totalActual;
  const utilization = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, branch: branchFilter || "HO", fiscalYear: yearFilter, month: monthFilter || new Date().getMonth() + 1 });
    setShowForm(true);
  }

  function openEdit(b: Budget) {
    setEditingId(b.id);
    setForm({
      branch: b.branch, category: b.category, fiscalYear: b.fiscalYear, month: b.month,
      budgetedAmount: b.budgetedAmount, actualAmount: b.actualAmount, notes: b.notes,
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.category.trim()) return toast.error("Category is required");
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/budgets/${editingId}`, form);
      } else {
        await api.post("/budgets", form);
      }
      toast.success("Budget saved");
      setShowForm(false);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this budget line?")) return;
    try {
      await api.del(`/budgets/${id}`);
      toast.success("Budget deleted");
      refetch();
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Budgeting" />
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-5">

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Budgeted", value: fmt(totalBudgeted), color: "indigo", icon: <Wallet size={16} /> },
            { label: "Total Actual", value: fmt(totalActual), color: "amber", icon: <PieChart size={16} /> },
            { label: "Variance", value: fmt(totalVariance), color: totalVariance >= 0 ? "emerald" : "red", icon: totalVariance >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} /> },
            { label: "Utilization", value: `${utilization.toFixed(1)}%`, color: utilization <= 100 ? "emerald" : "red", icon: <PieChart size={16} /> },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-3 items-center">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${c.color}-50 text-${c.color}-600`}>{c.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-lg font-bold text-${c.color}-600`}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + Add */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
              <option value="">All Branches</option>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Fiscal Year</label>
            <input type="number" value={yearFilter} onChange={(e) => setYearFilter(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
            <select value={monthFilter} onChange={(e) => setMonthFilter(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
              <option value={0}>All Months</option>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <button onClick={openAdd}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Plus size={14} /> Add Budget Line
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">{editingId ? "Edit Budget Line" : "New Budget Line"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  disabled={!!editingId}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50">
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                  <input type="number" value={form.fiscalYear} disabled={!!editingId}
                    onChange={(e) => setForm({ ...form, fiscalYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                  <select value={form.month} disabled={!!editingId}
                    onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm disabled:bg-slate-50">
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Budgeted Amount (₹)</label>
                <input type="number" value={form.budgetedAmount}
                  onChange={(e) => setForm({ ...form, budgetedAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Actual Amount (₹) <span className="text-slate-400 font-normal">- fill in as spend happens</span></label>
                <input type="number" value={form.actualAmount}
                  onChange={(e) => setForm({ ...form, actualAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none" />
              </div>
            </div>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
              <Save size={14} /> {saving ? "Saving…" : "Save Budget Line"}
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Branch", "Category", "Period", "Budgeted", "Actual", "Variance", "Notes", ""].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {loading && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-400 text-sm">Loading…</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-400 text-sm">No budget lines for this filter. Add one to get started.</td></tr>
                )}
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td className="px-3 py-2"><span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded">{b.branch}</span></td>
                    <td className="px-3 py-2 font-medium text-slate-700">{b.category}</td>
                    <td className="px-3 py-2 text-slate-500">{MONTHS[b.month - 1]} {b.fiscalYear}</td>
                    <td className="px-3 py-2">{fmt(b.budgetedAmount)}</td>
                    <td className="px-3 py-2">{fmt(b.actualAmount)}</td>
                    <td className={`px-3 py-2 font-semibold ${b.variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(b.variance)}</td>
                    <td className="px-3 py-2 text-slate-400 text-xs max-w-40 truncate">{b.notes}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(b)} className="text-indigo-400 hover:text-indigo-600"><Pencil size={13} /></button>
                        <button onClick={() => remove(b.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
