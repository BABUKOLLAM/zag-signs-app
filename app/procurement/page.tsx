"use client";
import { useState, Suspense } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { fmt } from "@/lib/utils";
import { Plus, RefreshCw, Search, X, Trash2 } from "lucide-react";
import { useToast } from "@/components/Toaster";
import DateRangeFilter, { useDateRangeQuery } from "@/components/DateRangeFilter";

const BRANCHES = ["HO", "TVM", "KTYM", "EKM", "CLT"];
const PO_STATUSES = ["DRAFT", "SENT", "PARTIAL", "RECEIVED", "COMPLETED", "CANCELLED"];
const PO_STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-500",
  SENT: "bg-blue-100 text-blue-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-indigo-100 text-indigo-700",
  CANCELLED: "bg-red-100 text-red-500",
};

/* ─── Vendor types ─── */
type Vendor = { id: string; vendorCode: string; name: string; company: string; phone: string; email: string; category: string; branch: string; status: string; creditDays: number };
const VENDOR_EMPTY = { name: "", company: "", phone: "", email: "", address: "", gstin: "", category: "Material", branch: "TVM", status: "ACTIVE", creditDays: 30 };

/* ─── PO types ─── */
type PO = { id: string; poNo: string; vendor: { name: string }; branch: string; status: string; totalAmount: number; deliveryDate: string | null; createdBy: { name: string } };
type POLine = { description: string; quantity: number; unit: string; unitCost: number; totalCost: number };
const PO_EMPTY = { vendorId: "", branch: "TVM", status: "DRAFT", deliveryDate: "", lines: [{ description: "", quantity: 1, unit: "Nos", unitCost: 0, totalCost: 0 }] as POLine[] };

/* ─── GRN types ─── */
type GRN = { id: string; grnNo: string; po: { poNo: string; vendor: { name: string } }; receivedDate: string; receivedBy: { name: string } };
const GRN_EMPTY = { poId: "", receivedDate: new Date().toISOString().slice(0, 10), items: [{ description: "", orderedQty: 1, receivedQty: 1, rejectedQty: 0, unit: "Nos" }] };

