"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { RefreshCw } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-200 text-red-800",
};
const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

interface Complaint {
  id: string; complaintNo: string; subject: string; description: string;
  status: string; statusLabel: string; priority: string; priorityLabel: string;
  resolution: string; resolvedAt: string; createdAt: string;
  customerId: string; customerName: string; assignedTo: string;
}

export default function ComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const { data, loading, error, refetch } = useApi<Complaint[]>("/complaints", {
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    limit: 100,
  });

  const complaints = data ?? [];

  return (
    <div>
      <TopBar title="Complaints & Service" />
      <div className="p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Complaints", value: complaints.length },
            { label: "Open", value: complaints.filter((c) => c.status === "OPEN").length },
            { label: "In Progress", value: complaints.filter((c) => c.status === "IN_PROGRESS").length },
            { label: "Resolved", value: complaints.filter((c) => c.status === "RESOLVED").length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button onClick={refetch} title="Refresh"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : complaints.length === 0 ? (
            <EmptyState label="No complaints found" hint="Adjust the filters or there are no complaints yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Complaint No</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Subject</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Description</th>
                    <th className="text-left px-4 py-3">Priority</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Assigned To</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-indigo-600 font-medium">{c.complaintNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.customerName || "—"}</td>
                      <td className="px-4 py-3 text-gray-800">{c.subject}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate hidden md:table-cell">{c.description}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[c.priority] ?? "bg-gray-100 text-gray-700"}`}>
                          {c.priorityLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {c.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{c.assignedTo}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{c.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
