"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { fmt } from "@/lib/utils";
import { Plus, RefreshCw, X, Truck, Fuel, Wrench, MapPin } from "lucide-react";
import { useToast } from "@/components/Toaster";

const BRANCHES = ["HO", "TVM", "KTYM", "EKM", "CLT"];

type Vehicle = { id: string; vehicleNo: string; make: string; model: string; type: string; branch: string; status: string; insuranceExpiry: string | null; pucExpiry: string | null; nextService: string | null };
type Trip = { id: string; tripNo: string; vehicle: { vehicleNo: string }; driver: { name: string }; startKm: number; endKm: number | null; startTime: string; purpose: string; fromPlace: string; toPlace: string };
type FuelLog = { id: string; vehicle: { vehicleNo: string }; date: string; litres: number; totalCost: number; odometer: number; fuelStation: string };

const VEH_EMPTY = { vehicleNo: "", make: "", model: "", type: "Van", branch: "TVM", status: "ACTIVE", insuranceExpiry: "", pucExpiry: "", nextService: "" };
const TRIP_EMPTY = { vehicleId: "", purpose: "", fromPlace: "", toPlace: "", startKm: 0, endKm: "", startTime: new Date().toISOString().slice(0, 16) };
const FUEL_EMPTY = { vehicleId: "", date: new Date().toISOString().slice(0, 10), litres: 0, costPerLitre: 0, odometer: 0, fuelStation: "" };

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-500",
  MAINTENANCE: "bg-amber-100 text-amber-700",
};