function ProcurementPageInner() {
  const dr = useDateRangeQuery();
  const [tab, setTab] = useState<"vendors" | "po" | "grn">("vendors");
  const toast = useToast();

  /* Vendors */
  const [vendorSearch, setVendorSearch] = useState("");
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorForm, setVendorForm] = useState<any>(VENDOR_EMPTY);
  const [savingVendor, setSavingVendor] = useState(false);
  const { data: vendors, loading: vendorLoading, refetch: refetchVendors } = useApi<Vendor[]>("/procurement/vendors");
  const filteredVendors = (vendors ?? []).filter(v =>
    !vendorSearch || v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || v.company?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  /* POs */
  const [poStatusFilter, setPoStatusFilter] = useState("");
  const [showPOForm, setShowPOForm] = useState(false);
  const [poForm, setPoForm] = useState<any>(PO_EMPTY);
  const [savingPO, setSavingPO] = useState(false);
  const { data: pos, loading: poLoading, refetch: refetchPOs } = useApi<PO[]>("/procurement/purchase-orders", dr.params);
  const filteredPOs = (pos ?? []).filter(p => !poStatusFilter || p.status === poStatusFilter);

  /* GRNs */
  const [showGRNForm, setShowGRNForm] = useState(false);
  const [grnForm, setGrnForm] = useState<any>(GRN_EMPTY);
  const [savingGRN, setSavingGRN] = useState(false);
  const { data: grns, loading: grnLoading, refetch: refetchGRNs } = useApi<GRN[]>("/procurement/grn", dr.params);

  /* Vendor save */
  async function saveVendor() {
    if (!vendorForm.name) return toast.error("Vendor name required");
    setSavingVendor(true);
    try {
      await api.post("/procurement/vendors", vendorForm);
      toast.success("Vendor saved");
      setShowVendorForm(false);
      refetchVendors();
    } catch { toast.error("Save failed"); }
    setSavingVendor(false);
  }

  /* PO line helpers */
  function updatePOLine(i: number, field: string, val: any) {
    setPoForm((f: any) => {
      const lines = [...f.lines];
      lines[i] = { ...lines[i], [field]: val };
      if (field === "quantity" || field === "unitCost") {
        lines[i].totalCost = Number(lines[i].quantity) * Number(lines[i].unitCost);
      }
      return { ...f, lines };
    });
  }

  async function savePO() {
    if (!poForm.vendorId) return toast.error("Select a vendor");
    setSavingPO(true);
    try {
      await api.post("/procurement/purchase-orders", poForm);
      toast.success("Purchase order created");
      setShowPOForm(false);
      setPoForm(PO_EMPTY);
      refetchPOs();
    } catch { toast.error("Save failed"); }
    setSavingPO(false);
  }

  async function updatePOStatus(id: string, status: string) {
    await api.put(`/procurement/purchase-orders/${id}`, { status });
    refetchPOs();
  }

  /* GRN save */
  async function saveGRN() {
    if (!grnForm.poId) return toast.error("Select a PO");
    setSavingGRN(true);
    try {
      await api.post("/procurement/grn", grnForm);
      toast.success("GRN recorded");
      setShowGRNForm(false);
      setGrnForm(GRN_EMPTY);
      refetchGRNs();
      refetchPOs();
    } catch { toast.error("Save failed"); }
    setSavingGRN(false);
  }

  const TABS = [
    { key: "vendors", label: "Vendors" },
    { key: "po", label: "Purchase Orders" },
    { key: "grn", label: "Goods Received (GRN)" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Procurement" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-slate-200 p-1 w-fit shadow-sm">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Date filter for the dated tabs (shared across them; kept in the URL) */}
        {(tab === "po" || tab === "grn") && (
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col gap-2">
            <DateRangeFilter value={dr.range} onChange={dr.setRange} urlError={dr.urlError}
              basisLabel={tab === "po" ? "PO raised" : tab === "grn" ? "Received" : ""} />
          </div>
        )}

        {/* ──── VENDORS ──── */}
        {tab === "vendors" && (
          <>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} placeholder="Search vendors…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <button onClick={refetchVendors} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                <RefreshCw size={14} className={vendorLoading ? "animate-spin text-slate-400" : "text-slate-400"} />
              </button>
              <button onClick={() => { setVendorForm(VENDOR_EMPTY); setEditingVendor(null); setShowVendorForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> Add Vendor
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Code", "Name / Company", "Category", "Branch", "Phone", "Credit Days", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {vendorLoading && <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading…</td></tr>}
                  {!vendorLoading && filteredVendors.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No vendors found</td></tr>}
                  {filteredVendors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600">{v.vendorCode}</td>
                      <td className="px-4 py-3"><p className="font-semibold text-slate-800">{v.name}</p><p className="text-xs text-slate-400">{v.company}</p></td>
                      <td className="px-4 py-3 text-xs">{v.category}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{v.branch}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{v.phone}</td>
                      <td className="px-4 py-3 text-xs">{v.creditDays}d</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${v.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{v.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ──── PURCHASE ORDERS ──── */}
        {tab === "po" && (
          <>
            <div className="flex gap-3">
              <select value={poStatusFilter} onChange={e => setPoStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
                <option value="">All Status</option>
                {PO_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={refetchPOs} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                <RefreshCw size={14} className={poLoading ? "animate-spin text-slate-400" : "text-slate-400"} />
              </button>
              <button onClick={() => { setPoForm(PO_EMPTY); setShowPOForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold ml-auto"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> New PO
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["PO No", "Vendor", "Branch", "Amount", "Delivery", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {poLoading && <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading…</td></tr>}
                  {!poLoading && filteredPOs.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No purchase orders found</td></tr>}
                  {filteredPOs.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600">{p.poNo}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.vendor?.name}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{p.branch}</span></td>
                      <td className="px-4 py-3 font-semibold">{fmt(p.totalAmount)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{p.deliveryDate ? new Date(p.deliveryDate).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PO_STATUS_COLOR[p.status]}`}>{p.status}</span></td>
                      <td className="px-4 py-3">
                        {p.status === "DRAFT" && (
                          <button onClick={() => updatePOStatus(p.id, "SENT")}
                            className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">Send</button>
                        )}
                        {p.status === "SENT" && (
                          <button onClick={() => { setGrnForm({ ...GRN_EMPTY, poId: p.id }); setTab("grn"); setShowGRNForm(true); }}
                            className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">Receive</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ──── GRN ──── */}
        {tab === "grn" && (
          <>
            <div className="flex justify-end gap-3">
              <button onClick={refetchGRNs} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                <RefreshCw size={14} className={grnLoading ? "animate-spin text-slate-400" : "text-slate-400"} />
              </button>
              <button onClick={() => { setGrnForm(GRN_EMPTY); setShowGRNForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> Record GRN
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["GRN No", "PO No", "Vendor", "Received Date", "Received By"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {grnLoading && <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading…</td></tr>}
                  {!grnLoading && (grns ?? []).length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-400">No GRNs recorded yet</td></tr>}
                  {(grns ?? []).map(g => (
                    <tr key={g.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600">{g.grnNo}</td>
                      <td className="px-4 py-3 text-xs font-semibold">{g.po?.poNo}</td>
                      <td className="px-4 py-3 text-sm">{g.po?.vendor?.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(g.receivedDate).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{g.receivedBy?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ──── Vendor Modal ──── */}
      {showVendorForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Vendor</h3>
              <button onClick={() => setShowVendorForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[["Name *", "name"], ["Company", "company"], ["Phone", "phone"], ["Email", "email"], ["GSTIN", "gstin"], ["Address", "address"]].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                  <input value={vendorForm[key]} onChange={e => setVendorForm((f: any) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select value={vendorForm.category} onChange={e => setVendorForm((f: any) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {["Material", "Service", "Printing", "Subcontract", "Transport", "Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                  <select value={vendorForm.branch} onChange={e => setVendorForm((f: any) => ({ ...f, branch: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Credit Days</label>
                <input type="number" value={vendorForm.creditDays} onChange={e => setVendorForm((f: any) => ({ ...f, creditDays: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveVendor} disabled={savingVendor}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {savingVendor ? "Saving…" : "Add Vendor"}
              </button>
              <button onClick={() => setShowVendorForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ──── PO Modal ──── */}
      {showPOForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">New Purchase Order</h3>
              <button onClick={() => setShowPOForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Vendor *</label>
                  <select value={poForm.vendorId} onChange={e => setPoForm((f: any) => ({ ...f, vendorId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    <option value="">— Select vendor —</option>
                    {(vendors ?? []).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                  <select value={poForm.branch} onChange={e => setPoForm((f: any) => ({ ...f, branch: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Date</label>
                <input type="date" value={poForm.deliveryDate} onChange={e => setPoForm((f: any) => ({ ...f, deliveryDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Line Items</span>
                <button onClick={() => setPoForm((f: any) => ({ ...f, lines: [...f.lines, { description: "", quantity: 1, unit: "Nos", unitCost: 0, totalCost: 0 }] }))}
                  className="text-xs text-indigo-600 flex items-center gap-1"><Plus size={12} /> Add</button>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50"><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2">Unit</th><th className="px-3 py-2">Rate</th><th className="px-3 py-2">Total</th><th /></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {poForm.lines.map((l: POLine, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5"><input value={l.description} onChange={e => updatePOLine(i, "description", e.target.value)} className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs" /></td>
                      <td className="px-3 py-1.5"><input type="number" value={l.quantity} onChange={e => updatePOLine(i, "quantity", e.target.value)} className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs" /></td>
                      <td className="px-3 py-1.5"><input value={l.unit} onChange={e => updatePOLine(i, "unit", e.target.value)} className="w-14 px-2 py-1 rounded-lg border border-slate-200 text-xs" /></td>
                      <td className="px-3 py-1.5"><input type="number" value={l.unitCost} onChange={e => updatePOLine(i, "unitCost", e.target.value)} className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs" /></td>
                      <td className="px-3 py-1.5 font-semibold">{fmt(l.totalCost)}</td>
                      <td className="px-3 py-1.5"><button onClick={() => setPoForm((f: any) => ({ ...f, lines: f.lines.filter((_: any, idx: number) => idx !== i) }))} className="text-red-400"><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button onClick={savePO} disabled={savingPO}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {savingPO ? "Creating…" : "Create PO"}
              </button>
              <button onClick={() => setShowPOForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ──── GRN Modal ──── */}
      {showGRNForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Record Goods Received</h3>
              <button onClick={() => setShowGRNForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Purchase Order *</label>
                <select value={grnForm.poId} onChange={e => setGrnForm((f: any) => ({ ...f, poId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">— Select PO —</option>
                  {(pos ?? []).filter(p => p.status === "SENT" || p.status === "PARTIAL").map(p => (
                    <option key={p.id} value={p.id}>{p.poNo} — {p.vendor?.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Received Date</label>
                <input type="date" value={grnForm.receivedDate} onChange={e => setGrnForm((f: any) => ({ ...f, receivedDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Items Received</span>
                <button onClick={() => setGrnForm((f: any) => ({ ...f, items: [...f.items, { description: "", orderedQty: 1, receivedQty: 1, rejectedQty: 0, unit: "Nos" }] }))}
                  className="text-xs text-indigo-600 flex items-center gap-1"><Plus size={12} /> Add</button>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50"><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2">Ordered</th><th className="px-3 py-2">Received</th><th className="px-3 py-2">Rejected</th><th /></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {grnForm.items.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5"><input value={it.description} onChange={e => setGrnForm((f: any) => { const items = [...f.items]; items[i] = { ...items[i], description: e.target.value }; return { ...f, items }; })} className="w-full px-2 py-1 rounded-lg border border-slate-200" /></td>
                      <td className="px-3 py-1.5"><input type="number" value={it.orderedQty} onChange={e => setGrnForm((f: any) => { const items = [...f.items]; items[i] = { ...items[i], orderedQty: e.target.value }; return { ...f, items }; })} className="w-16 px-2 py-1 rounded-lg border border-slate-200" /></td>
                      <td className="px-3 py-1.5"><input type="number" value={it.receivedQty} onChange={e => setGrnForm((f: any) => { const items = [...f.items]; items[i] = { ...items[i], receivedQty: e.target.value }; return { ...f, items }; })} className="w-16 px-2 py-1 rounded-lg border border-slate-200" /></td>
                      <td className="px-3 py-1.5"><input type="number" value={it.rejectedQty} onChange={e => setGrnForm((f: any) => { const items = [...f.items]; items[i] = { ...items[i], rejectedQty: e.target.value }; return { ...f, items }; })} className="w-16 px-2 py-1 rounded-lg border border-slate-200" /></td>
                      <td className="px-3 py-1.5"><button onClick={() => setGrnForm((f: any) => ({ ...f, items: f.items.filter((_: any, idx: number) => idx !== i) }))} className="text-red-400"><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button onClick={saveGRN} disabled={savingGRN}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {savingGRN ? "Saving…" : "Record GRN"}
              </button>
              <button onClick={() => setShowGRNForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// useSearchParams (date range in the URL) needs a Suspense boundary.
export default function ProcurementPage() {
  return (
    <Suspense fallback={null}>
      <ProcurementPageInner />
    </Suspense>
  );
}
