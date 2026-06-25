"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api-client";
import { Plus, Trash2, Printer, Send, Loader2, Paperclip, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

const EXPENSE_TYPES = ["TRAVEL", "ACCOMMODATION", "FOOD", "CLIENT_ENTERTAINMENT", "COMMUNICATION", "OTHER"];
const CATEGORIES = ["Fuel", "Toll", "Parking", "Hotel", "Food", "Client Lunch/Dinner", "Train", "Bus", "Flight", "Auto/Taxi", "Other"];

function newItem() {
  return { date: "", category: "Fuel", description: "", fromPlace: "", toPlace: "", km: "", amount: "", billAvailable: true };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT:              { label: "Draft",                  color: "text-gray-600 bg-gray-100",   icon: Clock },
  SUBMITTED:          { label: "Submitted",              color: "text-blue-600 bg-blue-100",   icon: Clock },
  HOD_REVIEW:         { label: "HOD Review",             color: "text-yellow-700 bg-yellow-100", icon: Clock },
  HOD_RECOMMENDED:    { label: "HOD Recommended",        color: "text-green-700 bg-green-100", icon: CheckCircle },
  HOD_HOLD:           { label: "On Hold (HOD)",          color: "text-orange-700 bg-orange-100", icon: AlertCircle },
  HOD_REJECTED:       { label: "Rejected by HOD",        color: "text-red-700 bg-red-100",     icon: XCircle },
  ACCOUNTS_VERIFY:    { label: "Accounts Verification",  color: "text-purple-700 bg-purple-100", icon: Clock },
  ACCOUNTS_VERIFIED:  { label: "Accounts Verified",      color: "text-green-700 bg-green-100", icon: CheckCircle },
  ACCOUNTS_HOLD:      { label: "On Hold (Accounts)",     color: "text-orange-700 bg-orange-100", icon: AlertCircle },
  CEO_REVIEW:         { label: "CEO Review",             color: "text-blue-700 bg-blue-100",   icon: Clock },
  APPROVED:           { label: "Approved",               color: "text-green-700 bg-green-100", icon: CheckCircle },
  REJECTED:           { label: "Rejected",               color: "text-red-700 bg-red-100",     icon: XCircle },
  HOLD:               { label: "On Hold",                color: "text-orange-700 bg-orange-100", icon: AlertCircle },
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [fjps, setFjps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"mine" | "pending">("mine");

  const [form, setForm] = useState({
    expenseType: "TRAVEL",
    description: "",
    fjpId: "",
    advanceReceived: "",
  });
  const [items, setItems] = useState([newItem()]);
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, fjpRes] = await Promise.all([
        api.get("/api/sales/expenses"),
        api.get("/api/sales/fjp"),
      ]) as any[];
      if (expRes?.data) setExpenses(expRes.data);
      if (fjpRes?.data?.fjps) setFjps(fjpRes.data.fjps);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const advance = parseFloat(form.advanceReceived) || 0;
  const netPayable = totalAmount - advance;

  const addItem = () => setItems([...items, newItem()]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, val: any) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    setItems(updated);
  };

  const handleSubmit = async (status = "SUBMITTED") => {
    if (!form.expenseType || !form.description) { alert("Fill all required fields."); return; }
    if (items.some(i => !i.date || !i.category || !i.amount)) { alert("Fill all expense item fields."); return; }
    setSubmitting(true);
    try {
      await api.post("/api/sales/expenses", { ...form, items, status });
      alert(status === "DRAFT" ? "Draft saved." : "Expense submitted successfully!");
      setShowForm(false);
      setItems([newItem()]);
      setForm({ expenseType: "TRAVEL", description: "", fjpId: "", advanceReceived: "" });
      fetchData();
    } catch { alert("Submission failed."); }
    finally { setSubmitting(false); }
  };

  const handlePrint = (exp: any) => {
    setSelected(exp);
    setTimeout(() => window.print(), 300);
  };

  const mine = expenses.filter(e => !["ACCOUNTS_VERIFY", "CEO_REVIEW"].includes(e.status) || true);
  const pending = expenses.filter(e => ["SUBMITTED", "HOD_REVIEW", "ACCOUNTS_VERIFY", "CEO_REVIEW"].includes(e.status));

  return (
    <div className="p-6 space-y-6 print:p-0">

      {/* ── Print View ── */}
      {selected && (
        <div className="hidden print:block bg-white p-8 text-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">ZAG SIGNS</h1>
              <p className="text-gray-500 text-xs">Expense / Travel Claim Report</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{selected.expenseNo}</p>
              <p>Month: {selected.forMonth}</p>
              <p>Date: {new Date(selected.submittedDate).toLocaleDateString("en-IN")}</p>
              <p>Status: {STATUS_CONFIG[selected.status]?.label}</p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 text-xs border p-3 rounded">
            <div><strong>Name:</strong> {selected.user?.name}</div>
            <div><strong>Branch:</strong> {selected.user?.branch}</div>
            <div><strong>Type:</strong> {selected.expenseType}</div>
            <div><strong>FJP Ref:</strong> {selected.fjp?.fjpNo || "N/A"}</div>
            <div className="col-span-2"><strong>Description:</strong> {selected.description}</div>
          </div>

          <table className="w-full border border-collapse text-xs mb-4">
            <thead className="bg-gray-100">
              <tr>
                {["Date", "Category", "Description", "From", "To", "KM", "Amount (₹)", "Bill"].map(h => (
                  <th key={h} className="border px-2 py-1 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selected.items?.map((item: any, i: number) => (
                <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                  <td className="border px-2 py-1">{new Date(item.date).toLocaleDateString("en-IN")}</td>
                  <td className="border px-2 py-1">{item.category}</td>
                  <td className="border px-2 py-1">{item.description}</td>
                  <td className="border px-2 py-1">{item.fromPlace || "-"}</td>
                  <td className="border px-2 py-1">{item.toPlace || "-"}</td>
                  <td className="border px-2 py-1 text-right">{item.km || "-"}</td>
                  <td className="border px-2 py-1 text-right">₹{item.amount.toLocaleString("en-IN")}</td>
                  <td className="border px-2 py-1 text-center">{item.billAvailable ? "✓" : "✗"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={6} className="border px-2 py-1 text-right">Total Amount:</td>
                <td className="border px-2 py-1 text-right">₹{selected.totalAmount?.toLocaleString("en-IN")}</td>
                <td className="border" />
              </tr>
              <tr>
                <td colSpan={6} className="border px-2 py-1 text-right">Less: Advance Received:</td>
                <td className="border px-2 py-1 text-right">₹{selected.advanceReceived?.toLocaleString("en-IN")}</td>
                <td className="border" />
              </tr>
              <tr className="font-bold text-blue-800">
                <td colSpan={6} className="border px-2 py-1 text-right">Net Payable:</td>
                <td className="border px-2 py-1 text-right">₹{selected.netPayable?.toLocaleString("en-IN")}</td>
                <td className="border" />
              </tr>
            </tfoot>
          </table>

          {/* Approval Chain */}
          {selected.approvals?.length > 0 && (
            <div className="mb-4 text-xs">
              <strong>Approval History:</strong>
              <table className="w-full border border-collapse mt-1">
                <thead><tr className="bg-gray-100">
                  <th className="border px-2 py-1">Stage</th>
                  <th className="border px-2 py-1">Action</th>
                  <th className="border px-2 py-1">By</th>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Reason</th>
                </tr></thead>
                <tbody>
                  {selected.approvals.map((a: any, i: number) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{a.stage}</td>
                      <td className="border px-2 py-1">{a.action}</td>
                      <td className="border px-2 py-1">{a.actionBy?.name}</td>
                      <td className="border px-2 py-1">{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="border px-2 py-1">{a.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-500 mb-8">
            Note: Please attach original bills/receipts to this printed form and submit to Accounts.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-8 text-center text-xs">
            {["Submitted By (Signature & Date)", "HOD Recommended (Signature & Date)", "Accounts Verified (Signature & Date)"].map(label => (
              <div key={label}><div className="border-t border-gray-400 pt-2">{label}</div></div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 text-center text-xs">
            <div><div className="border-t border-gray-400 pt-2 max-w-xs mx-auto">CEO Approved (Signature & Date)</div></div>
          </div>
        </div>
      )}

      {/* ── Screen View ── */}
      <div className="print:hidden space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Expense Reports</h1>
            <p className="text-sm text-gray-500 mt-1">Submit and track travel & expense claims</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Expense
          </button>
        </div>

        {/* New Expense Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-lg">New Expense Report</h2>

            {/* Header fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Expense Type *</label>
                <select value={form.expenseType} onChange={e => setForm(f => ({ ...f, expenseType: e.target.value }))}
                  className="w-full border rounded px-3 py-2 mt-1 text-sm">
                  {EXPENSE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">FJP Reference (for Travel)</label>
                <select value={form.fjpId} onChange={e => setForm(f => ({ ...f, fjpId: e.target.value }))}
                  className="w-full border rounded px-3 py-2 mt-1 text-sm">
                  <option value="">-- Select FJP --</option>
                  {fjps.filter(f => f.status === "SUBMITTED" || f.status === "APPROVED").map(f => (
                    <option key={f.id} value={f.id}>{f.fjpNo} ({f.forMonth})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Description / Purpose *</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of expenses" className="w-full border rounded px-3 py-2 mt-1 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Advance Received (₹)</label>
                <input type="number" value={form.advanceReceived}
                  onChange={e => setForm(f => ({ ...f, advanceReceived: e.target.value }))}
                  placeholder="0" className="w-full border rounded px-3 py-2 mt-1 text-sm" />
              </div>
            </div>

            {/* Expense Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Expense Items *</label>
                <button onClick={addItem} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <Plus className="w-3 h-3" /> Add Row
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Date *</th>
                      <th className="px-2 py-1 text-left">Category *</th>
                      <th className="px-2 py-1 text-left">Description</th>
                      <th className="px-2 py-1 text-left">From</th>
                      <th className="px-2 py-1 text-left">To</th>
                      <th className="px-2 py-1 text-right">KM</th>
                      <th className="px-2 py-1 text-right">Amount (₹) *</th>
                      <th className="px-2 py-1 text-center">Bill?</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-1 py-1"><input type="date" value={item.date} onChange={e => updateItem(i, "date", e.target.value)} className="border rounded px-1 py-0.5 w-28" /></td>
                        <td className="px-1 py-1">
                          <select value={item.category} onChange={e => updateItem(i, "category", e.target.value)} className="border rounded px-1 py-0.5 w-28">
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-1 py-1"><input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Details" className="border rounded px-1 py-0.5 w-28" /></td>
                        <td className="px-1 py-1"><input value={item.fromPlace} onChange={e => updateItem(i, "fromPlace", e.target.value)} placeholder="From" className="border rounded px-1 py-0.5 w-20" /></td>
                        <td className="px-1 py-1"><input value={item.toPlace} onChange={e => updateItem(i, "toPlace", e.target.value)} placeholder="To" className="border rounded px-1 py-0.5 w-20" /></td>
                        <td className="px-1 py-1"><input type="number" value={item.km} onChange={e => updateItem(i, "km", e.target.value)} placeholder="0" className="border rounded px-1 py-0.5 w-14 text-right" /></td>
                        <td className="px-1 py-1"><input type="number" value={item.amount} onChange={e => updateItem(i, "amount", e.target.value)} placeholder="0" className="border rounded px-1 py-0.5 w-20 text-right" /></td>
                        <td className="px-1 py-1 text-center"><input type="checkbox" checked={item.billAvailable} onChange={e => updateItem(i, "billAvailable", e.target.checked)} /></td>
                        <td className="px-1 py-1">{items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold text-xs">
                    <tr>
                      <td colSpan={6} className="px-2 py-1 text-right">Total:</td>
                      <td className="px-2 py-1 text-right">₹{totalAmount.toLocaleString("en-IN")}</td>
                      <td colSpan={2} />
                    </tr>
                    <tr>
                      <td colSpan={6} className="px-2 py-1 text-right">Less Advance:</td>
                      <td className="px-2 py-1 text-right text-orange-600">₹{advance.toLocaleString("en-IN")}</td>
                      <td colSpan={2} />
                    </tr>
                    <tr className="text-blue-700">
                      <td colSpan={6} className="px-2 py-1 text-right">Net Payable:</td>
                      <td className="px-2 py-1 text-right font-bold">₹{netPayable.toLocaleString("en-IN")}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> Attach Supporting Documents
              </label>
              <input type="file" multiple accept="image/*,application/pdf"
                onChange={e => setFiles(e.target.files)}
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <p className="text-xs text-gray-400 mt-1">Upload scanned bills, receipts, tickets. Max 10 files.</p>
            </div>

            {/* Note about hard copy */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              📋 <strong>Reminder:</strong> After submitting, print this form and attach original hard copies of all bills/receipts before handing to Accounts.
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleSubmit("DRAFT")} disabled={submitting}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Save Draft</button>
              <button onClick={() => handleSubmit("SUBMITTED")} disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit for Approval
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {(["mine", "pending"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab === "mine" ? `My Expenses (${expenses.length})` : `Pending Approval (${pending.length})`}
            </button>
          ))}
        </div>

        {/* Expense List */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : (
          <div className="space-y-3">
            {(activeTab === "mine" ? expenses : pending).map(exp => {
              const cfg = STATUS_CONFIG[exp.status] || STATUS_CONFIG.DRAFT;
              const Icon = cfg.icon;
              return (
                <div key={exp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-700">{exp.expenseNo}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                        {exp.fjp && <span className="text-xs text-gray-500">FJP: {exp.fjp.fjpNo}</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Type: {exp.expenseType}</span>
                        <span>Month: {exp.forMonth}</span>
                        <span>Items: {exp.items?.length}</span>
                      </div>
                      {/* Approval chain */}
                      {exp.approvals?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {exp.approvals.map((a: any, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                              {a.stage}: <strong>{a.action}</strong> by {a.actionBy?.name}
                              {a.reason && ` — "${a.reason}"`}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Hold/Rejection reason */}
                      {(exp.holdReason || exp.rejectionReason) && (
                        <p className="mt-1 text-xs text-red-600">
                          ⚠️ {exp.holdReason || exp.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold">₹{exp.totalAmount?.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-gray-500">Net: ₹{exp.netPayable?.toLocaleString("en-IN")}</p>
                      <button onClick={() => handlePrint(exp)}
                        className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 ml-auto">
                        <Printer className="w-3 h-3" /> Print
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {(activeTab === "mine" ? expenses : pending).length === 0 && (
              <p className="text-center text-gray-500 py-8">No expense reports found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