export default function FleetPage() {
  const [tab, setTab] = useState<"vehicles" | "trips" | "fuel">("vehicles");
  const toast = useToast();

  const { data: vehicles, loading: vLoading, refetch: refetchV } = useApi<Vehicle[]>("/fleet/vehicles");
  const { data: trips, loading: tLoading, refetch: refetchT } = useApi<Trip[]>("/fleet/trips");
  const { data: fuelLogs, loading: fLoading, refetch: refetchF } = useApi<FuelLog[]>("/fleet/fuel");

  const [showVehForm, setShowVehForm] = useState(false);
  const [vehForm, setVehForm] = useState<any>(VEH_EMPTY);
  const [savingVeh, setSavingVeh] = useState(false);

  const [showTripForm, setShowTripForm] = useState(false);
  const [tripForm, setTripForm] = useState<any>(TRIP_EMPTY);
  const [savingTrip, setSavingTrip] = useState(false);

  const [showFuelForm, setShowFuelForm] = useState(false);
  const [fuelForm, setFuelForm] = useState<any>(FUEL_EMPTY);
  const [savingFuel, setSavingFuel] = useState(false);

  async function saveVehicle() {
    if (!vehForm.vehicleNo) return toast.error("Vehicle number required");
    setSavingVeh(true);
    try {
      await api.post("/fleet/vehicles", vehForm);
      toast.success("Vehicle added");
      setShowVehForm(false); refetchV();
    } catch { toast.error("Save failed"); }
    setSavingVeh(false);
  }

  async function saveTrip() {
    if (!tripForm.vehicleId || !tripForm.fromPlace || !tripForm.toPlace) return toast.error("Vehicle, from and to are required");
    setSavingTrip(true);
    try {
      await api.post("/fleet/trips", tripForm);
      toast.success("Trip logged");
      setShowTripForm(false); setTripForm(TRIP_EMPTY); refetchT();
    } catch { toast.error("Save failed"); }
    setSavingTrip(false);
  }

  async function saveFuel() {
    if (!fuelForm.vehicleId || !fuelForm.litres) return toast.error("Vehicle and litres required");
    setSavingFuel(true);
    try {
      await api.post("/fleet/fuel", fuelForm);
      toast.success("Fuel log saved");
      setShowFuelForm(false); setFuelForm(FUEL_EMPTY); refetchF();
    } catch { toast.error("Save failed"); }
    setSavingFuel(false);
  }

  const totalKm = (trips ?? []).reduce((s, t) => s + (t.endKm != null ? t.endKm - t.startKm : 0), 0);
  const totalFuelCost = (fuelLogs ?? []).reduce((s, f) => s + f.totalCost, 0);

  const TABS = [
    { key: "vehicles", label: "Vehicles", icon: <Truck size={14} /> },
    { key: "trips", label: "Trips", icon: <MapPin size={14} /> },
    { key: "fuel", label: "Fuel Logs", icon: <Fuel size={14} /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Fleet Management" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Vehicles", value: (vehicles ?? []).length, color: "indigo", icon: <Truck size={16} /> },
            { label: "Active", value: (vehicles ?? []).filter(v => v.status === "ACTIVE").length, color: "emerald", icon: <Truck size={16} /> },
            { label: "Total KM (trips)", value: `${totalKm.toFixed(0)} km`, color: "blue", icon: <MapPin size={16} /> },
            { label: "Fuel Spend", value: fmt(totalFuelCost), color: "amber", icon: <Fuel size={16} /> },
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

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-slate-200 p-1 w-fit shadow-sm">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ──── VEHICLES ──── */}
        {tab === "vehicles" && (
          <>
            <div className="flex justify-end gap-3">
              <button onClick={refetchV} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"><RefreshCw size={14} className={vLoading ? "animate-spin text-slate-400" : "text-slate-400"} /></button>
              <button onClick={() => { setVehForm(VEH_EMPTY); setShowVehForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> Add Vehicle
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vLoading && <p className="text-slate-400 text-sm col-span-3 text-center py-10">Loading…</p>}
              {(vehicles ?? []).map(v => (
                <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-slate-800">{v.vehicleNo}</p>
                      <p className="text-xs text-slate-500">{v.make} {v.model} · {v.type}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[v.status] ?? "bg-slate-100 text-slate-500"}`}>{v.status}</span>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{v.branch}</span>
                    {v.insuranceExpiry && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Ins: {new Date(v.insuranceExpiry).toLocaleDateString("en-IN")}</span>}
                    {v.pucExpiry && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">PUC: {new Date(v.pucExpiry).toLocaleDateString("en-IN")}</span>}
                  </div>
                </div>
              ))}
              {!vLoading && (vehicles ?? []).length === 0 && (
                <div className="col-span-3 text-center py-10 text-slate-400">No vehicles added yet</div>
              )}
            </div>
          </>
        )}

        {/* ──── TRIPS ──── */}
        {tab === "trips" && (
          <>
            <div className="flex justify-end gap-3">
              <button onClick={refetchT} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"><RefreshCw size={14} className={tLoading ? "animate-spin text-slate-400" : "text-slate-400"} /></button>
              <button onClick={() => { setTripForm(TRIP_EMPTY); setShowTripForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> Log Trip
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Trip No", "Vehicle", "Driver", "From → To", "Start KM", "End KM", "Distance", "Purpose"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {tLoading && <tr><td colSpan={8} className="text-center py-10 text-slate-400">Loading…</td></tr>}
                  {!tLoading && (trips ?? []).length === 0 && <tr><td colSpan={8} className="text-center py-10 text-slate-400">No trips logged yet</td></tr>}
                  {(trips ?? []).map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600">{t.tripNo}</td>
                      <td className="px-4 py-3 text-xs font-semibold">{t.vehicle?.vehicleNo}</td>
                      <td className="px-4 py-3 text-xs">{t.driver?.name}</td>
                      <td className="px-4 py-3 text-xs">{t.fromPlace} → {t.toPlace}</td>
                      <td className="px-4 py-3 text-xs">{t.startKm}</td>
                      <td className="px-4 py-3 text-xs">{t.endKm ?? "—"}</td>
                      <td className="px-4 py-3 text-xs font-semibold">{t.endKm != null ? `${(t.endKm - t.startKm).toFixed(0)} km` : "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{t.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ──── FUEL ──── */}
        {tab === "fuel" && (
          <>
            <div className="flex justify-end gap-3">
              <button onClick={refetchF} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"><RefreshCw size={14} className={fLoading ? "animate-spin text-slate-400" : "text-slate-400"} /></button>
              <button onClick={() => { setFuelForm(FUEL_EMPTY); setShowFuelForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> Log Fuel
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Vehicle", "Date", "Litres", "Rate/L", "Total", "Odometer", "Station"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {fLoading && <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading…</td></tr>}
                  {!fLoading && (fuelLogs ?? []).length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No fuel logs yet</td></tr>}
                  {(fuelLogs ?? []).map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-xs font-semibold">{f.vehicle?.vehicleNo}</td>
                      <td className="px-4 py-3 text-xs">{new Date(f.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-xs">{f.litres} L</td>
                      <td className="px-4 py-3 text-xs">₹{(f.totalCost / f.litres).toFixed(1)}</td>
                      <td className="px-4 py-3 text-xs font-semibold">{fmt(f.totalCost)}</td>
                      <td className="px-4 py-3 text-xs">{f.odometer} km</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{f.fuelStation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Vehicle Modal */}
      {showVehForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Vehicle</h3>
              <button onClick={() => setShowVehForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[["Vehicle No *", "vehicleNo"], ["Make", "make"], ["Model", "model"]].map(([l, k]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                  <input value={vehForm[k]} onChange={e => setVehForm((f: any) => ({ ...f, [k]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select value={vehForm.type} onChange={e => setVehForm((f: any) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {["Van", "Truck", "Car", "Bike", "Auto", "Other"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                  <select value={vehForm.branch} onChange={e => setVehForm((f: any) => ({ ...f, branch: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              {[["Insurance Expiry", "insuranceExpiry"], ["PUC Expiry", "pucExpiry"], ["Next Service Due", "nextService"]].map(([l, k]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                  <input type="date" value={vehForm[k]} onChange={e => setVehForm((f: any) => ({ ...f, [k]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveVehicle} disabled={savingVeh}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {savingVeh ? "Saving…" : "Add Vehicle"}
              </button>
              <button onClick={() => setShowVehForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Modal */}
      {showTripForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Log Trip</h3>
              <button onClick={() => setShowTripForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle *</label>
                <select value={tripForm.vehicleId} onChange={e => setTripForm((f: any) => ({ ...f, vehicleId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">— Select —</option>
                  {(vehicles ?? []).map(v => <option key={v.id} value={v.id}>{v.vehicleNo}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">From *</label>
                  <input value={tripForm.fromPlace} onChange={e => setTripForm((f: any) => ({ ...f, fromPlace: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">To *</label>
                  <input value={tripForm.toPlace} onChange={e => setTripForm((f: any) => ({ ...f, toPlace: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start KM</label>
                  <input type="number" value={tripForm.startKm} onChange={e => setTripForm((f: any) => ({ ...f, startKm: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End KM</label>
                  <input type="number" value={tripForm.endKm} onChange={e => setTripForm((f: any) => ({ ...f, endKm: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="Fill on return" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Purpose</label>
                <input value={tripForm.purpose} onChange={e => setTripForm((f: any) => ({ ...f, purpose: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="Site visit, delivery, etc." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
                <input type="datetime-local" value={tripForm.startTime} onChange={e => setTripForm((f: any) => ({ ...f, startTime: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveTrip} disabled={savingTrip}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {savingTrip ? "Saving…" : "Log Trip"}
              </button>
              <button onClick={() => setShowTripForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Modal */}
      {showFuelForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Log Fuel</h3>
              <button onClick={() => setShowFuelForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle *</label>
                <select value={fuelForm.vehicleId} onChange={e => setFuelForm((f: any) => ({ ...f, vehicleId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">— Select —</option>
                  {(vehicles ?? []).map(v => <option key={v.id} value={v.id}>{v.vehicleNo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                <input type="date" value={fuelForm.date} onChange={e => setFuelForm((f: any) => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Litres *</label>
                  <input type="number" value={fuelForm.litres} onChange={e => setFuelForm((f: any) => ({ ...f, litres: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cost/Litre (₹)</label>
                  <input type="number" value={fuelForm.costPerLitre} onChange={e => setFuelForm((f: any) => ({ ...f, costPerLitre: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Odometer (km)</label>
                <input type="number" value={fuelForm.odometer} onChange={e => setFuelForm((f: any) => ({ ...f, odometer: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fuel Station</label>
                <input value={fuelForm.fuelStation} onChange={e => setFuelForm((f: any) => ({ ...f, fuelStation: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveFuel} disabled={savingFuel}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {savingFuel ? "Saving…" : "Save Log"}
              </button>
              <button onClick={() => setShowFuelForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
