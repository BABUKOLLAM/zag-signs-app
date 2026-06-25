"use client";
import { useState, useCallback, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import QuotationPrintTemplate, { type QuotationData, type CompanyConfig, type BankConfig } from "@/components/QuotationPrintTemplate";
import DriveButton from "@/components/DriveButton";
import DocumentsPanel from "@/components/DocumentsPanel";
import { Eye, Printer, RefreshCw, X, Plus, Trash2, Pencil, GitBranch, Receipt, Ticket } from "lucide-react";
import WhatsAppShare from "@/components/WhatsAppShare";import { useRouter } from "next/navigation";
import { makeClientCode } from "@/lib/utils";
import { uploadToDrive, isDriveConfigured } from "@/lib/google-drive";
import { useToast } from "@/components/Toaster";

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     "bg-gray-100 text-gray-700",
  SENT:      "bg-blue-100 text-blue-700",
  EMAIL:     "bg-purple-100 text-purple-700",
  WHATSAPP:  "bg-green-100 text-green-700",
  SUBMITTED: "bg-amber-100 text-amber-700",
  APPROVED:  "bg-emerald-100 text-emerald-700",
  REJECTED:  "bg-red-100 text-red-700",
  EXPIRED:   "bg-orange-100 text-orange-700",
};

interface QuotationItem {
  description: string; qty: number; unit: string; unitPrice: number; total: number;
}

interface Quotation {
  id: string; quotationNo: string; status: string; statusLabel: string;
  subtotal: number; taxRate: number; tax: number; discount: number; total: number;
  validUntil: string; terms: string; notes: string; createdAt: string;
  customerId: string; customerName: string; clientCode: string;
  parentQuotationId: string | null;
  salutation: string; attentionSalutation: string; attentionName: string;
  items: QuotationItem[];
}

interface Customer { id: string; name: string; company: string; }

type NewItem = { description: string; qty: string; unit: string; unitPrice: string };

const BLANK_ITEM: NewItem = { description: "", qty: "1", unit: "Nos", unitPrice: "" };
const BLANK_FORM = {
  customerId: "", salutation: "M/s",
  attentionSalutation: "Mr.", attentionName: "",
  validUntil: "", taxRate: "0", discount: "",
  status: "DRAFT", terms: "", notes: "",
  revisionNote: "",
  items: [{ ...BLANK_ITEM }],
};

const SALUTATIONS   = ["M/s", "Mr.", "Ms.", "Mrs.", "Dr.", "Prof.", "Adv.", "Er."];
const ATTN_SALUTS   = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof.", "Adv.", "Er."];
const TAX_RATES     = [{ label: "No GST (0%)", value: "0" }, { label: "GST 5%", value: "5" }, { label: "GST 12%", value: "12" }, { label: "GST 18%", value: "18" }];
const STATUS_OPTS   = [
  { label: "Draft",          value: "DRAFT" },
  { label: "Sent via Email", value: "EMAIL" },
  { label: "Sent via WhatsApp", value: "WHATSAPP" },
  { label: "Submitted",     value: "SUBMITTED" },
];

