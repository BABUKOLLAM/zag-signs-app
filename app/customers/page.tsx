"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { useToast } from "@/components/Toaster";
import { customerSchema, parseErrors, type FormErrors } from "@/lib/schemas";
import { exportExcel } from "@/lib/export";
import BatchImportModal from "@/components/BatchImportModal";
import { CUSTOMER_COLUMNS } from "@/lib/import-specs";
import DriveButton from "@/components/DriveButton";
import DocumentsPanel from "@/components/DocumentsPanel";
import { Plus, Building2, RefreshCw, Download, Paperclip, X, FileText, Upload } from "lucide-react";

const BRANCHES = ["TVM", "KTYM", "EKM", "CLT"];

interface Customer {
  id: string; customerNo: string; name: string; company: string;
  phone: string; email: string; branch: string; gstNo: string; address: string;
  outstandingBalance: number; creditLimit: number; isActive: boolean; createdAt: string;
  totalOrders: number; totalValue: number;
}

const emptyForm = {
  name: "", company: "", phone: "", email: "",
  branch: "TVM", gstNo: "", address: "", creditLimit: "",
};

const ic = (err?: string) =>
  `border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${err ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-indigo-500"}`;

export default function CustomersPage() {
  const toast = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [docsFor, setDocsFor] = useState<Customer | null>(null);
  const [showImport, setShowImport] = useState(false);

  const { data, loading, error, refetch } = useApi<Customer[]>("/customers", {
    branch: branchFilter || undefined,
    search: search || undefined,
    limit: 100,
  });

  const customers = data ?? [];
  const totalRevenue = customers.reduce((s, c) => s + c.totalValue, 0);
  const totalOutstanding = customers.reduce((s, c) => s + c.outstandingBalance, 0);
  const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);

  const set = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((er) => { const n = { ...er }; delete n[field]; return n; });
    };

  const handleSave = async () => {
    const result = customerSchema.safeParse(form);
    if (!result.success) { setErrors(parseErrors(result.error)); return; }
    setErrors({});
    setSaving(true);
    try {
      await api.post("/customers", { ...form, creditLimit: Number(form.creditLimit) || 0 });
      setForm(emptyForm);
      setShowModal(false);
      refetch();
      toast.success("Customer added successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => { setShowModal(false); setForm(emptyForm); setErrors({}); };

  const openQuotation = (c: Customer) => {
    const company = encodeURIComponent(c.company || c.name);
    router.push(`/quotations?fromCustomer=${c.id}&company=${company}`);
  };

  const handleExport = () => exportExcel(`Customers_${new Date().toISOString().slice(0,10)}`, customers.map((c) => ({
    "Customer No": c.customerNo,
    "Name": c.name,
    "Company": c.company,
    "Phone": c.phone,
    "Email": c.email,
    "Branch": c.branch,
    "GST No": c.gstNo,
    "Total Orders": c.totalOrders,
    "Total Value (₹)": c.totalValue,
    "Outstanding (₹)": c.outstandingBalance,
    "Credit Limit (₹)": c.creditLimit,
    "Address": c.address,
    "Active": c.isActive ? "Yes" : "No",
  })));

  return (
    <div>
      <TopBar title="Customers" />
      <div className="p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: customers.length },
            { label: "Total Revenue", value: `₹${(totalRevenue / 100000).toFixed(1)}L` },
            { label: "Outstanding", value: fmt(totalOutstanding) },
            { label: "Total Orders", value: totalOrders },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <input type="text" placeholder="Search customers…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Branches</option>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
            <button onClick={refetch} title="Refresh"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-lg">
              <Upload size={14} /> Import
            </button>
            <button onClick={handleExport} disabled={customers.length === 0}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-40">
              <Download size={14} /> Excel
            </button>
            <DriveButton filename={`Customers_${new Date().toISOString().slice(0,10)}`} rows={customers.map((c) => ({
              "Customer No": c.customerNo, "Name": c.name, "Company": c.company,
              "Phone": c.phone, "Email": c.email, "Branch": c.branch,
              "Total Orders": c.totalOrders, "Total Value (₹)": c.totalValue,
              "Outstanding (₹)": c.outstandingBalance,
            }))} />
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              <Plus size={14} /> Add Customer
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : customers.length === 0 ? (
            <EmptyState label="No customers found" hint="Add your first customer or adjust the filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Cust No</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Contact</th>
                    <th className="text-left px-4 py-3">Branch</th>
                    <th className="text-right px-4 py-3">Orders</th>
                    <th className="text-right px-4 py-3">Total Value</th>
                    <th className="text-right px-4 py-3">Outstanding</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-indigo-600 font-medium">{c.customerNo}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">
                        <div>{c.phone}</div>
                        <div>{c.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{c.branch}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800">{c.totalOrders}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(c.totalValue)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${c.outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                        {c.outstandingBalance > 0 ? fmt(c.outstandingBalance) : "Nil"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            onClick={() => openQuotation(c)}
                            title="Create Quotation"
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium whitespace-nowrap"
                          >
                            <FileText size={10} /> Quote
                          </button>
                          <button
                            onClick={() => setDocsFor(c)}
                            title="Documents"
                            className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
                          >
                            <Paperclip size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {docsFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-base font-bold text-slate-900">Documents</h2>
                <p className="text-xs text-slate-500">{docsFor.name} · {docsFor.customerNo}</p>
              </div>
              <button onClick={() => setDocsFor(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5">
              <DocumentsPanel relatedTo={docsFor.id} relatedType="CUSTOMER" />
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <h2 className="text-base font-semibold text-gray-900 px-6 pt-5 pb-4 border-b">Add New Customer</h2>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {(["name", "company", "phone", "email"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {(field === "name" || field === "company" || field === "phone") && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input value={form[field]} onChange={set(field)}
                    type={field === "email" ? "email" : "text"}
                    className={ic(errors[field])} />
                  {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Branch <span className="text-red-500">*</span></label>
                <select value={form.branch} onChange={set("branch")} className={ic()}>
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">GST Number</label>
                <input value={form.gstNo} onChange={set("gstNo")} className={ic()} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Credit Limit (₹)</label>
                <input type="number" value={form.creditLimit} onChange={set("creditLimit")} className={ic()} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <textarea rows={2} value={form.address} onChange={set("address")} className={ic()} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Saving…" : "Save Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <BatchImportModal
          title="Import Customers"
          endpoint="/customers/bulk"
          templateName="zag-customers-template"
          columns={CUSTOMER_COLUMNS}
          onClose={() => setShowImport(false)}
          onDone={() => refetch()}
        />
      )}
    </div>
  );
}
