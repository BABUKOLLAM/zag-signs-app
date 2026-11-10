"use client";
import { useState, Suspense } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { fmt } from "@/lib/utils";
import { RefreshCw, Search, MapPin, CheckCircle, Truck, Package, Hammer, X } from "lucide-react";
import { useToast } from "@/components/Toaster";
import { LoadingState, ListCapNote } from "@/components/States";
import DateRangeFilter, { useDateRangeQuery } from "@/components/DateRangeFilter";

const INSTALL_STATUSES = ["DISPATCHED", "INSTALLATION", "INSTALLED", "DELIVERED"];
const STATUS_COLOR: Record<string, string> = {
  DISPATCHED:   "bg-amber-100 text-amber-700",
  INSTALLATION: "bg-blue-100 text-blue-700",
  INSTALLED:    "bg-emerald-100 text-emerald-700",
  DELIVERED:    "bg-slate-100 text-slate-500",
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  DISPATCHED:   <Truck size={14} className="text-amber-500" />,
  INSTALLATION: <Hammer size={14} className="text-blue-500" />,
  INSTALLED:    <CheckCircle size={14} className="text-emerald-500" />,
  DELIVERED:    <Package size={14} className="text-slate-400" />,
};

type Order = {
  id: string; orderNo: string; status: string; branch: string;
  orderDate: string; siteAddress: string | null; notes: string | null;
  customer: { name: string; company: string; phone: string };
  totalAmount: number;
};

