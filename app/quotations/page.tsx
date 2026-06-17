"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { quotations } from "@/lib/data";
import { fmt } from "@/lib/utils";
import { Plus, Eye } from "lucide-react";

type Q = typeof quotations[0];

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Sent: "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function QuotationsPage() {
  const [selected, setSelected] = useState<Q | null>(null);

  return (
    <div>
      <TopBar title="Quotations" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total", value: quotations.length },
            { label: "Approved", value: quotations.filter((q) => q.status === "Approved").length },
            { label: "Pending", value: quotations.filter((q) => q.status === "Sent").length },
            { label: "Total Value", value: fmt(quotations.reduce((s, q) => s + q.total, 0)) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex justify-end">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> New Quotation
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-3">Quote No</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Valid Until</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-blue-600 font-medium">{q.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{q.customerName}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{q.branch}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{q.createdAt}</td>
                  <td className="px-4 py-3 text-gray-600">{q.validUntil}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmt(q.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[q.status]}`}>{q.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(q)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">{selected.id}</h2>
                <p className="text-sm text-gray-500">{selected.customerName} &bull; {selected.branch} &bull; By {selected.createdBy}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
            </div>
            <table className="w-full mb-5 border border-gray-100 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500">
                  <th className="text-left p-3">Description</th>
                  <th className="text-right p-3">Qty</th>
                  <th className="text-left p-3">Unit</th>
                  <th className="text-right p-3">Rate</th>
                  <th className="text-right p-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i} className="text-sm border-t border-gray-50">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-right">{item.qty}</td>
                    <td className="p-3">{item.unit}</td>
                    <td className="p-3 text-right">{fmt(item.rate)}</td>
                    <td className="p-3 text-right font-medium">{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold text-sm bg-blue-50">
                  <td colSpan={4} className="p-3 text-right text-gray-700">Grand Total</td>
                  <td className="p-3 text-right text-blue-700 text-base">{fmt(selected.total)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Close</button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send to Customer</button>
              <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Convert to Sales Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
