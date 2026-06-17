"use client";
import TopBar from "@/components/TopBar";
import { fmt, safeAvg } from "@/lib/utils";

const collections = [
  { customer: "Malabar Gold", branch: "EKM", outstanding: 125000, overdueDays: 12, lastPayment: "2026-05-20", assignedTo: "Vijay CRE", risk: "Medium" },
  { customer: "Rasheed Motors", branch: "CLT", outstanding: 85000, overdueDays: 28, lastPayment: "2026-04-15", assignedTo: "Salman CRE", risk: "High" },
  { customer: "Baby Memorial Hospital", branch: "KTYM", outstanding: 48000, overdueDays: 5, lastPayment: "2026-06-01", assignedTo: "Renu CRE", risk: "Low" },
];

const riskColors: Record<string, string> = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-700",
};

export default function CollectionsPage() {
  const total = collections.reduce((s,c)=>s+c.outstanding,0);
  return (
    <div>
      <TopBar title="Collections" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Outstanding", value: fmt(total) },
            { label: "High Risk", value: collections.filter(c=>c.risk==="High").length },
            { label: "Avg Overdue Days", value: `${Math.round(safeAvg(collections.map(c => c.overdueDays)))}d` },
            { label: "Accounts", value: collections.length },
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
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-right px-4 py-3">Outstanding</th>
                <th className="text-right px-4 py-3">Overdue Days</th>
                <th className="text-left px-4 py-3">Last Payment</th>
                <th className="text-left px-4 py-3">Assigned To</th>
                <th className="text-left px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {collections.map(c => (
                <tr key={c.customer} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.customer}</td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-xs px-2 py-0.5 rounded text-gray-700">{c.branch}</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">{fmt(c.outstanding)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${c.overdueDays>20?"text-red-600":c.overdueDays>10?"text-orange-500":"text-gray-700"}`}>{c.overdueDays}d</td>
                  <td className="px-4 py-3 text-gray-600">{c.lastPayment}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.assignedTo}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${riskColors[c.risk]}`}>{c.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
