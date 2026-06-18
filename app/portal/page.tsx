"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FileText, Package, Wallet, Phone, Mail, Building2, AlertCircle } from "lucide-react";
import { fmt } from "@/lib/utils";

// Customer self-service portal — lightweight public-facing page.
// Access via: /portal?customer=<customerNo>&token=<secret>
// (Token-based auth without requiring NextAuth — suitable for external sharing)

type Quotation = { quotationNo: string; amount: number; status: string; createdAt: string };
type Order     = { orderNo: string; totalAmount: number; status: string; createdAt: string };
type Invoice   = { invoiceNo: string; totalAmount: number; status: string; dueDate: string };

type PortalData = {
  customer: { name: string; company: string; phone: string; email: string; customerNo: string };
  quotations: Quotation[];
  orders: Order[];
  invoices: Invoice[];
};

const STATUS_COLORS: Record<string,string> = {
  DRAFT:    "bg-slate-100 text-slate-500",
  SENT:     "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING:  "bg-amber-100 text-amber-700",
  PARTIAL:  "bg-blue-100 text-blue-700",
  PAID:     "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  COMPLETED:   "bg-emerald-100 text-emerald-700",
  CANCELLED:   "bg-red-100 text-red-700",
};

function PortalContent() {
  const params = useSearchParams();
  const customerNo = params.get("customer") ?? "";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"quotations"|"orders"|"invoices">("orders");

  useEffect(() => {
    if (!customerNo) { setLoading(false); setError("No customer specified."); return; }
    fetch(`/api/portal?customer=${encodeURIComponent(customerNo)}`)
      .then(r => r.json())
      .then((j: { data?: PortalData; error?: string }) => {
        if (j.error) setError(j.error);
        else setData(j.data ?? null);
      })
      .catch(() => setError("Failed to load portal data."))
      .finally(() => setLoading(false));
  }, [customerNo]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center" style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
          <span className="text-white text-xl font-bold">Z</span>
        </div>
        <p className="text-sm text-slate-500">Loading your portal…</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="text-center space-y-3 max-w-sm">
        <AlertCircle size={40} className="mx-auto text-red-400" />
        <p className="font-semibold text-slate-700">{error || "Customer not found"}</p>
        <p className="text-sm text-slate-400">Please contact ZAG SIGNS for assistance.</p>
        <p className="text-sm text-slate-500 mt-4">📞 +91 XXXXX XXXXX</p>
      </div>
    </div>
  );

  const { customer, quotations, orders, invoices } = data;
  const outstanding = invoices.filter(i => i.status !== "PAID").reduce((s,i) => s + i.totalAmount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
              <span className="text-white text-sm font-bold">Z</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">ZAG SIGNS</p>
              <p className="text-xs text-slate-400">Customer Portal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{customer.name}</p>
            <p className="text-xs text-slate-400">{customer.customerNo}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Customer card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-sm text-slate-500 flex items-center gap-1.5"><Building2 size={12} />{customer.company}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1.5"><Phone size={12} />{customer.phone}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1.5"><Mail size={12} />{customer.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Quotations",  value: quotations.length,  color:"indigo" },
                { label:"Orders",      value: orders.length,      color:"emerald" },
                { label:"Outstanding", value: fmt(outstanding),   color:"amber" },
              ].map(c => (
                <div key={c.label} className="text-center bg-slate-50 rounded-xl p-3">
                  <p className={`text-lg font-bold text-${c.color}-600`}>{c.value}</p>
                  <p className="text-xs text-slate-400">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 w-fit shadow-sm">
          {(["orders","quotations","invoices"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab===t ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              style={tab===t ? { background:"linear-gradient(135deg,#4F46E5,#7C3AED)" } : {}}>
              {t}
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === "orders" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Package size={16} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Sales Orders</h3>
            </div>
            {orders.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">No orders yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Order No","Amount","Status","Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map(o => (
                    <tr key={o.orderNo} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-indigo-600">{o.orderNo}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{fmt(o.totalAmount)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] ?? "bg-slate-100 text-slate-500"}`}>{o.status.replace("_"," ")}</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(o.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Quotations */}
        {tab === "quotations" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Quotations</h3>
            </div>
            {quotations.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">No quotations yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Quotation No","Amount","Status","Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {quotations.map(q => (
                    <tr key={q.quotationNo} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-indigo-600">{q.quotationNo}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{fmt(q.amount)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[q.status] ?? "bg-slate-100 text-slate-500"}`}>{q.status}</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(q.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Invoices */}
        {tab === "invoices" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Wallet size={16} className="text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Invoices</h3>
            </div>
            {invoices.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">No invoices yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Invoice No","Total","Status","Due Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map(i => (
                    <tr key={i.invoiceNo} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-indigo-600">{i.invoiceNo}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{fmt(i.totalAmount)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[i.status] ?? "bg-slate-100 text-slate-500"}`}>{i.status}</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{i.dueDate ? new Date(i.dueDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} ZAG SIGNS · Customer Portal · For queries contact your relationship manager</p>
        </div>
      </div>
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    }>
      <PortalContent />
    </Suspense>
  );
}
