"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { fmt } from "@/lib/utils";
import { Plus, RefreshCw, Wallet, Loader2 } from "lucide-react";

type Collection = {
  id: string; collectionDate: string; amount: number; paymentMode: string;
  reference: string; notes: string; customerName: string; company: string;
  orderNo: string; invoiceNo: string;
};

const PAYMENT_MODES = ["CASH","CHEQUE","NEFT","UPI","BANK_TRANSFER"];
const MODE_COLORS: Record<string,string> = {
  CASH:"bg-green-100 text-green-700", CHEQUE:"bg-blue-100 text-blue-700",
  NEFT:"bg-indigo-100 text-indigo-700", UPI:"bg-purple-100 text-purple-700",
  BANK_TRANSFER:"bg-teal-100 text-teal-700",
};

export default function CollectionsPage() {
  const [month, setMonth]   = useState(new Date().toISOString().slice(0,7));
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: raw, loading, refetch } = useApi<Collection[]>(`/collections?month=${month}`);
  const collections = raw ?? [];

  const { data: customers } = useApi<{ id:string; name:string; company:string }[]>("/customers");
  const { data: invoices  } = useApi<{ id:string; invoiceNo:string; totalAmount:number }[]>("/invoices?status=PENDING");
  const { data: orders    } = useApi<{ id:string; orderNo:string }[]>("/sales-orders");
  const custList = customers ?? [];
  const invList  = invoices  ?? [];
  const ordList  = orders    ?? [];

  const [form, setForm] = useState({
    customerId:"", salesOrderId:"", invoiceId:"",
    amount:"", paymentMode:"BANK_TRANSFER", reference:"",
    collectionDate: new Date().toISOString().split("T")[0], notes:"",
  });

  const totalMonth = collections.reduce((s,c) => s + c.amount, 0);
  const byMode     = PAYMENT_MODES.map(m => ({
    mode: m, total: collections.filter(c => c.paymentMode === m).reduce((s,c) => s + c.amount, 0),
  })).filter(m => m.total > 0);

  async function createCollection() {
    if (!form.amount) return;
    setSaving(true);
    await fetch("/api/collections", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        ...form, amount: Number(form.amount),
        customerId:   form.customerId   || undefined,
        salesOrderId: form.salesOrderId || undefined,
        invoiceId:    form.invoiceId    || undefined,
      }),
    });
    setSaving(false); setShowCreate(false); refetch();
    setForm({ customerId:"", salesOrderId:"", invoiceId:"", amount:"", paymentMode:"BANK_TRANSFER", reference:"", collectionDate: new Date().toISOString().split("T")[0], notes:"" });
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Collections" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">

        {/* Month summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Total Collected ({month})</p>
            <p className="text-2xl font-bold text-emerald-600">{fmt(totalMonth)}</p>
            <p className="text-xs text-slate-400 mt-1">{collections.length} transactions</p>
          </div>
          {byMode.slice(0,3).map(m => (
            <div key={m.mode} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">{m.mode.replace("_"," ")}</p>
              <p className="text-2xl font-bold text-indigo-600">{fmt(m.total)}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          <button onClick={refetch} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500">
            <RefreshCw size={14} className={loading?"animate-spin":""} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold ml-auto"
            style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Plus size={14} /> Record Payment
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Date","Customer","Order / Invoice","Amount","Mode","Reference"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={6} className="text-center py-8"><Loader2 size={18} className="animate-spin mx-auto text-slate-400" /></td></tr>}
              {!loading && collections.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.collectionDate}</td>
                  <td className="px-4 py-3"><p className="font-medium text-slate-800">{c.customerName || "—"}</p><p className="text-xs text-slate-400">{c.company}</p></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.orderNo || c.invoiceNo || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{fmt(c.amount)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${MODE_COLORS[c.paymentMode] ?? "bg-slate-100 text-slate-500"}`}>{c.paymentMode.replace("_"," ")}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.reference || "—"}</td>
                </tr>
              ))}
              {!loading && collections.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">No collections for {month}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Wallet size={18} className="text-indigo-500" />Record Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Customer</label>
                <select value={form.customerId} onChange={e => setForm(f=>({...f,customerId:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">Select customer…</option>
                  {custList.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Invoice</label>
                  <select value={form.invoiceId} onChange={e => setForm(f=>({...f,invoiceId:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    <option value="">None</option>
                    {invList.map(i => <option key={i.id} value={i.id}>{i.invoiceNo} · {fmt(i.totalAmount)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sales Order</label>
                  <select value={form.salesOrderId} onChange={e => setForm(f=>({...f,salesOrderId:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    <option value="">None</option>
                    {ordList.map(o => <option key={o.id} value={o.id}>{o.orderNo}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input type="date" value={form.collectionDate} onChange={e => setForm(f=>({...f,collectionDate:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Mode</label>
                  <select value={form.paymentMode} onChange={e => setForm(f=>({...f,paymentMode:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m.replace("_"," ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Reference</label>
                  <input value={form.reference} onChange={e => setForm(f=>({...f,reference:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="Cheque/UTR no." />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={createCollection} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm" style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)"}}>
                {saving?"Saving…":"Record Payment"}
              </button>
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