export default function QuotationsPage() {
  const toast = useToast();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [printData, setPrintData] = useState<QuotationData | null>(null);
  const [printSettings, setPrintSettings] = useState<{ company: Partial<CompanyConfig>; bank: Partial<BankConfig> } | null>(null);
  const [loadingPrint, setLoadingPrint] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newQ, setNewQ] = useState(BLANK_FORM);

  // Edit modal
  const [editId, setEditId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState(BLANK_FORM);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");

  // Revise modal
  const [reviseParent, setReviseParent] = useState<Quotation | null>(null);
  const [reviseQ, setReviseQ] = useState({ ...BLANK_FORM, revisionNote: "" });
  const [revising, setRevising] = useState(false);
  const [reviseError, setReviseError] = useState("");

  // Lead / Opportunity → Quotation flow (via URL params)
  const [fromLeadId, setFromLeadId] = useState<string | null>(null);
  const [fromLeadCompany, setFromLeadCompany] = useState("");

  const { data, loading, error, refetch } = useApi<Quotation[]>("/quotations", {
    status: statusFilter || undefined,
    limit: 100,
  });

  const quotations = data ?? [];

  // Auto-open create modal when navigated from Lead / Opportunity / Customer page
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const leadId     = sp.get("fromLead");
    const customerId = sp.get("fromCustomer");
    const company    = sp.get("company") ? decodeURIComponent(sp.get("company")!) : "";

    if (leadId || customerId) {
      setNewQ((prev) => ({ ...prev, items: [{ ...BLANK_ITEM }], customerId: customerId ?? "" }));
      if (leadId) {
        setFromLeadId(leadId);
        setFromLeadCompany(company);
      } else if (customerId && company) {
        setFromLeadCompany(company); // reuse company label for display
      }
      setShowCreate(true);
      setCreateError("");
      window.history.replaceState({}, "", window.location.pathname);
      // Load customers list so the dropdown is populated for customer flow
      if (customerId) {
        api.get<{ data: Customer[] }>("/customers", { limit: 200 })
          .then((r) => setCustomers(r.data ?? []))
          .catch(() => {});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = useCallback(async (q: Quotation) => {
    setLoadingPrint(true);
    try {
      const fullRes = await api.get<{ data: QuotationData }>(`/quotations/${q.id}`);
      const qData: QuotationData = { ...fullRes.data, customerName: q.customerName };
      const branch = qData.branch || "HO";
      const [companyRes, branchBankRes] = await Promise.all([
        api.get<{ data: CompanyConfig }>("/settings").catch(() => ({ data: null })),
        api.get<{ data: BankConfig }>(`/branch-settings?branch=${branch}`).catch(() => ({ data: null })),
      ]);
      const company = companyRes.data;
      const branchBank = branchBankRes.data;

      // Use branch-specific bank details if available and non-empty, else fall back to company settings
      let bankConfig: typeof branchBank = branchBank;
      if (!branchBank || (!branchBank.bankName && !branchBank.accountNo)) {
        bankConfig = company as unknown as typeof branchBank; // fallback to company-wide bank settings
      }

      setPrintData(qData);
      setPrintSettings(company && bankConfig ? { company, bank: bankConfig } : null);

      // PDF filename: ZAG-Q-HO-001-BMH (quotation number + client abbreviation)
      const code = qData.clientCode || makeClientCode(q.customerName);
      const pdfName = q.quotationNo.replace(/\//g, "-") + (code ? `-${code}` : "");
      const prevTitle = document.title;
      document.title = pdfName;

      setTimeout(() => {
        window.print();
        // Restore title and archive to Drive after the print dialog opens
        setTimeout(() => {
          document.title = prevTitle;
          void (async () => {
            if (!(await isDriveConfigured())) return;
            const zone = document.getElementById("zag-print-zone");
            const content = zone?.firstElementChild as HTMLElement | null;
            if (content) {
              const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${pdfName}</title></head><body style="margin:20px;font-family:Arial,sans-serif;">${content.outerHTML}</body></html>`;
              const blob = new Blob([html], { type: "text/html" });
              uploadToDrive(`${pdfName}.html`, blob)
                .then(() => toast.success(`Archived to Drive: ${pdfName}`))
                .catch((err: Error) => toast.error(`Drive: ${err.message}`));
            }
          })();
        }, 1200);
      }, 500);
    } catch {
      alert("Failed to load quotation data for printing.");
    } finally {
      setLoadingPrint(false);
    }
  }, [toast]);

  const createInvoice = useCallback(async (q: Quotation) => {
    try {
      const res = await api.post<{ data: { id: string; invoiceNo: string } }>("/invoices", { quotationId: q.id });
      toast.success(`Invoice ${res.data?.invoiceNo ?? ""} created`);
      router.push("/invoices");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create invoice");
    }
  }, [toast, router]);

  const createTicket = useCallback(async (q: Quotation) => {
    try {
      const res = await api.post<{ data: { id: string; ticketNo: string } }>("/work-order-tickets", { quotationId: q.id });
      toast.success(`Ticket ${res.data?.ticketNo ?? ""} created`);
      router.push("/work-order-tickets");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create ticket");
    }
  }, [toast, router]);

  const openCreate = useCallback(async () => {
    setShowCreate(true);
    setCreateError("");
    setNewQ({ ...BLANK_FORM, items: [{ ...BLANK_ITEM }] });
    try {
      const res = await api.get<{ data: Customer[] }>("/customers", { limit: 200 });
      setCustomers(res.data ?? []);
    } catch {
      setCustomers([]);
    }
  }, []);

  const updateItem = (idx: number, field: keyof NewItem, value: string) => {
    setNewQ((prev) => {
      const items = prev.items.map((it, i) => i === idx ? { ...it, [field]: value } : it);
      return { ...prev, items };
    });
  };

  const addItem = () => setNewQ((prev) => ({ ...prev, items: [...prev.items, { ...BLANK_ITEM }] }));

  const removeItem = (idx: number) =>
    setNewQ((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const newQSubtotal = newQ.items.reduce(
    (s, i) => s + Number(i.qty || 0) * Number(i.unitPrice || 0), 0
  );
  const newQTaxRate = Number(newQ.taxRate) || 0;
  const newQTax     = Math.round(newQSubtotal * newQTaxRate) / 100;
  const newQTotal   = newQSubtotal + newQTax - Number(newQ.discount || 0);

  const handleCreate = useCallback(async () => {
    const validItems = newQ.items.filter((i) => i.description.trim() && Number(i.unitPrice) > 0);
    if (!fromLeadId && !newQ.customerId) { setCreateError("Please select a customer."); return; }
    if (!validItems.length) { setCreateError("Add at least one item with description and rate."); return; }
    setCreating(true);
    setCreateError("");
    try {
      await api.post("/quotations", {
        ...(fromLeadId ? { leadId: fromLeadId } : { customerId: newQ.customerId }),
        salutation:          newQ.salutation          || undefined,
        attentionSalutation: newQ.attentionSalutation || undefined,
        attentionName:       newQ.attentionName.trim()  || undefined,
        status:              newQ.status,
        items: validItems.map((i) => ({
          description: i.description.trim(),
          qty:       Number(i.qty) || 1,
          unit:      i.unit || "Nos",
          unitPrice: Number(i.unitPrice),
        })),
        taxRate:    Number(newQ.taxRate) || 0,
        discount:   Number(newQ.discount) || 0,
        validUntil: newQ.validUntil || undefined,
        terms:      newQ.terms.trim() || undefined,
        notes:      newQ.notes.trim() || undefined,
      });
      setShowCreate(false);
      setFromLeadId(null);
      setFromLeadCompany("");
      refetch();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create quotation.");
    } finally {
      setCreating(false);
    }
  }, [newQ, fromLeadId, refetch]);

  const openRevise = useCallback(async (q: Quotation) => {
    setSelected(null);
    setReviseError("");
    setRevising(false);
    try {
      const [res, custRes] = await Promise.all([
        api.get<{ data: QuotationData & { clientCode?: string } }>(`/quotations/${q.id}`),
        api.get<{ data: Customer[] }>("/customers", { limit: 200 }),
      ]);
      const d = res.data;
      setReviseQ({
        customerId:          q.customerId,
        salutation:          d.salutation          || "M/s",
        attentionSalutation: d.attentionSalutation || "Mr.",
        attentionName:       d.attentionName       || "",
        validUntil:          d.validUntil ? d.validUntil.split("T")[0] : "",
        taxRate:             String(d.taxRate),
        discount:            d.discount > 0 ? String(d.discount) : "",
        status:              "DRAFT",
        terms:               d.terms,
        notes:               d.notes,
        items: d.items.length
          ? d.items.map((i) => ({ description: i.description, qty: String(i.qty), unit: i.unit, unitPrice: String(i.unitPrice) }))
          : [{ ...BLANK_ITEM }],
        revisionNote:        "",
      });
      setCustomers(custRes.data ?? []);
      setReviseParent(q);
    } catch {
      alert("Failed to load quotation for revision.");
    }
  }, []);

  const handleRevise = useCallback(async () => {
    if (!reviseParent) return;
    const validItems = reviseQ.items.filter((i) => i.description.trim() && Number(i.unitPrice) > 0);
    if (!validItems.length) { setReviseError("Add at least one item."); return; }
    setRevising(true);
    setReviseError("");
    // Find the root quotation ID (walk up if this is already a revision)
    const rootId = reviseParent.parentQuotationId ?? reviseParent.id;
    try {
      await api.post("/quotations", {
        customerId:          reviseParent.customerId,
        salutation:          reviseQ.salutation          || undefined,
        attentionSalutation: reviseQ.attentionSalutation || undefined,
        attentionName:       reviseQ.attentionName.trim()  || undefined,
        status:              reviseQ.status,
        validUntil:          reviseQ.validUntil || undefined,
        taxRate:             Number(reviseQ.taxRate) || 0,
        discount:            Number(reviseQ.discount) || 0,
        terms:               reviseQ.terms.trim() || undefined,
        notes:               reviseQ.notes.trim() || undefined,
        items: validItems.map((i) => ({
          description: i.description.trim(),
          qty:       Number(i.qty) || 1,
          unit:      i.unit || "Nos",
          unitPrice: Number(i.unitPrice),
        })),
        parentQuotationId: rootId,
        revisionNote:      reviseQ.revisionNote.trim() || undefined,
      });
      setReviseParent(null);
      refetch();
    } catch (e) {
      setReviseError(e instanceof Error ? e.message : "Failed to create revision.");
    } finally {
      setRevising(false);
    }
  }, [reviseParent, reviseQ, refetch]);

  const openEdit = useCallback(async (q: Quotation) => {
    setSelected(null);
    setEditError("");
    setEditing(false);
    // Load fresh data for accurate item list
    try {
      const [res, custRes] = await Promise.all([
        api.get<{ data: QuotationData & { customerAddress?: string; customerGst?: string } }>(`/quotations/${q.id}`),
        api.get<{ data: Customer[] }>("/customers", { limit: 200 }),
      ]);
      const d = res.data;
      setEditQ({
        customerId:          q.customerId,
        salutation:          d.salutation          || "M/s",
        attentionSalutation: d.attentionSalutation || "Mr.",
        attentionName:       d.attentionName       || "",
        validUntil:          d.validUntil ? d.validUntil.split("T")[0] : "",
        taxRate:             String(d.taxRate),
        discount:            d.discount > 0 ? String(d.discount) : "",
        status:              d.status,
        terms:               d.terms,
        notes:               d.notes,
        revisionNote:        "",
        items: d.items.length
          ? d.items.map((i) => ({ description: i.description, qty: String(i.qty), unit: i.unit, unitPrice: String(i.unitPrice) }))
          : [{ ...BLANK_ITEM }],
      });
      setCustomers(custRes.data ?? []);
      setEditId(q.id);
    } catch {
      alert("Failed to load quotation for editing.");
    }
  }, []);

  const editItemUpdate = (idx: number, field: keyof NewItem, value: string) => {
    setEditQ((prev) => {
      const items = prev.items.map((it, i) => i === idx ? { ...it, [field]: value } : it);
      return { ...prev, items };
    });
  };

  const handleEditSave = useCallback(async () => {
    if (!editId) return;
    const validItems = editQ.items.filter((i) => i.description.trim() && Number(i.unitPrice) > 0);
    if (!validItems.length) { setEditError("Add at least one item with description and rate."); return; }
    setEditing(true);
    setEditError("");
    try {
      await api.put(`/quotations/${editId}`, {
        salutation:          editQ.salutation          || undefined,
        attentionSalutation: editQ.attentionSalutation || undefined,
        attentionName:       editQ.attentionName.trim()  || undefined,
        status:              editQ.status,
        validUntil:          editQ.validUntil || undefined,
        taxRate:             Number(editQ.taxRate) || 0,
        discount:            Number(editQ.discount) || 0,
        terms:               editQ.terms.trim() || undefined,
        notes:               editQ.notes.trim() || undefined,
        items: validItems.map((i) => ({
          description: i.description.trim(),
          qty:       Number(i.qty) || 1,
          unit:      i.unit || "Nos",
          unitPrice: Number(i.unitPrice),
        })),
      });
      setEditId(null);
      setSelected(null);
      refetch();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to save quotation.");
    } finally {
      setEditing(false);
    }
  }, [editId, editQ, refetch]);

  const inp = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-indigo-400";

  return (
    <div>
      <TopBar title="Quotations" />
      <div className="p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: quotations.length },
            { label: "Approved", value: quotations.filter((q) => q.status === "APPROVED").length },
            { label: "Pending", value: quotations.filter((q) => q.status === "SENT").length },
            { label: "Total Value", value: fmt(quotations.reduce((s, q) => s + q.total, 0)) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap items-center">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="EMAIL">Sent via Email</option>
              <option value="WHATSAPP">Sent via WhatsApp</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <button onClick={refetch} title="Refresh"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
            <DriveButton
              filename={`Quotations_${new Date().toISOString().slice(0,10)}`}
              rows={quotations.map((q) => ({
                "Quote No": q.quotationNo, "Customer": q.customerName,
                "Status": q.statusLabel, "Created": q.createdAt,
                "Valid Until": q.validUntil, "Total (₹)": q.total,
              }))}
            />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            <Plus size={15} /> New Quotation
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : quotations.length === 0 ? (
            <EmptyState label="No quotations found" hint="Click 'New Quotation' to create one." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Quote No</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Created</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Valid Until</th>
                    <th className="text-right px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-indigo-600 font-medium">{q.quotationNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{q.customerName || "—"}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{q.createdAt}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{q.validUntil || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmt(q.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[q.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {q.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(q)}
                            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                            <Eye size={12} /> View
                          </button>
                          <button onClick={() => openEdit(q)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                            <Pencil size={12} /> Edit
                          </button>
                          <button onClick={() => openRevise(q)} title="Create revised version"
                            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800">
                            <GitBranch size={12} /> Revise
                          </button>
                          <button onClick={() => handlePrint(q)} disabled={loadingPrint}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40">
                            <Printer size={12} /> {loadingPrint ? "…" : "PDF"}
                          </button>
                          <WhatsAppShare
                            documentType="quotation"
                            documentNumber={q.number}
                            customerName={q.customerName || "Customer"}
                            customerPhone={q.customerPhone || ""}
                            documentDetails={`Quotation Total: ₹${fmt(q.total)} | Valid Until: ${q.validUntil || "N/A"}`}
                          />
                          {(q.status === "APPROVED" || q.status === "SUBMITTED") && (
                            <>
                              <button onClick={() => createTicket(q)} title="Open Work Order Ticket"
                                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium">
                                <Ticket size={10} /> Ticket
                              </button>
                              <button onClick={() => createInvoice(q)} title="Create Tax Invoice"
                                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium">
                                <Receipt size={10} /> Invoice
                              </button>
                            </>
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

      {/* ── CREATE QUOTATION MODAL ──────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h2 className="text-base font-bold text-gray-900">New Quotation</h2>
                {fromLeadCompany && (
                  <p className="text-xs text-blue-600 mt-0.5">Linked to lead: <span className="font-semibold">{fromLeadCompany}</span></p>
                )}
              </div>
              <button onClick={() => { setShowCreate(false); setFromLeadId(null); setFromLeadCompany(""); }} className="p-1 rounded hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer + Salutation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Salutation</label>
                  <select value={newQ.salutation} onChange={(e) => setNewQ((p) => ({ ...p, salutation: e.target.value }))} className={inp}>
                    {SALUTATIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {fromLeadId ? "Linked Lead" : "Customer"} <span className="text-red-500">*</span>
                  </label>
                  {fromLeadId ? (
                    <div className={`${inp} bg-blue-50 text-blue-800 font-medium cursor-not-allowed`}>
                      {fromLeadCompany}
                    </div>
                  ) : (
                    <select value={newQ.customerId} onChange={(e) => setNewQ((p) => ({ ...p, customerId: e.target.value }))} className={inp}>
                      <option value="">Select customer…</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.company || c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Kind Attn + Valid Until + Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Attn. Salutation</label>
                  <select value={newQ.attentionSalutation} onChange={(e) => setNewQ((p) => ({ ...p, attentionSalutation: e.target.value }))} className={inp}>
                    {ATTN_SALUTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kind Attn. Name</label>
                  <input value={newQ.attentionName} placeholder="Contact person name"
                    onChange={(e) => setNewQ((p) => ({ ...p, attentionName: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valid Until</label>
                  <input type="date" value={newQ.validUntil}
                    onChange={(e) => setNewQ((p) => ({ ...p, validUntil: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={newQ.status} onChange={(e) => setNewQ((p) => ({ ...p, status: e.target.value }))} className={inp}>
                    {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">Items <span className="text-red-500">*</span></label>
                  <button onClick={addItem}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    <Plus size={12} /> Add Row
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-xs text-gray-500">
                        <th className="text-left px-3 py-2 w-[40%]">Description</th>
                        <th className="text-right px-3 py-2 w-[10%]">Qty</th>
                        <th className="text-left px-3 py-2 w-[12%]">Unit</th>
                        <th className="text-right px-3 py-2 w-[18%]">Rate (₹)</th>
                        <th className="text-right px-3 py-2 w-[15%]">Amount</th>
                        <th className="w-[5%]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {newQ.items.map((item, idx) => {
                        const rowTotal = Number(item.qty || 0) * Number(item.unitPrice || 0);
                        return (
                          <tr key={idx}>
                            <td className="px-2 py-1.5">
                              <input value={item.description} placeholder="Description"
                                onChange={(e) => updateItem(idx, "description", e.target.value)}
                                className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-indigo-400" />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" min="0.01" step="any" value={item.qty}
                                onChange={(e) => updateItem(idx, "qty", e.target.value)}
                                className="border border-gray-200 rounded px-2 py-1 text-sm w-full text-right focus:outline-none focus:border-indigo-400" />
                            </td>
                            <td className="px-2 py-1.5">
                              <select value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)}
                                className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-indigo-400">
                                {["Nos", "Sqft", "Rft", "Mtr", "Set", "Job", "Kg"].map((u) => (
                                  <option key={u}>{u}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" min="0" step="any" value={item.unitPrice} placeholder="0"
                                onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                                className="border border-gray-200 rounded px-2 py-1 text-sm w-full text-right focus:outline-none focus:border-indigo-400" />
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-700 font-medium whitespace-nowrap">
                              {rowTotal > 0 ? fmt(rowTotal) : "—"}
                            </td>
                            <td className="px-2 py-1.5">
                              {newQ.items.length > 1 && (
                                <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500">
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GST Rate / Discount / Totals */}
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="grid grid-cols-2 gap-4 md:w-72">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">GST Rate</label>
                    <select value={newQ.taxRate}
                      onChange={(e) => setNewQ((p) => ({ ...p, taxRate: e.target.value }))}
                      className={inp}>
                      <option value="0">0% (Exempt)</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Discount (₹)</label>
                    <input type="number" min="0" step="any" value={newQ.discount} placeholder="0"
                      onChange={(e) => setNewQ((p) => ({ ...p, discount: e.target.value }))}
                      className={inp} />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-500">Subtotal: <span className="font-medium text-gray-800">{fmt(newQSubtotal)}</span></p>
                  {newQTax > 0 && (
                    <>
                      <p className="text-sm text-gray-500">CGST @ {Number(newQ.taxRate) / 2}%: <span className="font-medium">{fmt(newQTax / 2)}</span></p>
                      <p className="text-sm text-gray-500">SGST @ {Number(newQ.taxRate) / 2}%: <span className="font-medium">{fmt(newQTax / 2)}</span></p>
                    </>
                  )}
                  {Number(newQ.discount) > 0 && <p className="text-sm text-gray-500">Discount: <span className="font-medium text-green-600">-{fmt(Number(newQ.discount))}</span></p>}
                  <p className="text-base font-bold text-indigo-700">Total: {fmt(newQTotal)}</p>
                </div>
              </div>

              {/* Terms + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Terms & Conditions</label>
                  <textarea rows={3} value={newQ.terms} placeholder="Payment terms, delivery terms…"
                    onChange={(e) => setNewQ((p) => ({ ...p, terms: e.target.value }))}
                    className={inp + " resize-none"} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes / Special Remarks</label>
                  <textarea rows={3} value={newQ.notes} placeholder="Special remarks, site details, scope clarifications…"
                    onChange={(e) => setNewQ((p) => ({ ...p, notes: e.target.value }))}
                    className={inp + " resize-none"} />
                </div>
              </div>

              {createError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{createError}</p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => { setShowCreate(false); setFromLeadId(null); setFromLeadCompany(""); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleCreate} disabled={creating}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
                  {creating ? "Saving…" : "Create Quotation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start p-6 border-b">
              <div>
                <h2 className="text-base font-bold text-gray-900">{selected.quotationNo}</h2>
                <p className="text-sm text-gray-500">{selected.customerName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[selected.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {selected.statusLabel}
                </span>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
              </div>
            </div>
            <div className="p-6">
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
                      <td className="p-3 text-right">{fmt(item.unitPrice)}</td>
                      <td className="p-3 text-right font-medium">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {selected.tax > 0 && selected.taxRate > 0 && (
                    <>
                      <tr className="text-sm border-t border-gray-100">
                        <td colSpan={4} className="p-3 text-right text-gray-500">CGST @ {selected.taxRate / 2}%</td>
                        <td className="p-3 text-right">{fmt(selected.tax / 2)}</td>
                      </tr>
                      <tr className="text-sm border-t border-gray-100">
                        <td colSpan={4} className="p-3 text-right text-gray-500">SGST @ {selected.taxRate / 2}%</td>
                        <td className="p-3 text-right">{fmt(selected.tax / 2)}</td>
                      </tr>
                    </>
                  )}
                  {selected.tax > 0 && !selected.taxRate && (
                    <tr className="text-sm border-t border-gray-100">
                      <td colSpan={4} className="p-3 text-right text-gray-500">Tax</td>
                      <td className="p-3 text-right">{fmt(selected.tax)}</td>
                    </tr>
                  )}
                  {selected.discount > 0 && (
                    <tr className="text-sm border-t border-gray-100">
                      <td colSpan={4} className="p-3 text-right text-gray-500">Discount</td>
                      <td className="p-3 text-right text-green-600">-{fmt(selected.discount)}</td>
                    </tr>
                  )}
                  <tr className="font-bold text-sm bg-indigo-50">
                    <td colSpan={4} className="p-3 text-right text-gray-700">Grand Total</td>
                    <td className="p-3 text-right text-indigo-700 text-base">{fmt(selected.total)}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="border-t mt-4 pt-4">
                <DocumentsPanel relatedTo={selected.id} relatedType="QUOTATION" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => openRevise(selected)}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50">
                  <GitBranch size={14} /> Revise
                </button>
                <button onClick={() => openEdit(selected)}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => { setSelected(null); handlePrint(selected); }}
                  disabled={loadingPrint}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  <Printer size={14} /> {loadingPrint ? "Loading…" : "Print / PDF"}
                </button>
                <button onClick={() => setSelected(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REVISE QUOTATION MODAL ────────────────────────────────────────── */}
      {reviseParent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h2 className="text-base font-bold text-gray-900">Revise Quotation</h2>
                <p className="text-xs text-amber-600 mt-0.5">
                  Based on {reviseParent.quotationNo} → new revision number will be auto-generated (e.g. {reviseParent.quotationNo.split("-R")[0]}-R2)
                </p>
              </div>
              <button onClick={() => setReviseParent(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Revision reason */}
              <div>
                <label className="block text-xs font-medium text-amber-700 mb-1">Revision Reason / Note <span className="text-red-500">*</span></label>
                <input value={reviseQ.revisionNote} placeholder="e.g. Price revised after negotiation, Updated scope of work…"
                  onChange={(e) => setReviseQ((p) => ({ ...p, revisionNote: e.target.value }))}
                  className="border border-amber-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-amber-400 bg-amber-50" />
              </div>

              {/* Salutation + Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Salutation</label>
                  <select value={reviseQ.salutation} onChange={(e) => setReviseQ((p) => ({ ...p, salutation: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-indigo-400">
                    {SALUTATIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Attn. Salutation</label>
                  <select value={reviseQ.attentionSalutation} onChange={(e) => setReviseQ((p) => ({ ...p, attentionSalutation: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-indigo-400">
                    {ATTN_SALUTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kind Attn. Name</label>
                  <input value={reviseQ.attentionName} onChange={(e) => setReviseQ((p) => ({ ...p, attentionName: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valid Until</label>
                  <input type="date" value={reviseQ.validUntil} onChange={(e) => setReviseQ((p) => ({ ...p, validUntil: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-indigo-400" />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">Items <span className="text-red-500">*</span></label>
                  <button onClick={() => setReviseQ((p) => ({ ...p, items: [...p.items, { ...BLANK_ITEM }] }))}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    <Plus size={12} /> Add Row
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-xs text-gray-500">
                        <th className="text-left px-3 py-2 w-[40%]">Description</th>
                        <th className="text-right px-3 py-2 w-[10%]">Qty</th>
                        <th className="text-left px-3 py-2 w-[12%]">Unit</th>
                        <th className="text-right px-3 py-2 w-[18%]">Rate (₹)</th>
                        <th className="text-right px-3 py-2 w-[15%]">Amount</th>
                        <th className="w-[5%]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reviseQ.items.map((item, idx) => {
                        const rowTotal = Number(item.qty || 0) * Number(item.unitPrice || 0);
                        return (
                          <tr key={idx}>
                            <td className="px-2 py-1.5"><input value={item.description} placeholder="Description"
                              onChange={(e) => setReviseQ((p) => { const items = p.items.map((it, i) => i === idx ? { ...it, description: e.target.value } : it); return { ...p, items }; })}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none" /></td>
                            <td className="px-2 py-1.5"><input type="number" value={item.qty}
                              onChange={(e) => setReviseQ((p) => { const items = p.items.map((it, i) => i === idx ? { ...it, qty: e.target.value } : it); return { ...p, items }; })}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full text-right focus:outline-none" /></td>
                            <td className="px-2 py-1.5"><select value={item.unit}
                              onChange={(e) => setReviseQ((p) => { const items = p.items.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it); return { ...p, items }; })}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none">
                              {["Nos","Sqft","Rft","Mtr","Set","Job","Kg"].map((u) => <option key={u}>{u}</option>)}
                            </select></td>
                            <td className="px-2 py-1.5"><input type="number" value={item.unitPrice} placeholder="0"
                              onChange={(e) => setReviseQ((p) => { const items = p.items.map((it, i) => i === idx ? { ...it, unitPrice: e.target.value } : it); return { ...p, items }; })}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full text-right focus:outline-none" /></td>
                            <td className="px-2 py-1.5 text-right text-gray-700 font-medium whitespace-nowrap">{rowTotal > 0 ? fmt(rowTotal) : "—"}</td>
                            <td className="px-2 py-1.5">{reviseQ.items.length > 1 && (
                              <button onClick={() => setReviseQ((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                            )}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GST / Discount / Totals */}
              {(() => {
                const sub  = reviseQ.items.reduce((s, i) => s + Number(i.qty||0)*Number(i.unitPrice||0), 0);
                const rate = Number(reviseQ.taxRate)||0;
                const tax  = Math.round(sub*rate)/100;
                const disc = Number(reviseQ.discount)||0;
                return (
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="grid grid-cols-3 gap-4 md:w-80">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">GST Rate</label>
                        <select value={reviseQ.taxRate} onChange={(e) => setReviseQ((p) => ({ ...p, taxRate: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none">
                          <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Discount (₹)</label>
                        <input type="number" min="0" value={reviseQ.discount} placeholder="0"
                          onChange={(e) => setReviseQ((p) => ({ ...p, discount: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                        <select value={reviseQ.status} onChange={(e) => setReviseQ((p) => ({ ...p, status: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none">
                          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-gray-500">Subtotal: <span className="font-medium">{fmt(sub)}</span></p>
                      {tax > 0 && <><p className="text-sm text-gray-500">CGST @ {rate/2}%: <span className="font-medium">{fmt(tax/2)}</span></p><p className="text-sm text-gray-500">SGST @ {rate/2}%: <span className="font-medium">{fmt(tax/2)}</span></p></>}
                      {disc > 0 && <p className="text-sm text-gray-500">Discount: <span className="font-medium text-green-600">-{fmt(disc)}</span></p>}
                      <p className="text-base font-bold text-indigo-700">Total: {fmt(sub+tax-disc)}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Terms + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Terms &amp; Conditions</label>
                  <textarea rows={3} value={reviseQ.terms} onChange={(e) => setReviseQ((p) => ({ ...p, terms: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes / Special Remarks</label>
                  <textarea rows={3} value={reviseQ.notes} onChange={(e) => setReviseQ((p) => ({ ...p, notes: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none resize-none" />
                </div>
              </div>

              {reviseError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{reviseError}</p>}

              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setReviseParent(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleRevise} disabled={revising}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium">
                  <GitBranch size={14} /> {revising ? "Creating…" : "Create Revised Quotation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT QUOTATION MODAL ──────────────────────────────────────────── */}
      {editId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-base font-bold text-gray-900">Edit Quotation</h2>
              <button onClick={() => setEditId(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Salutation + Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Salutation</label>
                  <select value={editQ.salutation} onChange={(e) => setEditQ((p) => ({ ...p, salutation: e.target.value }))} className={inp}>
                    {SALUTATIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Attn. Salutation</label>
                  <select value={editQ.attentionSalutation} onChange={(e) => setEditQ((p) => ({ ...p, attentionSalutation: e.target.value }))} className={inp}>
                    {ATTN_SALUTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kind Attn. Name</label>
                  <input value={editQ.attentionName} placeholder="Contact person"
                    onChange={(e) => setEditQ((p) => ({ ...p, attentionName: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={editQ.status} onChange={(e) => setEditQ((p) => ({ ...p, status: e.target.value }))} className={inp}>
                    {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Valid Until */}
              <div className="grid grid-cols-2 gap-4 md:w-1/2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valid Until</label>
                  <input type="date" value={editQ.validUntil}
                    onChange={(e) => setEditQ((p) => ({ ...p, validUntil: e.target.value }))} className={inp} />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">Items <span className="text-red-500">*</span></label>
                  <button onClick={() => setEditQ((p) => ({ ...p, items: [...p.items, { ...BLANK_ITEM }] }))}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    <Plus size={12} /> Add Row
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-xs text-gray-500">
                        <th className="text-left px-3 py-2 w-[40%]">Description</th>
                        <th className="text-right px-3 py-2 w-[10%]">Qty</th>
                        <th className="text-left px-3 py-2 w-[12%]">Unit</th>
                        <th className="text-right px-3 py-2 w-[18%]">Rate (₹)</th>
                        <th className="text-right px-3 py-2 w-[15%]">Amount</th>
                        <th className="w-[5%]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {editQ.items.map((item, idx) => {
                        const rowTotal = Number(item.qty || 0) * Number(item.unitPrice || 0);
                        return (
                          <tr key={idx}>
                            <td className="px-2 py-1.5">
                              <input value={item.description} placeholder="Description"
                                onChange={(e) => editItemUpdate(idx, "description", e.target.value)}
                                className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-indigo-400" />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" min="0.01" step="any" value={item.qty}
                                onChange={(e) => editItemUpdate(idx, "qty", e.target.value)}
                                className="border border-gray-200 rounded px-2 py-1 text-sm w-full text-right focus:outline-none focus:border-indigo-400" />
                            </td>
                            <td className="px-2 py-1.5">
                              <select value={item.unit} onChange={(e) => editItemUpdate(idx, "unit", e.target.value)}
                                className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-indigo-400">
                                {["Nos", "Sqft", "Rft", "Mtr", "Set", "Job", "Kg"].map((u) => <option key={u}>{u}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" min="0" step="any" value={item.unitPrice} placeholder="0"
                                onChange={(e) => editItemUpdate(idx, "unitPrice", e.target.value)}
                                className="border border-gray-200 rounded px-2 py-1 text-sm w-full text-right focus:outline-none focus:border-indigo-400" />
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-700 font-medium whitespace-nowrap">
                              {rowTotal > 0 ? fmt(rowTotal) : "—"}
                            </td>
                            <td className="px-2 py-1.5">
                              {editQ.items.length > 1 && (
                                <button onClick={() => setEditQ((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))}
                                  className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GST / Discount / Totals */}
              {(() => {
                const sub  = editQ.items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.unitPrice || 0), 0);
                const rate = Number(editQ.taxRate) || 0;
                const tax  = Math.round(sub * rate) / 100;
                const disc = Number(editQ.discount) || 0;
                return (
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="grid grid-cols-2 gap-4 md:w-72">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">GST Rate</label>
                        <select value={editQ.taxRate}
                          onChange={(e) => setEditQ((p) => ({ ...p, taxRate: e.target.value }))} className={inp}>
                          <option value="0">0% (Exempt)</option>
                          <option value="5">5% GST</option>
                          <option value="12">12% GST</option>
                          <option value="18">18% GST</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Discount (₹)</label>
                        <input type="number" min="0" step="any" value={editQ.discount} placeholder="0"
                          onChange={(e) => setEditQ((p) => ({ ...p, discount: e.target.value }))} className={inp} />
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-gray-500">Subtotal: <span className="font-medium text-gray-800">{fmt(sub)}</span></p>
                      {tax > 0 && (
                        <>
                          <p className="text-sm text-gray-500">CGST @ {rate / 2}%: <span className="font-medium">{fmt(tax / 2)}</span></p>
                          <p className="text-sm text-gray-500">SGST @ {rate / 2}%: <span className="font-medium">{fmt(tax / 2)}</span></p>
                        </>
                      )}
                      {disc > 0 && <p className="text-sm text-gray-500">Discount: <span className="font-medium text-green-600">-{fmt(disc)}</span></p>}
                      <p className="text-base font-bold text-indigo-700">Total: {fmt(sub + tax - disc)}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Terms + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Terms &amp; Conditions</label>
                  <textarea rows={3} value={editQ.terms} placeholder="Payment terms, delivery terms…"
                    onChange={(e) => setEditQ((p) => ({ ...p, terms: e.target.value }))}
                    className={inp + " resize-none"} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes / Special Remarks</label>
                  <textarea rows={3} value={editQ.notes} placeholder="Special remarks, site details…"
                    onChange={(e) => setEditQ((p) => ({ ...p, notes: e.target.value }))}
                    className={inp + " resize-none"} />
                </div>
              </div>

              {editError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{editError}</p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setEditId(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleEditSave} disabled={editing}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
                  {editing ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT ZONE (CSS keeps it off-screen; @media print makes it visible) */}
      <div id="zag-print-zone">
        {printData && (
          <QuotationPrintTemplate
            q={printData}
            company={printSettings?.company}
            bank={printSettings?.bank}
          />
        )}
      </div>
    </div>
  );
}
