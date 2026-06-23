"use client";
import { useState, useEffect, useRef } from "react";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { useToast } from "@/components/Toaster";
import { exportExcel } from "@/lib/export";
import InvoicePrintTemplate, { type InvoiceData } from "@/components/InvoicePrintTemplate";
import { type CompanyConfig, type BankConfig } from "@/components/QuotationPrintTemplate";
import {
  Plus, FileText, Download, RefreshCw, Printer, X,
  CheckCircle, Clock, AlertCircle, FileDown, BadgeCheck,
} from "lucide-react";

interface Invoice {
  id: string; invoiceNo: string; invoiceDate: string; dueDate: string;
  subtotal: number; taxRate: number; taxAmount: number; discount: number; totalAmount: number;
  status: string; notes: string; branch: string; items: InvoiceData["items"];
  customerName: string; customerCompany: string; customerAddress: string;
  customerGst: string; customerPhone: string; salutation: string; attentionName: string;
  tallyExported: boolean; tallyExportedAt: string | null;
  quotationId: string | null; quotationNo: string;
  customerId: string | null; orderNo: string; createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", PARTIAL: "Partial", PAID: "Paid", OVERDUE: "Overdue",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700",
  PARTIAL:  "bg-purple-50 text-purple-700",
  PAID:     "bg-green-50 text-green-700",
  OVERDUE:  "bg-red-50 text-red-700",
};

