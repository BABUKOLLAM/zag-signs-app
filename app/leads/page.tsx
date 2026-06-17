"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { leads as initialLeads, branches, leadStatuses, Lead } from "@/lib/data";
import { fmt } from "@/lib/utils";
import { Plus, Phone, Mail, Calendar } from "lucide-react";

const statusColors: Record<string, string> = {
  New: "bg-gray-100 text-gray-700",
  Contacted: "bg-blue-100 text-blue-700",
  Qualified: "bg-indigo-100 text-indigo-700",
  Proposal: "bg-yellow-100 text-yellow-700",
  Negotiation: "bg-orange-100 text-orange-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

const emptyForm = {
  name: "", company: "", phone: "", email: "",
  branch: branches[0], source: "Reference",
  value: "", followUpDate: "", notes: "",
};

export default function LeadsPage() {
  const [localLeads, setLocalLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = localLeads.filter(
    (l) =>
      (branchFilter === "All" || l.branch === branchFilter) &&
      (statusFilter === "All" || l.status === statusFilter) &&
      (l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase()))
  );
  const totalValue = filtered.reduce((s, l) => s + l.value, 0);

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.company.trim()) return;
    const newLead: Lead = {
      id: `L${String(localLeads.length + 1).padStart(3, "0")}`,
      name: form.name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      branch: form.branch as Lead["branch"],
      status: "New",
      source: form.source,
      value: Number(form.value) || 0,
      assignedTo: "Unassigned",
      createdAt: new Date().toISOString().split("T")[0],
      followUpDate: form.followUpDate,
      notes: form.notes.trim(),
    };
    setLocalLeads((prev) => [...prev, newLead]);
    setForm(emptyForm);
    setShowModal(false);
  };

  return (
    <div>
      <TopBar title="Leads & CRM" />
      <div className="p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: filtered.length },
            { label: "Won", value: filtered.filter((l) => l.status === "Won").length },
            { label: "In Pipeline", value: filtered.filter((l) => !["Won", "Lost"].includes(l.status)).length },
            { label: "Pipeline Value", value: `₹${(totalValue / 100000).toFixed(1)}L` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text" placeholder="Search leads..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="All">All Branches</option>
              {branches.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="All">All Status</option>
              {leadStatuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Add Lead
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-3">Lead ID</th>
                <th className="text-left px-4 py-3">Name / Company</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Value</th>
                <th className="text-left px-4 py-3">Assigned To</th>
                <th className="text-left px-4 py-3">Follow Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-blue-600 font-medium">{lead.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.company}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-600"><Phone size={10} />{lead.phone}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-600"><Mail size={10} />{lead.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{lead.branch}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[lead.status]}`}>{lead.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{fmt(lead.value)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{lead.assignedTo}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-600"><Calendar size={10} />{lead.followUpDate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No leads found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Add New Lead</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["name", "company", "phone", "email"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    value={form[field]}
                    onChange={set(field)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                <select value={form.branch} onChange={set("branch")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none">
                  {branches.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lead Source</label>
                <select value={form.source} onChange={set("source")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none">
                  {["Reference", "Cold Call", "Website", "Exhibition", "WhatsApp", "Walk-in", "Tender"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Value (₹)</label>
                <input type="number" value={form.value} onChange={set("value")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Follow Up Date</label>
                <input type="date" value={form.followUpDate} onChange={set("followUpDate")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={set("notes")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave}
                disabled={!form.name.trim() || !form.company.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Save Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
