"use client";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PRODUCTION: "bg-yellow-100 text-yellow-700",
  READY: "bg-indigo-100 text-indigo-700",
  INSTALLED: "bg-purple-100 text-purple-700",
  INVOICED: "bg-green-100 text-green-700",
  COLLECTED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

interface SalesOrder {
  id: string; orderNo: string; status: string; statusLabel: string;
  totalAmount: number; paidAmount: number;
  orderDate: string; deliveryDate: string; notes: string; createdAt: string;
  customerId: string; customerName: string; quotationNo: string;
}

export default function SalesOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data, loading, error, refetch } = useApi<SalesOrder[]>("/sales-orders", {
    status: statusFilter || undefined,
    limit: 100,
  });

  const orders = data ?? [];
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const inProduction = orders.filter((o) => o.status === "IN_PRODUCTION").length;
  const totalOutstanding = orders.reduce((s, o) => s + Math.max(0, o.totalAmount - o.paidAmount), 0);

  return (
    <div>
      <TopBar title="Sales Orders" />
      <div className="p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: orders.length },
            { label: "In Production", value: inProduction },
            { label: "Revenue", value: fmt(totalRevenue) },
            { label: "Outstanding", value: fmt(totalOutstanding) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 items-center">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="READY">Ready</option>
            <option value="INSTALLED">Installed</option>
            <option value="INVOICED">Invoiced</option>
            <option value="COLLECTED">Collected</option>
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
          ) : orders.length === 0 ? (
            <EmptyState label="No sales orders found" hint="Sales orders will appear here once created." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Order No</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Quotation</th>
                    <th className="text-right px-4 py-3">Order Value</th>
                    <th className="text-right px-4 py-3 hidden lg:table-cell">Paid</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Delivery Date</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((o) => {
                    const outstanding = Math.max(0, o.totalAmount - o.paidAmount);
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 text-sm">
                        <td className="px-4 py-3 text-indigo-600 font-medium">{o.orderNo}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{o.customerName || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{o.quotationNo || "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold">{fmt(o.totalAmount)}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="text-right">
                            <span className="font-medium text-green-600">{fmt(o.paidAmount)}</span>
                            {outstanding > 0 && <span className="block text-xs text-red-500">{fmt(outstanding)} due</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{o.deliveryDate || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-700"}`}>
                            {o.statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
