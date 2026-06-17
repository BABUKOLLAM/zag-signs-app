"use client";
import TopBar from "@/components/TopBar";
import { Package } from "lucide-react";

export default function ProductionPage() {
  const mockJobs = [
    { id: "WO-001", order: "SO2026-001", customer: "Malabar Gold", type: "ACP Cladding", branch: "EKM", status: "Printing", due: "2026-06-22" },
    { id: "WO-002", order: "SO2026-002", customer: "KSRTC", type: "LED Hoarding", branch: "TVM", status: "Fabrication", due: "2026-06-18" },
    { id: "WO-003", order: "SO2026-003", customer: "Vineeth Supermarket", type: "Vinyl Signage", branch: "TVM", status: "QC Check", due: "2026-06-20" },
  ];
  const statusColors: Record<string, string> = {
    Printing: "bg-blue-100 text-blue-700",
    Fabrication: "bg-yellow-100 text-yellow-700",
    "QC Check": "bg-orange-100 text-orange-700",
    "Ready for Dispatch": "bg-green-100 text-green-700",
  };
  return (
    <div>
      <TopBar title="Production" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Jobs", value: mockJobs.length },
            { label: "Printing", value: mockJobs.filter(j => j.status === "Printing").length },
            { label: "Fabrication", value: mockJobs.filter(j => j.status === "Fabrication").length },
            { label: "Ready Today", value: 0 },
          ].map(s => (
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
                <th className="text-left px-4 py-3">Work Order</th>
                <th className="text-left px-4 py-3">Sales Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Job Type</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockJobs.map(j => (
                <tr key={j.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-blue-600 font-medium">{j.id}</td>
                  <td className="px-4 py-3 text-gray-600">{j.order}</td>
                  <td className="px-4 py-3 font-medium">{j.customer}</td>
                  <td className="px-4 py-3 text-gray-600">{j.type}</td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-xs px-2 py-0.5 rounded text-gray-700">{j.branch}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[j.status] || "bg-gray-100 text-gray-700"}`}>{j.status}</span></td>
                  <td className="px-4 py-3 text-gray-600">{j.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          Full Production module with material consumption tracking, machine scheduling, and quality control coming in Phase 2.
        </div>
      </div>
    </div>
  );
}
