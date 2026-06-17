"use client";
import TopBar from "@/components/TopBar";

const stock = [
  { material: "Flex (Frontlit)", unit: "Sqft", inStock: 12500, reorder: 5000, status: "OK" },
  { material: "Vinyl (Premium)", unit: "Sqft", inStock: 3200, reorder: 4000, status: "Low" },
  { material: "ACP Sheet 4x8ft", unit: "Sheets", inStock: 85, reorder: 50, status: "OK" },
  { material: "LED Strip Module", unit: "Nos", inStock: 420, reorder: 200, status: "OK" },
  { material: "MS Angle 40x40", unit: "Kg", inStock: 380, reorder: 500, status: "Low" },
  { material: "Solvent Ink (Black)", unit: "Litre", inStock: 12, reorder: 20, status: "Critical" },
  { material: "Solvent Ink (Cyan)", unit: "Litre", inStock: 8, reorder: 20, status: "Critical" },
  { material: "Acrylic Sheet 4x8", unit: "Sheets", inStock: 60, reorder: 30, status: "OK" },
];

const statusColors: Record<string, string> = {
  OK: "bg-green-100 text-green-700",
  Low: "bg-yellow-100 text-yellow-700",
  Critical: "bg-red-100 text-red-700",
};

export default function InventoryPage() {
  return (
    <div>
      <TopBar title="Inventory" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Materials", value: stock.length },
            { label: "OK Levels", value: stock.filter(s => s.status === "OK").length },
            { label: "Low Stock", value: stock.filter(s => s.status === "Low").length },
            { label: "Critical", value: stock.filter(s => s.status === "Critical").length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">Stock Levels</h3>
            <span className="text-xs text-gray-400">As of {new Date().toLocaleDateString("en-IN")}</span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-3">Material</th>
                <th className="text-left px-4 py-3">Unit</th>
                <th className="text-right px-4 py-3">In Stock</th>
                <th className="text-right px-4 py-3">Reorder Level</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stock.map(s => (
                <tr key={s.material} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.material}</td>
                  <td className="px-4 py-3 text-gray-500">{s.unit}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${s.inStock < s.reorder ? "text-red-600" : "text-gray-800"}`}>{s.inStock.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{s.reorder.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[s.status]}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          Full Inventory module with GRN, Purchase Orders, Vendor Management, and Consumption Tracking coming in Phase 2.
        </div>
      </div>
    </div>
  );
}
