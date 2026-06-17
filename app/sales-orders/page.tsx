"use client";
import TopBar from "@/components/TopBar";
import { salesOrders } from "@/lib/data";
import { fmt, safeAvg } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Confirmed: "bg-blue-100 text-blue-700",
  "In Production": "bg-yellow-100 text-yellow-700",
  Ready: "bg-indigo-100 text-indigo-700",
  Installed: "bg-purple-100 text-purple-700",
  Invoiced: "bg-green-100 text-green-700",
  Collected: "bg-emerald-100 text-emerald-700",
};

export default function SalesOrdersPage() {
  const avgMargin = safeAvg(salesOrders.map((o) => o.margin));

  return (
    <div>
      <TopBar title="Sales Orders" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: salesOrders.length },
            { label: "In Production", value: salesOrders.filter((o) => o.status === "In Production").length },
            { label: "Revenue", value: fmt(salesOrders.reduce((s, o) => s + o.total, 0)) },
            { label: "Avg Gross Margin", value: `${avgMargin.toFixed(1)}%` },
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
                <th className="text-left px-4 py-3">Order No</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-right px-4 py-3">Order Value</th>
                <th className="text-right px-4 py-3">Job Cost</th>
                <th className="text-right px-4 py-3">Gross Margin</th>
                <th className="text-left px-4 py-3">Delivery Date</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {salesOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-blue-600 font-medium">{o.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{o.customerName}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-xs px-2 py-0.5 rounded text-gray-700">{o.branch}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{fmt(o.total)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(o.jobCost)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${o.margin > 25 ? "text-green-600" : "text-orange-600"}`}>
                    {o.margin.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.deliveryDate}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status] || "bg-gray-100 text-gray-700"}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
