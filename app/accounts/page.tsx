"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { fmt } from "@/lib/utils";
import { Plus, Search, RefreshCw, FileText, Loader2 } from "lucide-react";

type Invoice = {
  id: string; invoiceNo: string; invoiceDate: string; dueDate: string;
  amount: number; taxAmount: number; totalAmount: number; status: string;
  notes: string; orderNo: string; customerName: string;
};

const STATUS_COLORS: Record<string,string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PARTIAL: "bg-blue-100  text-blue-700",
  PAID:    "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100   text-red-700",
};

export default function AccountsPage() {
  const [status, setStatus]   = useState("");
  const [search, setSearch]   = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving]   = useState(false);

  const params = new URLSearchParams({ ...(status?{status}:{}), ...(search?{search}:{}) });
  const { data: raw, loading, refetch } = useApi<Invoice[]>(`/invoices?${params}`);
  const invoices = raw ?? [];

  const { data: salesOrders } = useApi<{ id:string; orderNo:string; customer:{name:string}|null }[]>("/sales-orders");
  const orders = salesOrders ?? [];

  const [form, setForm] = useState({ salesOrderId:"", amount:"", taxAmount:"0", dueDate:"", notes:"" });

  const totalOutstanding = invoices.filter(i => i.status !== "PAID").reduce((s,i) => s + i.totalAmount, 0);
  const totalPaid        = invoices.filter(i => i.status === "PAID").reduce((s,i) => s + i.totalAmount, 0);
  const overdue          = invoices.filter(i => i.status === "OVERDUE").length;

  async function createInvoice() {
    if (!form.amount) return;
    setSaving(true);
    await fetch("/api/invoices", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        salesOrderId: form.salesOrderId || undefined,
        amount: Number(form.amount), taxAmount: Number(form.taxAmount),
        dueDate: form.dueDate || undefined, notes: form.notes,
      }),
    });
    setSaving(false); setShowCreate(false); refetch();
    setForm({ salesOrderId:"", amount:"", taxAmount:"0", dueDate:"", notes:"" });
  }

  async function markPaid(id: string) {
    await fetch(`/api/invoices/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ status:"PAID" }) });
    refetch();
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Accounts & Invoicing" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label:"Total Invoices",   value: invoices.length, color:"indigo"  },
            { label:"Outstanding",      value: fmt(totalOutstanding), color:"amber"   },
            { label:"Collected",        value: fmt(totalPaid),        color:"emerald" },
            { label:"Overdue",          value: overdue,               color:"red"     },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">All Statuses</option>
            {["PENDING","PARTIAL","PAID","OVERDUE"].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={refetch} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500">
            <RefreshCw size={14} className={loading?"animate-spin":""} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Plus size={14} /> New Invoice
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Invoice No","Customer","Date","Due Date","Amount","Tax","Total","Status","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={9} className="text-center py-8"><Loader2 size={18} className="animate-spin mx-auto text-slate-400" /></td></tr>}
              {!loading && invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-indigo-600">{inv.invoiceNo}</td>
                  <td className="px-4 py-3"><p className="font-medium text-slate-800">{inv.customerName || "—"}</p><p className="text-xs text-slate-400">{inv.orderNo}</p></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{inv.invoiceDate}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{inv.dueDate || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{fmt(inv.amount)}</td>
                  <td className="px-4 py-3 text-slate-500">{fmt(inv.taxAmount)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{fmt(inv.totalAmount)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] ?? "bg-slate-100 text-slate-500"}`}>{inv.status}</span></td>
                  <td className="px-4 py-3">
                    {inv.status !== "PAID" && (
                      <button onClick={() => markPaid(inv.id)}
                        className="text-xs px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && invoices.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-slate-400">No invoices yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText size={18} className="text-indigo-500" />New Invoice</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sales Order (optional)</label>
                <select value={form.salesOrderId} onChange={e => setForm(f=>({...f,salesOrderId:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">No linked order</option>
                  {orders.map(o => <option key={o.id} value={o.id}>{o.orderNo} — {o.customer?.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tax (₹)</label>
                  <input type="number" value={form.taxAmount} onChange={e => setForm(f=>({...f,taxAmount:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={createInvoice} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm" style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)"}}>
                {saving?"Creating…":"Create Invoice"}
              </button>
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