function InstallationPageInner() {
  const dr = useDateRangeQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("INSTALLATION");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState("");
  const toast = useToast();

  const { data: orders, meta: listMeta, loading, refetch } = useApi<Order[]>("/sales-orders", { limit: 200, ...dr.params });

  const filtered = (orders ?? [])
    .filter(o => INSTALL_STATUSES.includes(o.status))
    .filter(o => !statusFilter || o.status === statusFilter)
    .filter(o => !search ||
      o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    dispatched:   (orders ?? []).filter(o => o.status === "DISPATCHED").length,
    installation: (orders ?? []).filter(o => o.status === "INSTALLATION").length,
    installed:    (orders ?? []).filter(o => o.status === "INSTALLED").length,
    delivered:    (orders ?? []).filter(o => o.status === "DELIVERED").length,
  };

  async function advance(order: Order) {
    const next: Record<string, string> = {
      DISPATCHED: "INSTALLATION", INSTALLATION: "INSTALLED", INSTALLED: "DELIVERED",
    };
    const nextStatus = next[order.status];
    if (!nextStatus) return;
    setUpdatingId(order.id);
    try {
      await api.put(`/sales-orders/${order.id}`, { status: nextStatus });
      toast.success(`Moved to ${nextStatus}`);
      refetch();
      if (selected?.id === order.id) setSelected(o => o ? { ...o, status: nextStatus } : o);
    } catch { toast.error("Update failed"); }
    setUpdatingId("");
  }

  const STAGE_TABS = [
    { status: "", label: "All Field", count: Object.values(counts).reduce((a, b) => a + b, 0) },
    { status: "DISPATCHED",   label: "Dispatched",   count: counts.dispatched },
    { status: "INSTALLATION", label: "Installing",   count: counts.installation },
    { status: "INSTALLED",    label: "Installed",    count: counts.installed },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Installation Tracking" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* Stage pipeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Dispatched",   value: counts.dispatched,   color: "amber",   icon: <Truck size={18} /> },
            { label: "Installing",   value: counts.installation, color: "blue",    icon: <Hammer size={18} /> },
            { label: "Installed",    value: counts.installed,    color: "emerald", icon: <CheckCircle size={18} /> },
            { label: "Delivered",    value: counts.delivered,    color: "slate",   icon: <Package size={18} /> },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-3 items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${c.color}-50 text-${c.color}-600 flex-shrink-0`}>{c.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-2xl font-bold text-${c.color}-600`}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-40">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order / customer…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {STAGE_TABS.map(t => (
              <button key={t.status} onClick={() => setStatusFilter(t.status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === t.status ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                {t.label} <span className="ml-1 opacity-70">{t.count}</span>
              </button>
            ))}
          </div>
          <DateRangeFilter value={dr.range} onChange={dr.setRange} urlError={dr.urlError} basisLabel="Order date" />
          <ListCapNote shown={(orders ?? []).length} total={listMeta?.total} inline />
          <button onClick={refetch} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <RefreshCw size={14} className={loading ? "animate-spin text-slate-400" : "text-slate-400"} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Order list */}
          <div className="lg:col-span-2 space-y-3">
            {loading && <p className="text-center py-10 text-slate-400">Loading…</p>}
            {!loading && filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <Hammer size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-semibold">No orders in this stage</p>
              </div>
            )}
            {filtered.map(o => (
              <div key={o.id} onClick={() => setSelected(o)}
                className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer transition-all ${selected?.id === o.id ? "border-indigo-400 ring-1 ring-indigo-200" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {STATUS_ICON[o.status]}
                    <div>
                      <p className="font-bold text-slate-800">{o.customer?.name}</p>
                      <p className="text-xs text-slate-500">{o.orderNo} · {o.customer?.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{o.branch}</span>
                  </div>
                </div>
                {o.siteAddress && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                    <MapPin size={11} className="text-slate-400" />
                    {o.siteAddress}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm font-bold text-slate-700">{fmt(o.totalAmount)}</p>
                  {o.status !== "DELIVERED" && (
                    <button onClick={e => { e.stopPropagation(); advance(o); }}
                      disabled={updatingId === o.id}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        o.status === "DISPATCHED" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" :
                        o.status === "INSTALLATION" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" :
                        "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}>
                      {updatingId === o.id ? "…" :
                        o.status === "DISPATCHED" ? "→ Start Installation" :
                        o.status === "INSTALLATION" ? "→ Mark Installed" :
                        "→ Mark Delivered"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-fit space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{selected.orderNo}</h3>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={14} /></button>
              </div>
              <div className="space-y-2">
                {[
                  ["Customer",   selected.customer?.name],
                  ["Company",    selected.customer?.company ?? "—"],
                  ["Phone",      selected.customer?.phone ?? "—"],
                  ["Branch",     selected.branch],
                  ["Amount",     fmt(selected.totalAmount)],
                  ["Order Date", new Date(selected.orderDate).toLocaleDateString("en-IN")],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-xs text-slate-400">{l}</span>
                    <span className="text-xs font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>
              {selected.siteAddress && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">Site Address</p>
                  <p className="text-xs font-semibold text-slate-700 flex items-start gap-1">
                    <MapPin size={11} className="text-indigo-500 mt-0.5 flex-shrink-0" /> {selected.siteAddress}
                  </p>
                </div>
              )}
              {selected.notes && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-xs text-slate-600">{selected.notes}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Pipeline Stage</p>
                <div className="flex items-center gap-1">
                  {["DISPATCHED", "INSTALLATION", "INSTALLED", "DELIVERED"].map((s, i, arr) => (
                    <div key={s} className="flex items-center gap-1 flex-1">
                      <div className={`h-1.5 flex-1 rounded-full ${
                        ["DISPATCHED", "INSTALLATION", "INSTALLED", "DELIVERED"].indexOf(selected.status) >= i
                          ? "bg-indigo-500" : "bg-slate-200"
                      }`} />
                      {i < arr.length - 1 && null}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {["Dispatch", "Install", "Done", "Delivered"].map(s => (
                    <span key={s} className="text-xs text-slate-400">{s}</span>
                  ))}
                </div>
              </div>
              {selected.status !== "DELIVERED" && (
                <button onClick={() => advance(selected)} disabled={updatingId === selected.id}
                  className="w-full py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                  {updatingId === selected.id ? "Updating…" :
                    selected.status === "DISPATCHED" ? "Start Installation" :
                    selected.status === "INSTALLATION" ? "Mark Installed" : "Mark Delivered"}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 flex items-center justify-center p-10">
              <p className="text-slate-400 text-sm text-center">Click an order to manage installation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// useSearchParams (date range in the URL) needs a Suspense boundary.
export default function InstallationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <InstallationPageInner />
    </Suspense>
  );
}
