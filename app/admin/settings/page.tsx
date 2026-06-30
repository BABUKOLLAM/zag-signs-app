"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { api } from "@/lib/api-client";
import {
  Building2, CreditCard, FileText, Save, CheckCircle, Loader2,
  AlertCircle, Landmark, Settings2, Plus, X, Edit2, Trash2,
  Users, Share2, TrendingUp, Package, Clock, Shield, MapPin,
  Layers, List, ChevronRight, Phone, Mail, Wrench, ExternalLink,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CompanySettings {
  name: string; tagline: string; address: string; phone: string; email: string;
  website: string; gstNo: string; panNo: string; logoUrl: string;
  bankName: string; bankBranch: string; accountNo: string; ifscCode: string;
  accountType: string; defaultTerms: string; validityDays: number; paymentQrUrl: string;
}

interface BranchBank { id: string; bankName: string; bankBranch: string; accountNo: string; ifscCode: string; accountType: string; }
interface Division { id: string; code: string; name: string; branch: string; headName: string; headEmail: string; headPhone: string; notes: string; isActive: boolean; departments: Department[]; }
interface Department { id: string; name: string; divisionId: string; headName: string; headEmail: string; headPhone: string; notes: string; isActive: boolean; division?: { branch: string; name: string }; }

// ─── Constants ─────────────────────────────────────────────────────────────────

const BRANCHES = [
  { id: "HO",   label: "Head Office",          short: "HO" },
  { id: "TVM",  label: "Thiruvananthapuram",   short: "TVM" },
  { id: "KTYM", label: "Kottayam",             short: "KTYM" },
  { id: "EKM",  label: "Ernakulam",            short: "EKM" },
  { id: "CLT",  label: "Calicut",              short: "CLT" },
];

const ROLE_INFO: Record<string, { label: string; desc: string; color: string }> = {
  MD:               { label: "Managing Director",    desc: "Full system access; approves all levels", color: "bg-purple-100 text-purple-700" },
  AVP:              { label: "AVP / VP",             desc: "Cross-branch visibility; approves manager-level reports", color: "bg-indigo-100 text-indigo-700" },
  BUSINESS_MANAGER: { label: "Business Manager",     desc: "Branch-level manager; approves DARs, FJPs", color: "bg-blue-100 text-blue-700" },
  SALES_EXECUTIVE:  { label: "Sales Executive",      desc: "Field sales; submits DAR, FJP, activities", color: "bg-cyan-100 text-cyan-700" },
  CRES:             { label: "CRES / Customer Rel.", desc: "Customer relationship and after-sales", color: "bg-teal-100 text-teal-700" },
  PRODUCTION:       { label: "Production",           desc: "Work orders, machine scheduling, QC", color: "bg-emerald-100 text-emerald-700" },
  DESIGNER:         { label: "Designer",             desc: "Handles design work orders from ticket queue", color: "bg-green-100 text-green-700" },
  ACCOUNTS:         { label: "Accounts",             desc: "Invoices, collections, expense verification", color: "bg-yellow-100 text-yellow-700" },
  HR:               { label: "HR",                  desc: "Employee records, attendance, leave approval", color: "bg-orange-100 text-orange-700" },
  IT_ADMIN:         { label: "IT Admin",             desc: "System settings, user management", color: "bg-red-100 text-red-700" },
  CONSULTANT:       { label: "Consultant",           desc: "Limited read-only access", color: "bg-slate-100 text-slate-600" },
};

const DEFAULT_TERMS = [
  "Payment due within 15 days of invoice date.",
  "50% advance required to commence production.",
  "Goods once sold will not be taken back.",
  "This is a computer-generated quotation and does not require a signature to be valid.",
  "Price quoted is valid for 30 days from the date of quotation.",
  "Delivery timeline starts from receipt of advance & approved artwork.",
].join("\n");

const NAV_GROUPS = [
  { group: "CORPORATE", items: [
    { id: "company",     label: "Company Profile",      icon: Building2 },
    { id: "bank",        label: "Bank & Payment",        icon: CreditCard },
    { id: "quotation",   label: "Quotation",             icon: FileText },
  ]},
  { group: "ORGANIZATION", items: [
    { id: "branches",    label: "Branches",              icon: MapPin },
    { id: "divisions",   label: "Divisions",             icon: Layers },
    { id: "departments", label: "Departments",           icon: List },
  ]},
  { group: "PEOPLE", items: [
    { id: "staff",       label: "Staff & Roles",         icon: Users },
    { id: "reporting",   label: "Reporting Structure",   icon: Share2 },
    { id: "targets",     label: "Sales Targets",         icon: TrendingUp },
  ]},
  { group: "OPERATIONS", items: [
    { id: "machinery",   label: "Machinery",             icon: Wrench },
    { id: "inventory",   label: "Inventory Mapping",     icon: Package },
    { id: "shifts",      label: "Shifts & Attendance",   icon: Clock },
  ]},
  { group: "SYSTEM", items: [
    { id: "roles",       label: "Roles & Permissions",   icon: Shield },
  ]},
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const inp = "w-full border rounded-xl px-3 py-2 text-sm";
const is   = { background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" } as React.CSSProperties;
const cs   = { background: "var(--card-bg)", border: "1px solid var(--card-border)" } as React.CSSProperties;

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}
function I({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inp} style={is} />;
}
function SaveBtn({ saving, saved, onClick, label }: { saving: boolean; saved: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
      style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
      {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> :
       saved   ? <><CheckCircle size={14} /> Saved!</> :
       <><Save size={14} /> {label}</>}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsHub() {
  const [section, setSection] = useState("company");

  // Company settings state
  const [company, setCompany] = useState<CompanySettings>({
    name: "", tagline: "", address: "", phone: "", email: "", website: "",
    gstNo: "", panNo: "", logoUrl: "", bankName: "", bankBranch: "", accountNo: "",
    ifscCode: "", accountType: "Current Account", defaultTerms: DEFAULT_TERMS,
    validityDays: 30, paymentQrUrl: "",
  });
  const [branchBanks, setBranchBanks] = useState<Record<string, BranchBank>>({});
  const [selectedBank,    setSelectedBank]    = useState("HO");
  const [branchOps, setBranchOps]       = useState<Record<string, any>>({});
  const [selectedOpsB, setSelectedOpsB] = useState("TVM");

  // Division / Department state
  const [divisions,    setDivisions]    = useState<Division[]>([]);
  const [departments,  setDepartments]  = useState<Department[]>([]);
  const [divBranch,    setDivBranch]    = useState("TVM");
  const [deptDivId,    setDeptDivId]    = useState("");
  const [divForm,      setDivForm]      = useState({ name: "", headName: "", headEmail: "", headPhone: "", notes: "" });
  const [deptForm,     setDeptForm]     = useState({ name: "", divisionId: "", headName: "", headEmail: "", headPhone: "", notes: "" });
  const [editDiv,      setEditDiv]      = useState<Division | null>(null);
  const [editDept,     setEditDept]     = useState<Department | null>(null);
  const [showDivForm,  setShowDivForm]  = useState(false);
  const [showDeptForm, setShowDeptForm] = useState(false);

  // People state
  const [users,    setUsers]    = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [materials,setMaterials]= useState<any[]>([]);

  // Loading / saving flags
  const [initLoading,  setInitLoading]  = useState(true);
  const [loading,      setLoading]      = useState<Record<string, boolean>>({});
  const [saving,       setSaving]       = useState<Record<string, boolean>>({});
  const [saved,        setSaved]        = useState<Record<string, boolean>>({});
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [fetched,      setFetched]      = useState(new Set<string>());

  // ─ Initial load (company + all branch banks) ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [compRes, ...bankRes] = await Promise.all([
          api.get<any>("/settings"),
          ...BRANCHES.map(b => api.get<any>(`/branch-settings?branch=${b.id}`).catch(() => ({ data: { id: b.id } }))),
        ]);
        setCompany(c => ({ ...c, ...compRes.data }));
        const bMap: Record<string, BranchBank> = {};
        BRANCHES.forEach((b, i) => { bMap[b.id] = { id: b.id, bankName: "", bankBranch: "", accountNo: "", ifscCode: "", accountType: "Current Account", ...bankRes[i].data }; });
        setBranchBanks(bMap);
      } catch { /* silently fail */ }
      finally { setInitLoading(false); }
    })();
  }, []);

  // ─ Lazy section data ─────────────────────────────────────────────────────
  const load = useCallback(async (key: string, fn: () => Promise<void>) => {
    if (fetched.has(key)) return;
    setLoading(l => ({ ...l, [key]: true }));
    try { await fn(); setFetched(f => new Set(f).add(key)); }
    catch { /* ignore */ }
    finally { setLoading(l => ({ ...l, [key]: false })); }
  }, [fetched]);

  useEffect(() => {
    if (section === "divisions" || section === "departments")
      load("divisions", async () => { const r = await api.get<any>("/admin/divisions"); setDivisions(r.data ?? []); });
    if (section === "departments" && deptDivId)
      load(`dept-${deptDivId}`, async () => { const r = await api.get<any>(`/admin/departments?divisionId=${deptDivId}`); setDepartments(r.data ?? []); });
    if (section === "staff" || section === "reporting")
      load("staff", async () => { const r = await api.get<any>("/admin/users"); setUsers(r.data ?? []); });
    if (section === "machinery")
      load("machinery", async () => { const r = await api.get<any>("/production/machines"); setMachines(r.data ?? []); });
    if (section === "inventory")
      load("inventory", async () => { const r = await api.get<any>("/inventory"); setMaterials(r.data ?? []); });
    if (section === "branches" || section === "shifts")
      BRANCHES.forEach(b => load(`ops-${b.id}`, async () => {
        const r = await api.get<any>(`/admin/branch-ops?branch=${b.id}`);
        setBranchOps(o => ({ ...o, [b.id]: r.data }));
      }));
  }, [section, deptDivId, load]);

  // ─ Reload on division branch change ──────────────────────────────────────
  useEffect(() => {
    if (section === "divisions") {
      setFetched(f => { const n = new Set(f); n.delete("divisions"); return n; });
    }
  }, [divBranch]);

  useEffect(() => {
    if (section === "departments" && deptDivId) {
      setFetched(f => { const n = new Set(f); n.delete(`dept-${deptDivId}`); return n; });
    }
  }, [deptDivId]);

  // ─ Save helpers ───────────────────────────────────────────────────────────
  const doSave = async (key: string, fn: () => Promise<void>) => {
    setSaving(s => ({ ...s, [key]: true })); setErrors(e => ({ ...e, [key]: "" })); setSaved(s => ({ ...s, [key]: false }));
    try { await fn(); setSaved(s => ({ ...s, [key]: true })); setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 3000); }
    catch (e: any) { setErrors(er => ({ ...er, [key]: e.message || "Save failed" })); }
    finally { setSaving(s => ({ ...s, [key]: false })); }
  };

  const saveCompany = () => doSave("company", () => api.put("/settings", company));
  const saveBankBranch = () => doSave("bank-branch", () => api.put("/branch-settings", { branch: selectedBank, ...branchBanks[selectedBank] }));
  const saveBranchOps  = () => doSave(`ops-${selectedOpsB}`, () => api.put("/admin/branch-ops", { branch: selectedOpsB, ...branchOps[selectedOpsB] }));

  // ─ Division CRUD ──────────────────────────────────────────────────────────
  const filteredDivisions = divisions.filter(d => d.branch === divBranch);

  const handleAddDivision = async () => {
    if (!divForm.name.trim()) return;
    setLoading(l => ({ ...l, divAdd: true }));
    try {
      const r: any = await api.post("/admin/divisions", { ...divForm, branch: divBranch });
      setDivisions(d => [...d, r.data]);
      setDivForm({ name: "", headName: "", headEmail: "", headPhone: "", notes: "" });
      setShowDivForm(false);
    } catch { alert("Failed to add division"); }
    finally { setLoading(l => ({ ...l, divAdd: false })); }
  };

  const handleUpdateDivision = async () => {
    if (!editDiv) return;
    try {
      const r: any = await api.put(`/admin/divisions/${editDiv.id}`, editDiv);
      setDivisions(d => d.map(x => x.id === editDiv.id ? r.data : x));
      setEditDiv(null);
    } catch { alert("Failed to update"); }
  };

  const handleDeleteDivision = async (id: string) => {
    if (!confirm("Delete this division and all its departments?")) return;
    try {
      await api.del(`/admin/divisions/${id}`);
      setDivisions(d => d.filter(x => x.id !== id));
    } catch { alert("Delete failed"); }
  };

  // ─ Department CRUD ────────────────────────────────────────────────────────
  const filteredDepts = departments.filter(d => !deptDivId || d.divisionId === deptDivId);
  const deptDivisions = divisions.filter(d => d.branch === divBranch);

  const handleAddDept = async () => {
    if (!deptForm.name.trim() || !deptForm.divisionId) return;
    setLoading(l => ({ ...l, deptAdd: true }));
    try {
      const r: any = await api.post("/admin/departments", deptForm);
      setDepartments(d => [...d, r.data]);
      setDeptForm({ name: "", divisionId: "", headName: "", headEmail: "", headPhone: "", notes: "" });
      setShowDeptForm(false);
    } catch { alert("Failed to add department"); }
    finally { setLoading(l => ({ ...l, deptAdd: false })); }
  };

  const handleUpdateDept = async () => {
    if (!editDept) return;
    try {
      const r: any = await api.put(`/admin/departments/${editDept.id}`, editDept);
      setDepartments(d => d.map(x => x.id === editDept.id ? r.data : x));
      setEditDept(null);
    } catch { alert("Failed to update department"); }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    try {
      await api.del(`/admin/departments/${id}`);
      setDepartments(d => d.filter(x => x.id !== id));
    } catch { alert("Delete failed"); }
  };

  // ─ Layout ─────────────────────────────────────────────────────────────────

  if (initLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );

  const allNavItems = NAV_GROUPS.flatMap(g => g.items);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <TopBar title="Company Settings" subtitle="Admin" />

      {/* Mobile: horizontal scrolling nav */}
      <div className="lg:hidden flex gap-1 px-3 py-2 overflow-x-auto border-b" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        {allNavItems.map(item => (
          <button key={item.id} onClick={() => setSection(item.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0"
            style={section === item.id ? { background: "#4F46E5", color: "#fff" } : { color: "var(--text-secondary)", border: "1px solid var(--card-border)" }}>
            <item.icon size={12} /> {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r p-3 shrink-0 overflow-y-auto"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          {NAV_GROUPS.map(group => (
            <div key={group.group}>
              <p className="text-xs font-bold uppercase tracking-widest px-2 pt-4 pb-1.5 first:pt-1"
                style={{ color: "var(--text-muted)" }}>{group.group}</p>
              {group.items.map(item => (
                <button key={item.id} onClick={() => setSection(item.id)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left mb-0.5"
                  style={section === item.id ? { background: "#4F46E5", color: "#fff" } : { color: "var(--text-secondary)" }}>
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-5">

            {/* ── COMPANY PROFILE ─────────────────────────────────────── */}
            {section === "company" && (
              <Section title="Company Profile" sub="Used on all quotations, invoices and printed documents.">
                {errors.company && <Err msg={errors.company} />}
                <div className="grid md:grid-cols-2 gap-4">
                  <F label="Company Name *"><I value={company.name} onChange={v => setCompany(c => ({ ...c, name: v }))} placeholder="ZAG SIGNS" /></F>
                  <F label="Tagline / Slogan"><I value={company.tagline} onChange={v => setCompany(c => ({ ...c, tagline: v }))} placeholder="Excellence in Signage Solutions" /></F>
                </div>
                <F label="Full Address *">
                  <textarea value={company.address} rows={2} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))}
                    placeholder="123 Industrial Area, Thiruvananthapuram, Kerala – 695 001"
                    className="w-full border rounded-xl px-3 py-2 text-sm resize-none" style={is} />
                </F>
                <div className="grid md:grid-cols-2 gap-4">
                  <F label="Phone"><I value={company.phone} onChange={v => setCompany(c => ({ ...c, phone: v }))} placeholder="+91 94470 00000" /></F>
                  <F label="Email" ><I value={company.email} onChange={v => setCompany(c => ({ ...c, email: v }))} type="email" placeholder="info@zagsigns.com" /></F>
                  <F label="Website"><I value={company.website} onChange={v => setCompany(c => ({ ...c, website: v }))} placeholder="www.zagsigns.com" /></F>
                  <F label="GSTIN"  ><I value={company.gstNo}  onChange={v => setCompany(c => ({ ...c, gstNo: v }))}   placeholder="32AAAAA0000A1Z5" /></F>
                  <F label="PAN"    ><I value={company.panNo}  onChange={v => setCompany(c => ({ ...c, panNo: v }))}   placeholder="AAAAA0000A" /></F>
                  <F label="Logo URL" hint="Leave blank to use the ZAG monogram."><I value={company.logoUrl} onChange={v => setCompany(c => ({ ...c, logoUrl: v }))} placeholder="https://…/logo.png" /></F>
                </div>
                {company.logoUrl && (
                  <div className="p-3 rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={company.logoUrl} alt="logo" className="h-12 object-contain" onError={e => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
                <SaveBtn saving={!!saving.company} saved={!!saved.company} onClick={saveCompany} label="Save Company Profile" />
              </Section>
            )}

            {/* ── BANK & PAYMENT ──────────────────────────────────────── */}
            {section === "bank" && (
              <Section title="Bank & Payment" sub="Main company bank printed on every quotation. Set branch-specific banks in Branches.">
                {errors.company && <Err msg={errors.company} />}
                <div className="grid md:grid-cols-2 gap-4">
                  <F label="Bank Name"><I value={company.bankName} onChange={v => setCompany(c => ({ ...c, bankName: v }))} placeholder="State Bank of India" /></F>
                  <F label="Branch Name"><I value={company.bankBranch} onChange={v => setCompany(c => ({ ...c, bankBranch: v }))} placeholder="TVM Main Branch" /></F>
                  <F label="Account Number"><I value={company.accountNo} onChange={v => setCompany(c => ({ ...c, accountNo: v }))} placeholder="00000 00000 00000" /></F>
                  <F label="IFSC Code"><I value={company.ifscCode} onChange={v => setCompany(c => ({ ...c, ifscCode: v }))} placeholder="SBIN0000000" /></F>
                  <F label="Account Type">
                    <select value={company.accountType} onChange={e => setCompany(c => ({ ...c, accountType: e.target.value }))} className={inp} style={is}>
                      <option>Current Account</option><option>Savings Account</option><option>OD Account</option>
                    </select>
                  </F>
                  <F label="Payment QR URL" hint="UPI/GPay QR image for advance payment">
                    <I value={company.paymentQrUrl} onChange={v => setCompany(c => ({ ...c, paymentQrUrl: v }))} placeholder="https://…/qr.png" />
                  </F>
                </div>
                <div className="border-t pt-5 mt-2" style={{ borderColor: "var(--card-border)" }}>
                  <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-secondary)" }}>Branch-Specific Bank Accounts</h3>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {BRANCHES.map(b => (
                      <button key={b.id} onClick={() => setSelectedBank(b.id)}
                        className="py-1.5 rounded-lg text-xs font-bold"
                        style={selectedBank === b.id ? { background: "#4F46E5", color: "#fff" } : { background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--input-border)" }}>
                        {b.id}
                      </button>
                    ))}
                  </div>
                  {branchBanks[selectedBank] && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {(["bankName","bankBranch","accountNo","ifscCode"] as const).map(k => (
                        <F key={k} label={k === "bankName" ? "Bank Name" : k === "bankBranch" ? "Branch Name" : k === "accountNo" ? "Account No." : "IFSC Code"}>
                          <input value={branchBanks[selectedBank][k]} className={inp} style={is}
                            onChange={e => setBranchBanks(b => ({ ...b, [selectedBank]: { ...b[selectedBank], [k]: e.target.value } }))} />
                        </F>
                      ))}
                      <F label="Account Type">
                        <select value={branchBanks[selectedBank].accountType} className={inp} style={is}
                          onChange={e => setBranchBanks(b => ({ ...b, [selectedBank]: { ...b[selectedBank], accountType: e.target.value } }))}>
                          <option>Current Account</option><option>Savings Account</option><option>OD Account</option>
                        </select>
                      </F>
                    </div>
                  )}
                  {errors["bank-branch"] && <Err msg={errors["bank-branch"]} />}
                  {saved["bank-branch"] && <Ok msg={`${BRANCHES.find(b => b.id === selectedBank)?.label} bank details saved.`} />}
                  <div className="flex gap-3 mt-3">
                    <SaveBtn saving={!!saving.company} saved={!!saved.company} onClick={saveCompany} label="Save Main Bank" />
                    <SaveBtn saving={!!saving["bank-branch"]} saved={!!saved["bank-branch"]} onClick={saveBankBranch} label={`Save ${selectedBank} Bank`} />
                  </div>
                </div>
              </Section>
            )}

            {/* ── QUOTATION ───────────────────────────────────────────── */}
            {section === "quotation" && (
              <Section title="Quotation Settings" sub="Default values pre-filled when creating or printing quotations.">
                <F label="Default Validity (days)">
                  <input type="number" min={1} max={365} value={company.validityDays}
                    onChange={e => setCompany(c => ({ ...c, validityDays: Number(e.target.value) }))}
                    className="w-32 border rounded-xl px-3 py-2 text-sm" style={is} />
                </F>
                <F label="Default Terms & Conditions" hint="One term per line. Appears on every quotation.">
                  <textarea value={company.defaultTerms} rows={10}
                    onChange={e => setCompany(c => ({ ...c, defaultTerms: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2 text-sm font-mono resize-y" style={is} />
                </F>
                <button onClick={() => setCompany(c => ({ ...c, defaultTerms: DEFAULT_TERMS }))} className="text-xs text-indigo-500 underline">Reset to ZAG SIGNS defaults</button>
                {errors.company && <Err msg={errors.company} />}
                <SaveBtn saving={!!saving.company} saved={!!saved.company} onClick={saveCompany} label="Save Quotation Settings" />
              </Section>
            )}

            {/* ── BRANCHES ────────────────────────────────────────────── */}
            {section === "branches" && (
              <Section title="Branch Offices" sub="Contact details, operating hours, and bank accounts for each branch.">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {BRANCHES.map(b => (
                    <button key={b.id} onClick={() => setSelectedOpsB(b.id)}
                      className="py-1.5 rounded-lg text-xs font-bold"
                      style={selectedOpsB === b.id ? { background: "#4F46E5", color: "#fff" } : { background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--input-border)" }}>
                      {b.id}
                    </button>
                  ))}
                </div>
                {branchOps[selectedOpsB] ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <F label="Display Name"><input className={inp} style={is} value={branchOps[selectedOpsB].displayName || ""}
                        onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], displayName: e.target.value } }))} /></F>
                      <F label="Contact Person"><input className={inp} style={is} value={branchOps[selectedOpsB].contactName || ""}
                        onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], contactName: e.target.value } }))} /></F>
                      <F label="Contact Phone"><input className={inp} style={is} value={branchOps[selectedOpsB].contactPhone || ""}
                        onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], contactPhone: e.target.value } }))} /></F>
                      <F label="Notes"><input className={inp} style={is} value={branchOps[selectedOpsB].notes || ""}
                        onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], notes: e.target.value } }))} /></F>
                      <div className="md:col-span-2"><F label="Address">
                        <textarea rows={2} className="w-full border rounded-xl px-3 py-2 text-sm resize-none" style={is}
                          value={branchOps[selectedOpsB].address || ""}
                          onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], address: e.target.value } }))} />
                      </F></div>
                      <F label="Start Time"><input type="time" className={inp} style={is} value={branchOps[selectedOpsB].startTime || "09:00"}
                        onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], startTime: e.target.value } }))} /></F>
                      <F label="End Time"><input type="time" className={inp} style={is} value={branchOps[selectedOpsB].endTime || "18:00"}
                        onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], endTime: e.target.value } }))} /></F>
                    </div>
                    {errors[`ops-${selectedOpsB}`] && <Err msg={errors[`ops-${selectedOpsB}`]} />}
                    {saved[`ops-${selectedOpsB}`] && <Ok msg={`${selectedOpsB} branch saved.`} />}
                    <SaveBtn saving={!!saving[`ops-${selectedOpsB}`]} saved={!!saved[`ops-${selectedOpsB}`]} onClick={saveBranchOps} label={`Save ${selectedOpsB} Branch`} />
                  </>
                ) : (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
                )}
              </Section>
            )}

            {/* ── DIVISIONS ────────────────────────────────────────────── */}
            {section === "divisions" && (
              <Section title="Divisions & Business Units" sub="Group branches into functional divisions with designated heads.">
                {/* Branch selector */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {BRANCHES.map(b => (
                    <button key={b.id} onClick={() => { setDivBranch(b.id); }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={divBranch === b.id ? { background: "#4F46E5", color: "#fff" } : { background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--input-border)" }}>
                      {b.id} — {b.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={() => { setShowDivForm(true); setEditDiv(null); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
                    <Plus size={14} /> Add Division
                  </button>
                </div>

                {/* Add/Edit Division form */}
                {(showDivForm || editDiv) && (
                  <div className="rounded-2xl p-4 space-y-3 mt-2" style={cs}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{editDiv ? "Edit Division" : `New Division — ${divBranch}`}</h3>
                      <button onClick={() => { setShowDivForm(false); setEditDiv(null); }}><X size={14} className="text-gray-400" /></button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {editDiv ? (
                        <>
                          <F label="Division Name *"><input className={inp} style={is} value={editDiv.name} onChange={e => setEditDiv({ ...editDiv, name: e.target.value })} /></F>
                          <F label="Division Head"><input className={inp} style={is} value={editDiv.headName} onChange={e => setEditDiv({ ...editDiv, headName: e.target.value })} placeholder="Head's full name" /></F>
                          <F label="Head Email"><input className={inp} style={is} value={editDiv.headEmail} onChange={e => setEditDiv({ ...editDiv, headEmail: e.target.value })} placeholder="email@zagsigns.com" /></F>
                          <F label="Head Phone"><input className={inp} style={is} value={editDiv.headPhone} onChange={e => setEditDiv({ ...editDiv, headPhone: e.target.value })} placeholder="+91…" /></F>
                          <div className="md:col-span-2"><F label="Notes"><input className={inp} style={is} value={editDiv.notes} onChange={e => setEditDiv({ ...editDiv, notes: e.target.value })} /></F></div>
                        </>
                      ) : (
                        <>
                          <F label="Division Name *"><input className={inp} style={is} value={divForm.name} onChange={e => setDivForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sales Division" /></F>
                          <F label="Division Head"><input className={inp} style={is} value={divForm.headName} onChange={e => setDivForm(f => ({ ...f, headName: e.target.value }))} placeholder="Head's full name" /></F>
                          <F label="Head Email"><input className={inp} style={is} value={divForm.headEmail} onChange={e => setDivForm(f => ({ ...f, headEmail: e.target.value }))} placeholder="email@zagsigns.com" /></F>
                          <F label="Head Phone"><input className={inp} style={is} value={divForm.headPhone} onChange={e => setDivForm(f => ({ ...f, headPhone: e.target.value }))} placeholder="+91…" /></F>
                          <div className="md:col-span-2"><F label="Notes"><input className={inp} style={is} value={divForm.notes} onChange={e => setDivForm(f => ({ ...f, notes: e.target.value }))} /></F></div>
                        </>
                      )}
                    </div>
                    <button onClick={editDiv ? handleUpdateDivision : handleAddDivision} disabled={!!loading.divAdd}
                      className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                      {loading.divAdd ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                      {editDiv ? "Update Division" : "Save Division"}
                    </button>
                  </div>
                )}

                {/* Division list */}
                {loading.divisions ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
                ) : filteredDivisions.length === 0 ? (
                  <div className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>No divisions for {divBranch}. Add one above.</div>
                ) : (
                  <div className="space-y-3">
                    {filteredDivisions.map(div => (
                      <div key={div.id} className="rounded-2xl p-4" style={cs}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{div.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-50 text-indigo-600">{div.code}</span>
                              {!div.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Inactive</span>}
                            </div>
                            {div.headName && (
                              <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                                <span className="flex items-center gap-1"><Users size={11} /> {div.headName}</span>
                                {div.headPhone && <span className="flex items-center gap-1"><Phone size={11} /> {div.headPhone}</span>}
                                {div.headEmail && <span className="flex items-center gap-1"><Mail size={11} /> {div.headEmail}</span>}
                              </div>
                            )}
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {div.departments.map(d => (
                                <span key={d.id} className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">{d.name}</span>
                              ))}
                              {div.departments.length === 0 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>No departments yet</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <button onClick={() => { setEditDiv({ ...div }); setShowDivForm(false); }}
                              className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50"><Edit2 size={13} /></button>
                            <button onClick={() => handleDeleteDivision(div.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* ── DEPARTMENTS ─────────────────────────────────────────── */}
            {section === "departments" && (
              <Section title="Departments" sub="Departments within each division. Each department can have its own head.">
                {/* Division selector */}
                <div className="space-y-2 mb-2">
                  <div className="flex flex-wrap gap-2">
                    {BRANCHES.map(b => (
                      <button key={b.id} onClick={() => setDivBranch(b.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold"
                        style={divBranch === b.id ? { background: "#4F46E5", color: "#fff" } : { background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--input-border)" }}>
                        {b.id}
                      </button>
                    ))}
                  </div>
                  <select className={inp} style={{ ...is, maxWidth: "320px" }} value={deptDivId} onChange={e => setDeptDivId(e.target.value)}>
                    <option value="">All Divisions in {divBranch}</option>
                    {deptDivisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => { setShowDeptForm(true); setEditDept(null); setDeptForm(f => ({ ...f, divisionId: deptDivId })); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
                    <Plus size={14} /> Add Department
                  </button>
                </div>

                {/* Add/Edit Department form */}
                {(showDeptForm || editDept) && (
                  <div className="rounded-2xl p-4 space-y-3 mt-2" style={cs}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{editDept ? "Edit Department" : "New Department"}</h3>
                      <button onClick={() => { setShowDeptForm(false); setEditDept(null); }}><X size={14} className="text-gray-400" /></button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {!editDept && (
                        <div className="md:col-span-2">
                          <F label="Division *">
                            <select className={inp} style={is} value={deptForm.divisionId} onChange={e => setDeptForm(f => ({ ...f, divisionId: e.target.value }))}>
                              <option value="">Select Division</option>
                              {divisions.map(d => <option key={d.id} value={d.id}>[{d.branch}] {d.name}</option>)}
                            </select>
                          </F>
                        </div>
                      )}
                      {editDept ? (
                        <>
                          <F label="Department Name *"><input className={inp} style={is} value={editDept.name} onChange={e => setEditDept({ ...editDept, name: e.target.value })} /></F>
                          <F label="Department Head"><input className={inp} style={is} value={editDept.headName} onChange={e => setEditDept({ ...editDept, headName: e.target.value })} /></F>
                          <F label="Head Email"><input className={inp} style={is} value={editDept.headEmail} onChange={e => setEditDept({ ...editDept, headEmail: e.target.value })} /></F>
                          <F label="Head Phone"><input className={inp} style={is} value={editDept.headPhone} onChange={e => setEditDept({ ...editDept, headPhone: e.target.value })} /></F>
                        </>
                      ) : (
                        <>
                          <F label="Department Name *"><input className={inp} style={is} value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sales Operations" /></F>
                          <F label="Department Head"><input className={inp} style={is} value={deptForm.headName} onChange={e => setDeptForm(f => ({ ...f, headName: e.target.value }))} /></F>
                          <F label="Head Email"><input className={inp} style={is} value={deptForm.headEmail} onChange={e => setDeptForm(f => ({ ...f, headEmail: e.target.value }))} /></F>
                          <F label="Head Phone"><input className={inp} style={is} value={deptForm.headPhone} onChange={e => setDeptForm(f => ({ ...f, headPhone: e.target.value }))} /></F>
                        </>
                      )}
                    </div>
                    <button onClick={editDept ? handleUpdateDept : handleAddDept} disabled={!!loading.deptAdd}
                      className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                      {editDept ? "Update Department" : "Save Department"}
                    </button>
                  </div>
                )}

                {/* Department list */}
                {loading.divisions ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
                ) : (
                  <div className="rounded-2xl overflow-hidden" style={cs}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-wide" style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                          <th className="px-4 py-3 text-left">Department</th>
                          <th className="px-4 py-3 text-left">Division</th>
                          <th className="px-4 py-3 text-left">Head</th>
                          <th className="px-4 py-3 text-left">Contact</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                        {divisions.filter(d => d.branch === divBranch).flatMap(div =>
                          (div.departments || []).filter(d => !deptDivId || d.divisionId === deptDivId).map(dept => (
                            <tr key={dept.id} className="hover:opacity-80">
                              <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{dept.name}</td>
                              <td className="px-4 py-3 text-xs"><span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">{div.name}</span></td>
                              <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{dept.headName || "—"}</td>
                              <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{dept.headPhone || dept.headEmail || "—"}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <button onClick={() => setEditDept({ ...dept, headEmail: dept.headEmail || "", headPhone: dept.headPhone || "", headName: dept.headName || "", notes: dept.notes || "" })}
                                    className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50"><Edit2 size={12} /></button>
                                  <button onClick={() => handleDeleteDept(dept.id)}
                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                        {divisions.filter(d => d.branch === divBranch).flatMap(d => d.departments).filter(d => !deptDivId || d.divisionId === deptDivId).length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No departments found. Add one above.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            )}

            {/* ── STAFF & ROLES ───────────────────────────────────────── */}
            {section === "staff" && (
              <Section title="Staff & Roles" sub="All system users grouped by branch and role.">
                {loading.staff ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
                ) : (
                  <>
                    <div className="flex justify-end mb-2">
                      <Link href="/admin/employees" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                        Manage Staff <ExternalLink size={13} />
                      </Link>
                    </div>
                    <div className="rounded-2xl overflow-hidden" style={cs}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs uppercase tracking-wide" style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Branch</th>
                            <th className="px-4 py-3 text-left">Reports To</th>
                            <th className="px-4 py-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                          {users.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No staff found</td></tr>
                          ) : users.map((u: any) => (
                            <tr key={u.id} className="hover:opacity-80">
                              <td className="px-4 py-3">
                                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_INFO[u.role]?.color || "bg-slate-100 text-slate-600"}`}>
                                  {ROLE_INFO[u.role]?.label || u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-indigo-600">{u.branch || "All"}</td>
                              <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{u.reportingTo?.name || "—"}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                  {u.status || (u.isActive ? "ACTIVE" : "INACTIVE")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Section>
            )}

            {/* ── REPORTING STRUCTURE ─────────────────────────────────── */}
            {section === "reporting" && (
              <Section title="Reporting Structure" sub="Hierarchy of who reports to whom across the organisation.">
                {loading.staff ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
                ) : (
                  <div className="space-y-3">
                    {/* Top-level (no reporting to anyone) */}
                    {users.filter((u: any) => !u.reportingToId).map((u: any) => (
                      <div key={u.id} className="rounded-2xl p-4" style={cs}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
                            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ROLE_INFO[u.role]?.label || u.role} {u.branch ? `· ${u.branch}` : "· All Branches"}</p>
                          </div>
                        </div>
                        {u.reportees && u.reportees.length > 0 && (
                          <div className="mt-3 ml-6 pl-4 border-l-2 border-indigo-100 space-y-1.5">
                            {u.reportees.map((r: any) => (
                              <div key={r.id} className="flex items-center gap-2 text-sm">
                                <ChevronRight size={12} className="text-indigo-300" />
                                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{r.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                                  {ROLE_INFO[r.role]?.label || r.role}
                                </span>
                                {r.branch && <span className="text-xs font-bold text-indigo-500">{r.branch}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {users.filter((u: any) => !u.reportingToId).length === 0 && (
                      <div className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
                        No reporting structure configured. Set &quot;Reports To&quot; for each user in Staff management.
                      </div>
                    )}
                  </div>
                )}
              </Section>
            )}

            {/* ── SALES TARGETS ───────────────────────────────────────── */}
            {section === "targets" && (
              <Section title="Sales Targets" sub="Monthly targets by staff. Manage in the Sales module.">
                <div className="rounded-2xl p-8 text-center" style={cs}>
                  <TrendingUp size={32} className="mx-auto mb-3 text-indigo-400" />
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>Sales Targets are managed in the Sales module</p>
                  <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Set monthly call, visit, order and revenue targets per sales executive.</p>
                  <Link href="/sales" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                    Go to Sales Module <ExternalLink size={13} />
                  </Link>
                </div>
              </Section>
            )}

            {/* ── MACHINERY ───────────────────────────────────────────── */}
            {section === "machinery" && (
              <Section title="Machinery" sub="Equipment registered and mapped to each branch.">
                {loading.machinery ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
                ) : (
                  <>
                    <div className="flex justify-end mb-2">
                      <Link href="/production/machines" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                        Manage Machines <ExternalLink size={13} />
                      </Link>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {BRANCHES.filter(b => b.id !== "HO").map(b => {
                        const bm = machines.filter((m: any) => m.branch === b.id);
                        const active = bm.filter((m: any) => m.status === "ACTIVE").length;
                        const byType = bm.reduce((acc: any, m: any) => { acc[m.type] = (acc[m.type] || 0) + 1; return acc; }, {});
                        return (
                          <div key={b.id} className="rounded-2xl p-4" style={cs}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{b.id} — {b.label}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{bm.length} machines</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {active} Active</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> {bm.length - active} Other</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(byType).map(([type, cnt]) => (
                                <span key={type} className="text-xs px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100">
                                  {type} ({cnt as number})
                                </span>
                              ))}
                              {bm.length === 0 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>No machines registered</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </Section>
            )}

            {/* ── INVENTORY MAPPING ───────────────────────────────────── */}
            {section === "inventory" && (
              <Section title="Inventory Mapping" sub="Materials and stock mapped per branch.">
                {loading.inventory ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
                ) : (
                  <>
                    <div className="flex justify-end mb-2">
                      <Link href="/inventory" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                        Manage Inventory <ExternalLink size={13} />
                      </Link>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...BRANCHES.filter(b => b.id !== "HO"), { id: "ALL", label: "Shared / All Branches", short: "ALL" }].map(b => {
                        const bm = b.id === "ALL" ? materials.filter((m: any) => !m.branch) : materials.filter((m: any) => m.branch === b.id);
                        const totalValue = bm.reduce((s: number, m: any) => s + (m.stockValue || 0), 0);
                        const low = bm.filter((m: any) => m.stockStatus === "Low" || m.stockStatus === "Critical").length;
                        return (
                          <div key={b.id} className="rounded-2xl p-4" style={cs}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{b.id === "ALL" ? "Shared Stock" : `${b.id} — ${b.label}`}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{bm.length} items</span>
                            </div>
                            <p className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>₹{(totalValue / 1000).toFixed(1)}K</p>
                            <p className="text-xs" style={{ color: low > 0 ? "#DC2626" : "var(--text-muted)" }}>
                              {low > 0 ? `${low} items low/critical` : "All stock healthy"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </Section>
            )}

            {/* ── SHIFTS & ATTENDANCE ─────────────────────────────────── */}
            {section === "shifts" && (
              <Section title="Shifts & Attendance Config" sub="Operating hours and shift configuration per branch. For machine-type and material configs, see Division Settings.">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {BRANCHES.map(b => (
                    <button key={b.id} onClick={() => setSelectedOpsB(b.id)}
                      className="py-1.5 rounded-lg text-xs font-bold"
                      style={selectedOpsB === b.id ? { background: "#4F46E5", color: "#fff" } : { background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--input-border)" }}>
                      {b.id}
                    </button>
                  ))}
                </div>
                {branchOps[selectedOpsB] ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <F label="Start Time"><input type="time" className={inp} style={is} value={branchOps[selectedOpsB].startTime || "09:00"}
                        onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], startTime: e.target.value } }))} /></F>
                      <F label="End Time"><input type="time" className={inp} style={is} value={branchOps[selectedOpsB].endTime || "18:00"}
                        onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], endTime: e.target.value } }))} /></F>
                      <F label="Shift Hours">
                        <input type="number" min={1} max={24} step={0.5} className={inp} style={is} value={branchOps[selectedOpsB].shiftHours || 8}
                          onChange={e => setBranchOps(o => ({ ...o, [selectedOpsB]: { ...o[selectedOpsB], shiftHours: parseFloat(e.target.value) || 8 } }))} />
                      </F>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {selectedOpsB} operates from {branchOps[selectedOpsB].startTime || "09:00"} to {branchOps[selectedOpsB].endTime || "18:00"} — {branchOps[selectedOpsB].shiftHours || 8}h shift
                    </p>
                    {errors[`ops-${selectedOpsB}`] && <Err msg={errors[`ops-${selectedOpsB}`]} />}
                    {saved[`ops-${selectedOpsB}`]  && <Ok  msg={`${selectedOpsB} shift saved.`} />}
                    <SaveBtn saving={!!saving[`ops-${selectedOpsB}`]} saved={!!saved[`ops-${selectedOpsB}`]} onClick={saveBranchOps} label={`Save ${selectedOpsB} Shifts`} />
                  </>
                ) : (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
                )}
              </Section>
            )}

            {/* ── ROLES & PERMISSIONS ─────────────────────────────────── */}
            {section === "roles" && (
              <Section title="Roles & Permissions" sub="System roles available in ZAG SIGNS ERP. Assign roles during user registration or via HR.">
                <div className="space-y-3">
                  {Object.entries(ROLE_INFO).map(([key, info]) => {
                    const count = users.filter((u: any) => u.role === key).length;
                    return (
                      <div key={key} className="flex items-center gap-4 p-4 rounded-2xl" style={cs}>
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${info.color}`}>{info.label}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{key}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{info.desc}</p>
                        </div>
                        {count > 0 && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600 shrink-0">{count} user{count > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: "var(--input-bg)", color: "var(--text-muted)" }}>
                  Role counts above refresh when you visit the Staff & Roles section first.
                </div>
              </Section>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
      <div>
        <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{title}</h2>
        {sub && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-100">
      <AlertCircle size={14} /> {msg}
    </div>
  );
}

function Ok({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-green-50 text-green-700 border border-green-100">
      <CheckCircle size={14} /> {msg}
    </div>
  );
}
