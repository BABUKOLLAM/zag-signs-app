"use client";
import TopBar from "@/components/TopBar";
import { complaints } from "@/lib/data";

const priorityColors: Record<string, string> = {
  Low: "bg-gray-100 text-gray-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  Open: "bg-red-100 text-red-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-700",
};

export default function ComplaintsPage() {
  return (
    <div>
      <TopBar title="Complaints & Service" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Complaints", value: complaints.length },
            { label: "Open", value: complaints.filter((c) => c.status === "Open").length },
            { label: "In Progress", value: complaints.filter((c) => c.status === "In Progress").length },
            { label: "Resolved", value: complaints.filter((c) => c.status === "Resolved").length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Assigned To</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-blue-600 font-medium">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.customerName}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-xs px-2 py-0.5 rounded text-gray-700">{c.branch}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.type}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{c.description}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[c.priority]}`}>{c.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.assignedTo}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
