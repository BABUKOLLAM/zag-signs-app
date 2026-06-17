"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { customers as initialCustomers, branches, Customer } from "@/lib/data";
import { fmt } from "@/lib/utils";
import { Plus, Building2 } from "lucide-react";

const emptyForm = {
  name: "", company: "", phone: "", email: "",
  branch: branches[0], gst: "", address: "",
};

export default function CustomersPage() {
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = localCustomers.filter(
    (c) =>
      (branchFilter === "All" || c.branch === branchFilter) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()))
  );

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.company.trim()) return;
    const newCustomer: Customer = {
      id: `C${String(localCustomers.length + 1).padStart(3, "0")}`,
      name: form.name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      branch: form.branch as Customer["branch"],
      gst: form.gst.trim(),
      address: form.address.trim(),
      totalOrders: 0,
      totalValue: 0,
      outstandingAmount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLocalCustomers((prev) => [...prev, newCustomer]);
    setForm(emptyForm);
    setShowModal(false);
  };

  return (
    <div>
      <TopBar title="Customers" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: localCustomers.length },
            { label: "Total Revenue", value: `₹${(localCustomers.reduce((s, c) => s + c.totalValue, 0) / 100000).toFixed(1)}L` },
            { label: "Outstanding", value: fmt(localCustomers.reduce((s, c) => s + c.outstandingAmount, 0)) },
            { label: "Total Orders", value: localCustomers.reduce((s, c) => s + c.totalOrders, 0) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 items-center justify-between">
          <div className="flex gap-3">
            <input type="text" placeholder="Search customers..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="All">All Branches</option>
              {branches.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Add Customer
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-right px-4 py-3">Orders</th>
                <th className="text-right px-4 py-3">Total Value</th>
                <th className="text-right px-4 py-3">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-blue-600 font-medium">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div>{c.phone}</div>
                    <div>{c.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{c.branch}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800">{c.totalOrders}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(c.totalValue)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${c.outstandingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                    {c.outstandingAmount > 0 ? fmt(c.outstandingAmount) : "Nil"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No customers found</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Add New Customer</h2>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">GST Number</label>
                <input value={form.gst} onChange={set("gst")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <textarea rows={2} value={form.address} onChange={set("address")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave}
                disabled={!form.name.trim() || !form.company.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
