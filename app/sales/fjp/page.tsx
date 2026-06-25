"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api-client";
import { Plus, Trash2, Printer, Send, Loader2, ChevronDown } from "lucide-react";

const MODES = ["Two Wheeler", "Four Wheeler", "Bus", "Train", "Flight", "Auto"];

function newRoute() {
  return { dayDate: "", fromPlace: "", toPlace: "", purpose: "", customerOrProspect: "", estimatedKm: "", modeOfTravel: "Two Wheeler" };
}

export default function FJPPage() {
  const [fjps, setFjps] = useState<any[]>([]);
  const [window_, setWindow_] = useState<any>(null);
  const [routes, setRoutes] = useState([newRoute()]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchFJPs(); }, []);

  const fetchFJPs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/sales/fjp");
      if ((res as any)?.data) {
        setFjps((res as any).data.fjps);
        setWindow_((res as any).data.window);
      }
    } finally {
      setLoading(false);
    }
  };

  const addRoute = () => setRoutes([...routes, newRoute()]);
  const removeRoute = (i: number) => setRoutes(routes.filter((_, idx) => idx !== i));
  const updateRoute = (i: number, field: string, val: string) => {
    const updated = [...routes];
    updated[i] = { ...updated[i], [field]: val };
    setRoutes(updated);
  };

  const totalKm = routes.reduce((s, r) => s + (parseFloat(r.estimatedKm) || 0), 0);

  const handleSubmit = async () => {
    if (routes.some(r => !r.dayDate || !r.fromPlace || !r.toPlace || !r.purpose)) {
      alert("Please fill all required fields in each route row.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/sales/fjp", { routes, notes, status: "SUBMITTED" });
      alert("FJP submitted successfully!");
      setRoutes([newRoute()]);
      setNotes("");
      fetchFJPs();
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      await api.post("/api/sales/fjp", { routes, notes, status: "DRAFT" });
      alert("Draft saved.");
      fetchFJPs();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (fjp: any) => {
    setSelected(fjp);
    setTimeout(() => window.print(), 300);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-700",
      SUBMITTED: "bg-blue-100 text-blue-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return map[s] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 space-y-6 print:p-0">
      {/* ── Print View ── */}
      {selected && (
        <div ref={printRef} className="hidden print:block bg-white p-8 text-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">ZAG SIGNS</h1>
              <p className="text-gray-500">Fixed Journey Plan</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{selected.fjpNo}</p>
              <p>Month: {selected.forMonth}</p>
              <p>Date: {new Date(selected.submittedDate).toLocaleDateString("en-IN")}</p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Sales Executive:</span> {selected.user?.name}
            </div>
            <div>
              <span className="font-semibold">Branch:</span> {selected.user?.branch}
            </div>
            <div>
              <span className="font-semibold">Total Days:</span> {selected.totalDays}
            </div>
            <div>
              <span className="font-semibold">Total Est. KM:</span> {selected.totalKm?.toFixed(1)} km
            </div>
          </div>

          <table className="w-full border border-collapse text-xs mb-4">
            <thead className="bg-gray-100">
              <tr>
                {["Date", "From", "To", "Customer/Prospect", "Purpose", "Mode", "Est. KM"].map(h => (
                  <th key={h} className="border px-2 py-1 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selected.routes?.map((r: any, i: number) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border px-2 py-1">{new Date(r.dayDate).toLocaleDateString("en-IN")}</td>
                  <td className="border px-2 py-1">{r.fromPlace}</td>
                  <td className="border px-2 py-1">{r.toPlace}</td>
                  <td className="border px-2 py-1">{r.customerOrProspect || "-"}</td>
                  <td className="border px-2 py-1">{r.purpose}</td>
                  <td className="border px-2 py-1">{r.modeOfTravel}</td>
                  <td className="border px-2 py-1 text-right">{r.estimatedKm}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-100">
                <td colSpan={6} className="border px-2 py-1 text-right">Total KM:</td>
                <td className="border px-2 py-1 text-right">{selected.totalKm?.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>

          {selected.notes && <p className="mb-4"><strong>Notes:</strong> {selected.notes}</p>}

          <div className="mt-12 grid grid-cols-3 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-gray-400 pt-2">Sales Executive Signature</div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-2">HOD Signature & Date</div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-2">Approved By</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Screen View ── */}
      <div className="print:hidden space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fixed Journey Plan (FJP)</h1>
            <p className="text-sm text-gray-500 mt-1">Submit your monthly travel plan by 27th of the previous month</p>
          </div>
          {window_ && (
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${window_.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {window_.isOpen
                ? `🟢 Window open — ${window_.daysLeft} days left (for ${window_.forMonth})`
                : `🔴 Window closed — Next: ${window_.forMonth}`}
            </div>
          )}
        </div>

        {/* New FJP Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">New Journey Plan</h2>
            <button onClick={addRoute} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-600 uppercase">
                  <th className="px-2 py-2 text-left">Date *</th>
                  <th className="px-2 py-2 text-left">From *</th>
                  <th className="px-2 py-2 text-left">To *</th>
                  <th className="px-2 py-2 text-left">Customer / Prospect</th>
                  <th className="px-2 py-2 text-left">Purpose *</th>
                  <th className="px-2 py-2 text-left">Mode</th>
                  <th className="px-2 py-2 text-right">Est. KM</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {routes.map((r, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">
                      <input type="date" value={r.dayDate} onChange={e => updateRoute(i, "dayDate", e.target.value)}
                        className="border rounded px-2 py-1 w-full text-xs" />
                    </td>
                    <td className="px-2 py-1">
                      <input value={r.fromPlace} onChange={e => updateRoute(i, "fromPlace", e.target.value)}
                        placeholder="From" className="border rounded px-2 py-1 w-full text-xs" />
                    </td>
                    <td className="px-2 py-1">
                      <input value={r.toPlace} onChange={e => updateRoute(i, "toPlace", e.target.value)}
                        placeholder="To" className="border rounded px-2 py-1 w-full text-xs" />
                    </td>
                    <td className="px-2 py-1">
                      <input value={r.customerOrProspect} onChange={e => updateRoute(i, "customerOrProspect", e.target.value)}
                        placeholder="Name" className="border rounded px-2 py-1 w-full text-xs" />
                    </td>
                    <td className="px-2 py-1">
                      <input value={r.purpose} onChange={e => updateRoute(i, "purpose", e.target.value)}
                        placeholder="Purpose" className="border rounded px-2 py-1 w-full text-xs" />
                    </td>
                    <td className="px-2 py-1">
                      <select value={r.modeOfTravel} onChange={e => updateRoute(i, "modeOfTravel", e.target.value)}
                        className="border rounded px-2 py-1 w-full text-xs">
                        {MODES.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <input type="number" value={r.estimatedKm} onChange={e => updateRoute(i, "estimatedKm", e.target.value)}
                        placeholder="0" className="border rounded px-2 py-1 w-16 text-xs text-right" />
                    </td>
                    <td className="px-2 py-1">
                      {routes.length > 1 && (
                        <button onClick={() => removeRoute(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold text-sm">
                  <td colSpan={6} className="px-2 py-2 text-right">Total Est. KM:</td>
                  <td className="px-2 py-2 text-right">{totalKm.toFixed(1)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4">
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Additional notes (optional)"
              className="w-full border rounded px-3 py-2 text-sm h-16 resize-none" />
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleSaveDraft} disabled={submitting}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
              Save Draft
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit FJP
            </button>
          </div>
        </div>

        {/* Past FJPs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">My FJP History</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
          ) : fjps.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No FJPs submitted yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">FJP No</th>
                  <th className="px-4 py-3 text-left">For Month</th>
                  <th className="px-4 py-3 text-left">Days</th>
                  <th className="px-4 py-3 text-right">Est. KM</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {fjps.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-700">{f.fjpNo}</td>
                    <td className="px-4 py-3">{f.forMonth}</td>
                    <td className="px-4 py-3">{f.totalDays}</td>
                    <td className="px-4 py-3 text-right">{f.totalKm?.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(f.submittedDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handlePrint(f)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800">
                        <Printer className="w-4 h-4" /> Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
