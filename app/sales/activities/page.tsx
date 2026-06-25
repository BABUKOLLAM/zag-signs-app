"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/use-api";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    type: "CALL",
    customerId: "",
    leadId: "",
    startTime: "",
    endTime: "",
    purpose: "",
    outcome: "",
    nextActionRequired: false,
    nextActionDate: "",
    reminderType: "CALL",
    notes: "",
  });

  const api = useApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const [actRes, custRes, leadsRes] = await Promise.all([
        api.get(`/api/sales/activities?date=${today}`),
        api.get("/api/customers"),
        api.get("/api/leads"),
      ]);

      if (actRes.data) setActivities(actRes.data);
      if (custRes.data) setCustomers(custRes.data);
      if (leadsRes.data) setLeads(leadsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.startTime || !formData.type) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/sales/activities", {
        ...formData,
        customerId: formData.customerId || null,
        leadId: formData.leadId || null,
      });

      setFormData({
        type: "CALL",
        customerId: "",
        leadId: "",
        startTime: "",
        endTime: "",
        purpose: "",
        outcome: "",
        nextActionRequired: false,
        nextActionDate: "",
        reminderType: "CALL",
        notes: "",
      });
      setShowForm(false);
      await fetchData();
    } catch (error) {
      console.error("Error logging activity:", error);
      alert("Failed to log activity");
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
      return minutes > 0 ? minutes : 0;
    }
    return 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Tracker</h1>
          <p className="text-gray-600 mt-1">Log calls, visits, and follow-ups</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Quick Log
        </button>
      </div>

      {/* Quick Log Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold mb-4">Log Activity</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="CALL">Call</option>
                  <option value="VISIT">Visit</option>
                  <option value="EMAIL">Email</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Customer/Lead</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value, leadId: "" })}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Or Lead</label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value, customerId: "" })}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="">Select Lead</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
                {calculateDuration() > 0 && (
                  <p className="text-xs text-gray-600 mt-1">Duration: {calculateDuration()} min</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Purpose</label>
                <input
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Follow-up, Demo, Proposal"
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Outcome</label>
                <input
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  placeholder="e.g., Order placed, Meeting scheduled"
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes"
                className="w-full border rounded px-3 py-2 mt-1 h-20"
              />
            </div>

            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded">
              <input
                type="checkbox"
                checked={formData.nextActionRequired}
                onChange={(e) => setFormData({ ...formData, nextActionRequired: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm">Schedule follow-up reminder</label>
              {formData.nextActionRequired && (
                <input
                  type="date"
                  value={formData.nextActionDate}
                  onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                  className="border rounded px-2 py-1 text-sm"
                />
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> : ""}Save Activity
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Activities Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold">Today's Activities ({activities.length})</h2>
        </div>
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : activities.length > 0 ? (
            activities.map((a) => (
              <div key={a.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{a.customer?.name || a.lead?.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(a.startTime).toLocaleTimeString()} {a.duration ? `· ${a.duration} min` : ""}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    a.type === "CALL" ? "bg-blue-100 text-blue-700" :
                    a.type === "VISIT" ? "bg-green-100 text-green-700" :
                    a.type === "EMAIL" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {a.type}
                  </span>
                </div>

                {a.purpose && <p className="text-sm text-gray-700"><strong>Purpose:</strong> {a.purpose}</p>}
                {a.outcome && <p className="text-sm text-gray-700"><strong>Outcome:</strong> {a.outcome}</p>}
                {a.notes && <p className="text-sm text-gray-600 mt-2"><strong>Notes:</strong> {a.notes}</p>}

                {a.reminders && a.reminders.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2">
                    ✓ Follow-up reminder set for {new Date(a.reminders[0].reminderDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No activities logged today. Click "Quick Log" to add one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
