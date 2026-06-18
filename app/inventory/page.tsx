"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { useToast } from "@/components/Toaster";
import { Plus, RefreshCw, Package, AlertTriangle, X, ArrowUpDown } from "lucide-react";

const CATEGORIES = ["Flex", "Vinyl", "ACP", "Acrylic", "LED", "Metal", "Electrical", "Ink", "Hardware", "Other"];
const UNITS = ["Sqft", "Sqmtr", "Meters", "Kg", "Nos", "Rolls", "Litres", "Sheets", "Boxes"];

const STATUS_COLORS: Record<string, string> = {
  OK:       "bg-green-100 text-green-700",
  Low:      "bg-yellow-100 text-yellow-700",
  Critical: "bg-red-100 text-red-700",
  Out:      "bg-gray-100 text-gray-600",
};

interface Material {
  id: string; name: string; category: string; unit: string;
  currentStock: number; minimumStock: number; unitCost: number;
  supplier: string; createdAt: string; stockStatus: string; stockValue: number;
}

const emptyMaterial = {
  name: "", category: "Flex", unit: "Sqft",
  currentStock: "", minimumStock: "", unitCost: "", supplier: "",
};

const emptyMovement = { type: "IN", quantity: "", reference: "", notes: "" };

const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function InventoryPage() {
  const toast = useToast();
  const [catFilter, setCatFilter]       = useState("");
  const [search, setSearch]             = useState("");
  const [showAdd, setShowAdd]           = useState(false);
  const [moveFor, setMoveFor]           = useState<Material | null>(null);
  const [form, setForm]                 = useState(emptyMaterial);
  const [moveForm, setMoveForm]         = useState(emptyMovement);
  const [saving, setSaving]             = useState(false);

  const { data, loading, error, refetch } = useApi<Material[]>("/inventory", {
    category: catFilter || undefined,
    search:   search    || undefined,
  });

  const materials = data ?? [];
  const totalValue   = materials.reduce((s, m) => s + m.stockValue, 0);
  const lowCount     = materials.filter((m) => m.stockStatus === "Low").length;
  const criticalCount = materials.filter((m) => m.stockStatus === "Critical" || m.stockStatus === "Out").length;

  const set  = (f: keyof typeof emptyMaterial) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [f]: e.target.value }));
  const setM = (f: keyof typeof emptyMovement) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setMoveForm((p) => ({ ...p, [f]: e.target.value }));

  const handleAddMaterial = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      await api.post("/inventory", {
        name:         form.name,
        category:     form.category,
        unit:         form.unit,
        currentStock: Number(form.currentStock) || 0,
        minimumStock: Number(form.minimumStock) || 0,
        unitCost:     Number(form.unitCost)     || 0,
        supplier:     form.supplier             || undefined,
      });
      setForm(emptyMaterial);
      setShowAdd(false);
      refetch();
      toast.success("Material added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add material");
    } finally { setSaving(false); }
  };

  const handleMovement = async () => {
    if (!moveFor) return;
    if (!moveForm.quantity || Number(moveForm.quantity) <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/inventory/${moveFor.id}/movement`, {
        type:      moveForm.type,
        quantity:  Number(moveForm.quantity),
        reference: moveForm.reference || undefined,
        notes:     moveForm.notes     || undefined,
      });
      setMoveFor(null);
      setMoveForm(emptyMovement);
      refetch();
      const label = moveForm.type === "IN" ? "Stock added" : moveForm.type === "OUT" ? "Stock deducted" : "Stock adjusted";
      toast.success(`${label} for ${moveFor.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Stock update failed");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <TopBar title="Inventory" />
      <div className="p-4 md:p-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Items", value: materials.length, color: "text-gray-900" },
            { label: "Stock Value", value: `₹${(totalValue/1000).toFixed(1)}K`, color: "text-indigo-700" },
            { label: "Low Stock", value: lowCount, color: lowCount > 0 ? "text-yellow-600" : "text-green-600" },
            { label: "Critical / Out", value: criticalCount, color: criticalCount > 0 ? "text-red-600" : "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap items-center">
            <input type="text" placeholder="Search materials…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button onClick={refetch} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Add Material
          </button>
        </div>

        {/* Category pills */}
        {materials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => materials.some((m) => m.category === c)).map((c) => (
              <button key={c}
                onClick={() => setCatFilter((f) => f === c ? "" : c)}
                className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                  catFilter === c ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                {c} ({materials.filter((m) => m.category === c).length})
              </button>
            ))}
          </div>
        )}

        {/* Materials table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? <TableSkeleton rows={8} cols={8} /> :
           error   ? <ErrorState message={error} onRetry={refetch} /> :
           materials.length === 0 ? (
             <EmptyState label="No materials found" hint="Add your first material to start tracking inventory." />
           ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Material</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-right px-4 py-3">Current Stock</th>
                    <th className="text-right px-4 py-3 hidden md:table-cell">Min Stock</th>
                    <th className="text-left px-4 py-3">Unit</th>
                    <th className="text-right px-4 py-3 hidden lg:table-cell">Unit Cost</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {materials.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={12} className="text-indigo-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{m.name}</p>
                            {m.supplier && <p className="text-xs text-gray-400">{m.supplier}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.category}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${
                          m.stockStatus === "Critical" || m.stockStatus === "Out"
                            ? "text-red-600"
                            : m.stockStatus === "Low"
                            ? "text-yellow-600"
                            : "text-gray-900"
                        }`}>
                          {m.currentStock.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                        {m.minimumStock.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.unit}</td>
                      <td className="px-4 py-3 text-right text-gray-700 hidden lg:table-cell">
                        {m.unitCost > 0 ? `₹${m.unitCost.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {(m.stockStatus === "Critical" || m.stockStatus === "Out") && (
                            <AlertTriangle size={12} className="text-red-500" />
                          )}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[m.stockStatus] ?? STATUS_COLORS.OK}`}>
                            {m.stockStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setMoveFor(m); setMoveForm(emptyMovement); }}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <ArrowUpDown size={11} /> Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Material modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h2 className="text-base font-bold text-gray-900">Add Material</h2>
              <button onClick={() => { setShowAdd(false); setForm(emptyMaterial); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Material Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={set("name")} placeholder="e.g. Flex Banner Frontlit" className={ic} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category <span className="text-red-500">*</span></label>
                <select value={form.category} onChange={set("category")} className={ic}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <select value={form.unit} onChange={set("unit")} className={ic}>
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Opening Stock</label>
                <input type="number" value={form.currentStock} onChange={set("currentStock")} placeholder="0" className={ic} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reorder Level</label>
                <input type="number" value={form.minimumStock} onChange={set("minimumStock")} placeholder="0" className={ic} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit Cost (₹)</label>
                <input type="number" value={form.unitCost} onChange={set("unitCost")} placeholder="0" className={ic} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
                <input value={form.supplier} onChange={set("supplier")} placeholder="Supplier name" className={ic} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button onClick={() => { setShowAdd(false); setForm(emptyMaterial); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleAddMaterial} disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
                {saving ? "Saving…" : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement modal */}
      {moveFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <div>
                <h2 className="text-base font-bold text-gray-900">Adjust Stock</h2>
                <p className="text-xs text-gray-500">{moveFor.name} · Current: {moveFor.currentStock} {moveFor.unit}</p>
              </div>
              <button onClick={() => setMoveFor(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Movement Type</label>
                <div className="flex gap-2">
                  {(["IN", "OUT", "ADJUSTMENT"] as const).map((t) => (
                    <button key={t}
                      onClick={() => setMoveForm((p) => ({ ...p, type: t }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        moveForm.type === t
                          ? t === "IN"
                            ? "bg-green-600 text-white border-green-600"
                            : t === "OUT"
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {t === "IN" ? "Stock In" : t === "OUT" ? "Stock Out" : "Set Qty"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {moveForm.type === "IN" ? "Adds to current stock" :
                   moveForm.type === "OUT" ? "Deducts from current stock" :
                   "Sets stock to exact quantity"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Quantity ({moveFor.unit}) <span className="text-red-500">*</span>
                </label>
                <input type="number" value={moveForm.quantity} onChange={setM("quantity")} placeholder="0" className={ic} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reference (optional)</label>
                <input value={moveForm.reference} onChange={setM("reference")} placeholder="e.g. PO-123, WO-045" className={ic} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                <textarea rows={2} value={moveForm.notes} onChange={setM("notes")} placeholder="Reason or remarks…" className={ic} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button onClick={() => setMoveFor(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleMovement} disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
                {saving ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
