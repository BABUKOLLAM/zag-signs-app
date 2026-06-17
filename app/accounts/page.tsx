"use client";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";

const invoices = [
  { id: "INV2026-001", order: "SO2026-003", customer: "Vineeth Supermarket", branch: "TVM", amount: 94000, paid: 94000, balance: 0, date: "2026-06-12", due: "2026-07-12", status: "Paid" },
  { id: "INV2026-002", order: "SO2026-002", customer: "KSRTC", branch: "TVM", amount: 185000, paid: 185000, balance: 0, date: "2026-06-10", due: "2026-07-10", status: "Paid" },
  { id: "INV2026-003", order: "SO2026-001", customer: "Malabar Gold", branch: "EKM", amount: 73000, paid: 0, balance: 73000, date: "2026-06-15", due: "2026-07-15", status: "Pending" },
];

const statusColors: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function AccountsPage() {
  return (
    <div>
      <TopBar title="Accounts & Billing" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Invoiced", value: fmt(invoices.reduce((s,i)=>s+i.amount,0)) },
            { label: "Collected", value: fmt(invoices.reduce((s,i)=>s+i.paid,0)) },
            { label: "Outstanding", value: fmt(invoices.reduce((s,i)=>s+i.balance,0)) },
            { label: "Pending Invoices", value: invoices.filter(i=>i.status==="Pending").length },
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
                <th className="text-left px-4 py-3">Invoice No</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-right px-4 py-3">Paid</th>
                <th className="text-right px-4 py-3">Balance</th>
                <th className="text-left px-4 py-3">Invoice Date</th>
                <th className="text-left px-4 py-3">Due Date</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-blue-600 font-medium">{inv.id}</td>
                  <td className="px-4 py-3 font-medium">{inv.customer}</td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-xs px-2 py-0.5 rounded text-gray-700">{inv.branch}</span></td>
                  <td className="px-4 py-3 text-right font-semibold">{fmt(inv.amount)}</td>
                  <td className="px-4 py-3 text-right text-green-700 font-medium">{fmt(inv.paid)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${inv.balance>0?"text-red-600":"text-gray-400"}`}>{fmt(inv.balance)}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.date}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.due}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