export default function InvoicesPage() {
  const toast = useToast();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewInv, setViewInv]         = useState<Invoice | null>(null);
  const [printSettings, setPrintSettings] = useState<{ company: Partial<CompanyConfig>; bank: Partial<BankConfig> } | null>(null);
  const [markingId, setMarkingId]     = useState<string | null>(null);
  const [tallyId, setTallyId]         = useState<string | null>(null);
  const printZoneRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, refetch } = useApi<Invoice[]>("/invoices", {
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const invoices = data ?? [];

  // Load company/bank settings for print
  useEffect(() => {
    api.get<{ data: CompanyConfig & BankConfig }>("/settings")
      .then((r) => { if (r.data) setPrintSettings({ company: r.data, bank: r.data }); })
      .catch(() => {});
  }, []);

  const totalPending  = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid     = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.totalAmount, 0);
  const totalPartial  = invoices.filter((i) => i.status === "PARTIAL").reduce((s, i) => s + i.totalAmount, 0);

  const handlePrint = async (inv: Invoice) => {
    setViewInv(inv);
    const branch = inv.branch || "HO";

    // Fetch branch-specific bank settings
    try {
      const [companyRes, branchBankRes] = await Promise.all([
        api.get<{ data: CompanyConfig }>("/settings").catch(() => ({ data: null })),
        api.get<{ data: BankConfig }>(`/branch-settings?branch=${branch}`).catch(() => ({ data: null })),
      ]);

      const company = companyRes.data;
      const branchBank = branchBankRes.data;

      // Use branch-specific bank details if available and non-empty, else fall back to company settings
      let bankConfig = branchBank;
      if (!branchBank || (!branchBank.bankName && !branchBank.accountNo)) {
        bankConfig = company; // fallback to company-wide bank settings
      }

      if (company && bankConfig) {
        setPrintSettings({ company, bank: bankConfig });
      }
    } catch (e) {
      // Continue with existing settings if fetch fails
      console.error("Failed to fetch branch bank settings:", e);
    }

    // Print after a delay to allow state update to complete
    setTimeout(() => {
      const prev = document.title;
      document.title = inv.invoiceNo.replace(/\//g, "-");
      window.print();
      document.title = prev;
    }, 300);
  };

  const handleMarkPaid = async (inv: Invoice, status: "PAID" | "PARTIAL") => {
    setMarkingId(inv.id);
    try {
      await api.put(`/invoices/${inv.id}`, { status });
      refetch();
      toast.success(`Invoice marked as ${STATUS_LABELS[status]}`);
      if (viewInv?.id === inv.id) setViewInv((v) => v ? { ...v, status } : v);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setMarkingId(null);
    }
  };

  const handleTallyExport = async (inv: Invoice) => {
    setTallyId(inv.id);
    try {
      // Fetch as blob for download
      const res = await fetch(`/api/invoices/${inv.id}/tally-xml`, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inv.invoiceNo.replace(/\//g, "-")}.xml`;
      a.click();
      URL.revokeObjectURL(url);
      refetch();
      toast.success("Tally XML downloaded — import via Gateway of Tally → Import Data → Vouchers");
    } catch {
      toast.error("Tally export failed");
    } finally {
      setTallyId(null);
    }
  };

  const handleExcel = () => exportExcel(`Invoices_${new Date().toISOString().slice(0,10)}`,
    invoices.map((i) => ({
      "Invoice No": i.invoiceNo, "Date": i.invoiceDate, "Due Date": i.dueDate,
      "Customer": i.customerName, "Company": i.customerCompany,
      "Subtotal": i.subtotal, "Tax": i.taxAmount, "Discount": i.discount,
      "Total (₹)": i.totalAmount, "Status": i.status,
      "Quotation Ref": i.quotationNo, "Tally Exported": i.tallyExported ? "Yes" : "No",
    }))
  );

  return (
    <div>
      <TopBar title="Invoices" />

      {/* Hidden print zone */}
      <div id="zag-print-zone" ref={printZoneRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
        {viewInv && (
          <InvoicePrintTemplate
            inv={{
              invoiceNo:       viewInv.invoiceNo,
              invoiceDate:     viewInv.invoiceDate,
              dueDate:         viewInv.dueDate,
              status:          viewInv.status,
              quotationNo:     viewInv.quotationNo,
              customerName:    viewInv.customerName,
              customerCompany: viewInv.customerCompany,
              customerAddress: viewInv.customerAddress,
              customerGst:     viewInv.customerGst,
              customerPhone:   viewInv.customerPhone,
              salutation:      viewInv.salutation,
              attentionName:   viewInv.attentionName,
              branch:          viewInv.branch,
              items:           viewInv.items ?? [],
              subtotal:        viewInv.subtotal,
              taxRate:         viewInv.taxRate,
              taxAmount:       viewInv.taxAmount,
              discount:        viewInv.discount,
              totalAmount:     viewInv.totalAmount,
              notes:           viewInv.notes,
            }}
            company={printSettings?.company}
            bank={printSettings?.bank}
          />
        )}
      </div>

      <div className="p-4 md:p-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Invoices", value: invoices.length, icon: FileText, color: "text-indigo-600 bg-indigo-50" },
            { label: "Outstanding",    value: fmt(totalPending),  icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
            { label: "Partially Paid", value: fmt(totalPartial),  icon: Clock,       color: "text-purple-600 bg-purple-50" },
            { label: "Total Collected",value: fmt(totalPaid),     icon: CheckCircle, color: "text-green-600 bg-green-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon size={18} /></div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap items-center">
            <input type="text" placeholder="Search invoices…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex gap-1">
              {["", "PENDING", "PARTIAL", "PAID", "OVERDUE"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {s || "All"}
                </button>
              ))}
            </div>
            <button onClick={refetch} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExcel} disabled={invoices.length === 0}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-40">
              <Download size={14} /> Excel
            </button>
          </div>
        </div>

        {/* Tally instructions banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <BadgeCheck size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Tally Integration:</strong> Click the <strong>Tally XML</strong> button on any invoice to download an XML file.
            In Tally: <strong>Gateway of Tally → Import Data → Vouchers</strong> → select the file.
            The invoice will be imported as a Sales Voucher automatically.
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : invoices.length === 0 ? (
            <EmptyState label="No invoices found"
              hint={statusFilter ? "Try clearing the status filter." : "Invoices are created from approved quotations."} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Invoice No</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Date / Due</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Quotation</th>
                    <th className="text-right px-4 py-3">Amount</th>
                    <th className="text-center px-4 py-3">Status</th>
                    <th className="text-center px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3">
                        <div className="font-medium text-indigo-600">{inv.invoiceNo}</div>
                        {inv.tallyExported && (
                          <div className="text-xs text-green-600 flex items-center gap-0.5">
                            <BadgeCheck size={10} /> Tally synced
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{inv.customerName || "—"}</div>
                        <div className="text-xs text-gray-500">{inv.customerCompany}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">
                        <div>{inv.invoiceDate}</div>
                        {inv.dueDate && <div className="text-red-500">Due: {inv.dueDate}</div>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                        {inv.quotationNo || "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {fmt(inv.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[inv.status] ?? inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-center flex-wrap">
                          {/* Print */}
                          <button onClick={() => handlePrint(inv)} title="Print Invoice"
                            className="p-1.5 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600">
                            <Printer size={13} />
                          </button>
                          {/* Tally export */}
                          <button
                            onClick={() => handleTallyExport(inv)}
                            disabled={tallyId === inv.id}
                            title="Download Tally XML"
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                              inv.tallyExported
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            } disabled:opacity-50`}
                          >
                            <FileDown size={10} />
                            {tallyId === inv.id ? "…" : "Tally XML"}
                          </button>
                          {/* Mark Paid */}
                          {inv.status !== "PAID" && (
                            <button
                              onClick={() => handleMarkPaid(inv, "PAID")}
                              disabled={markingId === inv.id}
                              title="Mark as Paid"
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 hover:bg-green-100 font-medium whitespace-nowrap disabled:opacity-50"
                            >
                              <CheckCircle size={10} />
                              {markingId === inv.id ? "…" : "Mark Paid"}
                            </button>
                          )}
                          {inv.status === "PENDING" && (
                            <button
                              onClick={() => handleMarkPaid(inv, "PARTIAL")}
                              disabled={markingId === inv.id}
                              title="Mark as Partial"
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium whitespace-nowrap disabled:opacity-50"
                            >
                              <Clock size={10} /> Partial
                            </button>
                          )}
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
    </div>
  );
}
