"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { api } from "@/lib/api-client";
import {
  Building2, CreditCard, FileText, Save, CheckCircle,
  Loader2, AlertCircle, Landmark, Settings2, Plus, Trash2,
} from "lucide-react";

interface CompanySettings {
  name: string; tagline: string; address: string;
  phone: string; email: string; website: string;
  gstNo: string; panNo: string; logoUrl: string;
  bankName: string; bankBranch: string; accountNo: string;
  ifscCode: string; accountType: string;
  defaultTerms: string; validityDays: number;
  paymentQrUrl: string;
}

interface BranchSettings {
  id: string;
  bankName: string; bankBranch: string; accountNo: string;
  ifscCode: string; accountType: string;
}

interface MachineTypeConfig {
  type: string;
  defaultRate: number;
  printTypes: string[];
  enabled: boolean;
}

interface DivisionSetting {
  id: string;
  displayName: string;
  address: string;
  contactName: string;
  contactPhone: string;
  startTime: string;
  endTime: string;
  shiftHours: number;
  machineTypes: MachineTypeConfig[];
  materialCategories: string[];
  notes: string;
}

const DEFAULT_TERMS = [
  "Payment due within 15 days of invoice date.",
  "50% advance required to commence production.",
  "Goods once sold will not be taken back.",
  "This is a computer-generated quotation and does not require a signature to be valid.",
  "Price quoted is valid for 30 days from the date of quotation.",
  "Delivery timeline starts from receipt of advance & approved artwork.",
].join("\n");

const BRANCHES = [
  { id: "HO",   label: "Head Office" },
  { id: "TVM",  label: "Thiruvananthapuram" },
  { id: "KTYM", label: "Kottayam" },
  { id: "EKM",  label: "Ernakulam" },
  { id: "CLT",  label: "Calicut" },
];

const BRANCH_SHORT = ["HO", "TVM", "KTYM", "EKM", "CLT"];

const DEFAULT_MACHINE_TYPES: MachineTypeConfig[] = [
  { type: "Printing",         defaultRate: 0, printTypes: ["Flex", "Vinyl"],           enabled: false },
  { type: "UV Printing",      defaultRate: 0, printTypes: ["Acrylic", "ACP"],          enabled: false },
  { type: "Digital Printing", defaultRate: 0, printTypes: ["Cloth", "Canvas"],         enabled: false },
  { type: "Cutting",          defaultRate: 0, printTypes: [],                           enabled: false },
  { type: "Laminating",       defaultRate: 0, printTypes: [],                           enabled: false },
  { type: "Framing",          defaultRate: 0, printTypes: [],                           enabled: false },
  { type: "Fabrication",      defaultRate: 0, printTypes: [],                           enabled: false },
  { type: "LED/Electrical",   defaultRate: 0, printTypes: [],                           enabled: false },
  { type: "Binding",          defaultRate: 0, printTypes: [],                           enabled: false },
];

const ALL_CATEGORIES = ["Flex", "Vinyl", "ACP", "Acrylic", "LED", "Metal", "Electrical", "Ink", "Hardware", "Other"];
const ALL_PRINT_TYPES = ["Flex", "Vinyl", "Sticker", "Paper", "Cloth", "ACP", "Acrylic", "Canvas", "Backlit"];

const BLANK_DIVISION: DivisionSetting = {
  id: "TVM", displayName: "", address: "", contactName: "", contactPhone: "",
  startTime: "09:00", endTime: "18:00", shiftHours: 8,
  machineTypes: DEFAULT_MACHINE_TYPES, materialCategories: [], notes: "",
};

const TABS = [
  { id: "company",   label: "Company Info",       icon: <Building2 size={15} /> },
  { id: "bank",      label: "Bank Details",        icon: <CreditCard size={15} /> },
  { id: "branches",  label: "Branch Banks",        icon: <Landmark size={15} /> },
  { id: "division",  label: "Division Settings",   icon: <Settings2 size={15} /> },
  { id: "quotation", label: "Quotation",           icon: <FileText size={15} /> },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border rounded-xl px-3 py-2 text-sm"
      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
    />
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("company");
  const [form, setForm] = useState<CompanySettings>({
    name: "", tagline: "", address: "", phone: "", email: "", website: "",
    gstNo: "", panNo: "", logoUrl: "",
    bankName: "", bankBranch: "", accountNo: "", ifscCode: "", accountType: "Current Account",
    defaultTerms: DEFAULT_TERMS, validityDays: 30, paymentQrUrl: "",
  });
  const [branchSettings,    setBranchSettings]    = useState<Record<string, BranchSettings>>({});
  const [divisionSettings,  setDivisionSettings]  = useState<Record<string, DivisionSetting>>({});
  const [selectedBranch,    setSelectedBranch]    = useState("HO");
  const [selectedDivBranch, setSelectedDivBranch] = useState("TVM");
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [branchSaving, setBranchSaving] = useState(false);
  const [divSaving,    setDivSaving]    = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [branchSaved,  setBranchSaved]  = useState(false);
  const [divSaved,     setDivSaved]     = useState(false);
  const [error,        setError]        = useState("");
  const [branchError,  setBranchError]  = useState("");
  const [divError,     setDivError]     = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyRes = await api.get<{ data: CompanySettings }>("/settings");
        setForm(f => ({ ...f, ...companyRes.data }));

        const branchPromises = BRANCHES.map(branch =>
          api.get<{ data: BranchSettings }>(`/branch-settings?branch=${branch.id}`)
            .then(res => ({ id: branch.id, data: res.data }))
            .catch(() => ({ id: branch.id, data: { id: branch.id, bankName: "", bankBranch: "", accountNo: "", ifscCode: "", accountType: "Current Account" } }))
        );
        const branchResults = await Promise.all(branchPromises);
        const bMap: Record<string, BranchSettings> = {};
        branchResults.forEach(({ id, data }) => { bMap[id] = data; });
        setBranchSettings(bMap);

        const divPromises = BRANCH_SHORT.map(branchId =>
          api.get<{ data: DivisionSetting }>(`/admin/branch-ops?branch=${branchId}`)
            .then(res => ({ id: branchId, data: res.data }))
            .catch(() => ({ id: branchId, data: { ...BLANK_DIVISION, id: branchId } }))
        );
        const divResults = await Promise.all(divPromises);
        const dMap: Record<string, DivisionSetting> = {};
        divResults.forEach(({ id, data }) => {
          dMap[id] = {
            ...BLANK_DIVISION,
            ...data,
            machineTypes: data.machineTypes?.length ? data.machineTypes : DEFAULT_MACHINE_TYPES,
          };
        });
        setDivisionSettings(dMap);
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const set = (key: keyof CompanySettings) => (val: string | number) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      await api.put("/settings", form);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save settings."); }
    finally { setSaving(false); }
  };

  const handleBranchSave = async () => {
    setBranchSaving(true); setBranchError(""); setBranchSaved(false);
    try {
      const current = branchSettings[selectedBranch];
      await api.put("/branch-settings", { branch: selectedBranch, ...current });
      setBranchSaved(true); setTimeout(() => setBranchSaved(false), 3000);
    } catch (e) { setBranchError(e instanceof Error ? e.message : "Failed to save branch settings."); }
    finally { setBranchSaving(false); }
  };

  const setBranch = (key: keyof BranchSettings) => (val: string) => {
    setBranchSettings(prev => ({ ...prev, [selectedBranch]: { ...prev[selectedBranch], [key]: val } }));
  };

  // ─── Division helpers ─────────────────────────────────────────────────────
  const curDiv = divisionSettings[selectedDivBranch] ?? { ...BLANK_DIVISION, id: selectedDivBranch };

  const setDiv = (key: keyof DivisionSetting) => (val: any) => {
    setDivisionSettings(prev => ({ ...prev, [selectedDivBranch]: { ...prev[selectedDivBranch], [key]: val } }));
  };

  const toggleMachineType = (idx: number) => {
    const mt = [...curDiv.machineTypes];
    mt[idx] = { ...mt[idx], enabled: !mt[idx].enabled };
    setDiv("machineTypes")(mt);
  };

  const setMachineRate = (idx: number, rate: number) => {
    const mt = [...curDiv.machineTypes];
    mt[idx] = { ...mt[idx], defaultRate: rate };
    setDiv("machineTypes")(mt);
  };

  const toggleMachinePrintType = (machineIdx: number, pt: string) => {
    const mt = [...curDiv.machineTypes];
    const pts = mt[machineIdx].printTypes.includes(pt)
      ? mt[machineIdx].printTypes.filter(p => p !== pt)
      : [...mt[machineIdx].printTypes, pt];
    mt[machineIdx] = { ...mt[machineIdx], printTypes: pts };
    setDiv("machineTypes")(mt);
  };

  const toggleCategory = (cat: string) => {
    const cats = curDiv.materialCategories.includes(cat)
      ? curDiv.materialCategories.filter(c => c !== cat)
      : [...curDiv.materialCategories, cat];
    setDiv("materialCategories")(cats);
  };

  const handleDivSave = async () => {
    setDivSaving(true); setDivError(""); setDivSaved(false);
    try {
      await api.put("/admin/branch-ops", { branch: selectedDivBranch, ...curDiv });
      setDivSaved(true); setTimeout(() => setDivSaved(false), 3000);
    } catch (e) { setDivError(e instanceof Error ? e.message : "Failed to save division settings."); }
    finally { setDivSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );

  const inp = "w-full border rounded-xl px-3 py-2 text-sm";
  const inpStyle = { background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <TopBar
        title="Company Settings"
        subtitle="Admin"
        actions={
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> :
             saved  ? <><CheckCircle size={14} /> Saved!</> :
             <><Save size={14} /> Save Changes</>}
          </button>
        }
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-100">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-green-50 text-green-700 border border-green-100">
            <CheckCircle size={15} /> Settings saved — all new quotations will use these details.
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={tab === t.id ? { background: "#4F46E5", color: "#fff" } : { color: "var(--text-secondary)" }}>
              {t.icon} <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── COMPANY INFO ─────────────────────────────────────────────────── */}
        {tab === "company" && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Company Information</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>These details appear on the quotation header and footer.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Company Name *"><Input value={form.name} onChange={set("name")} placeholder="ZAG SIGNS" /></Field>
              <Field label="Tagline / Slogan"><Input value={form.tagline} onChange={set("tagline")} placeholder="Excellence in Signage Solutions" /></Field>
            </div>
            <Field label="Full Address *" hint="Include city, state, PIN code">
              <textarea value={form.address} onChange={e => set("address")(e.target.value)} rows={2}
                placeholder="123 Industrial Area, Thiruvananthapuram, Kerala – 695 001"
                className="w-full border rounded-xl px-3 py-2 text-sm resize-none" style={inpStyle} />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Phone Number"><Input value={form.phone} onChange={set("phone")} placeholder="+91 94470 00000" /></Field>
              <Field label="Email Address"><Input value={form.email} onChange={set("email")} placeholder="info@zagsigns.com" type="email" /></Field>
              <Field label="Website"><Input value={form.website} onChange={set("website")} placeholder="www.zagsigns.com" /></Field>
              <Field label="GST Number (GSTIN)"><Input value={form.gstNo} onChange={set("gstNo")} placeholder="32AAAAA0000A1Z5" /></Field>
              <Field label="PAN Number"><Input value={form.panNo} onChange={set("panNo")} placeholder="AAAAA0000A" /></Field>
              <Field label="Logo URL" hint="Leave blank to use the ZAG monogram.">
                <Input value={form.logoUrl} onChange={set("logoUrl")} placeholder="https://yoursite.com/logo.png" />
              </Field>
            </div>
            {form.logoUrl && (
              <div className="p-3 rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Logo preview:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logoUrl} alt="Company logo" className="h-12 object-contain" onError={e => (e.currentTarget.style.display = "none")} />
              </div>
            )}
            <div className="p-4 rounded-xl border mt-2" style={{ borderColor: "var(--card-border)", background: "var(--background)" }}>
              <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>Quotation header preview:</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "2px solid #4F46E5", paddingBottom: "10px" }}>
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logoUrl} alt="logo" style={{ height: "40px", objectFit: "contain" }} />
                ) : (
                  <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontWeight: "900", fontSize: "13px" }}>{(form.name || "ZAG").substring(0, 3).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "900", color: "#4F46E5" }}>{form.name || "Company Name"}</div>
                  <div style={{ fontSize: "9px", color: "#6B7280" }}>{form.tagline}</div>
                  <div style={{ fontSize: "9px", color: "#374151" }}>{form.address || "Address not set"}</div>
                  <div style={{ fontSize: "9px", color: "#374151" }}>
                    {[form.phone, form.email, form.website].filter(Boolean).join("  |  ") || "Contact details not set"}
                  </div>
                  {(form.gstNo || form.panNo) && (
                    <div style={{ fontSize: "9px", color: "#374151" }}>
                      {form.gstNo && `GSTIN: ${form.gstNo}`}{form.gstNo && form.panNo ? "  |  " : ""}{form.panNo && `PAN: ${form.panNo}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BANK DETAILS ─────────────────────────────────────────────────── */}
        {tab === "bank" && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Bank Details</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Printed on every quotation so customers know where to transfer payment.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Bank Name"><Input value={form.bankName} onChange={set("bankName")} placeholder="State Bank of India" /></Field>
              <Field label="Branch Name"><Input value={form.bankBranch} onChange={set("bankBranch")} placeholder="Thiruvananthapuram Main Branch" /></Field>
              <Field label="Account Number"><Input value={form.accountNo} onChange={set("accountNo")} placeholder="00000 00000 00000" /></Field>
              <Field label="IFSC Code"><Input value={form.ifscCode} onChange={set("ifscCode")} placeholder="SBIN0000000" /></Field>
              <Field label="Account Type">
                <select value={form.accountType} onChange={e => set("accountType")(e.target.value)}
                  className={inp} style={inpStyle}>
                  <option>Current Account</option>
                  <option>Savings Account</option>
                  <option>OD Account</option>
                </select>
              </Field>
              <Field label="Payment QR Code URL" hint="UPI / GPay / PhonePe QR image URL">
                <Input value={form.paymentQrUrl} onChange={set("paymentQrUrl")} placeholder="https://…/payment-qr.png" />
              </Field>
            </div>
          </div>
        )}

        {/* ── BRANCH BANK SETTINGS ─────────────────────────────────────────── */}
        {tab === "branches" && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Branch-Specific Bank Details</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Different bank accounts for each branch. These details appear on quotations based on the branch.</p>
            {branchError && <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-100"><AlertCircle size={15} /> {branchError}</div>}
            {branchSaved && <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-green-50 text-green-700 border border-green-100"><CheckCircle size={15} /> Branch bank details saved.</div>}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BRANCHES.map(b => (
                <button key={b.id} onClick={() => setSelectedBranch(b.id)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={selectedBranch === b.id ? { background: "#4F46E5", color: "#fff" } : { background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--input-border)" }}>
                  {b.label}
                </button>
              ))}
            </div>
            {branchSettings[selectedBranch] && (
              <div className="space-y-4 mt-6 pt-6 border-t" style={{ borderColor: "var(--card-border)" }}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Bank Name"><Input value={branchSettings[selectedBranch].bankName} onChange={setBranch("bankName")} placeholder="State Bank of India" /></Field>
                  <Field label="Branch Name"><Input value={branchSettings[selectedBranch].bankBranch} onChange={setBranch("bankBranch")} placeholder="Branch Name" /></Field>
                  <Field label="Account Number"><Input value={branchSettings[selectedBranch].accountNo} onChange={setBranch("accountNo")} placeholder="00000 00000 00000" /></Field>
                  <Field label="IFSC Code"><Input value={branchSettings[selectedBranch].ifscCode} onChange={setBranch("ifscCode")} placeholder="SBIN0000000" /></Field>
                  <Field label="Account Type">
                    <select value={branchSettings[selectedBranch].accountType} onChange={e => setBranch("accountType")(e.target.value)}
                      className={inp} style={inpStyle}>
                      <option>Current Account</option>
                      <option>Savings Account</option>
                      <option>OD Account</option>
                    </select>
                  </Field>
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={handleBranchSave} disabled={branchSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                    {branchSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> :
                     branchSaved  ? <><CheckCircle size={14} /> Saved!</> :
                     <><Save size={14} /> Save for {BRANCHES.find(b => b.id === selectedBranch)?.label}</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DIVISION SETTINGS ────────────────────────────────────────────── */}
        {tab === "division" && (
          <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Division / Branch Settings</h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Per-branch operational config — machine types, working hours, materials active at each unit.
              </p>
            </div>

            {divError && <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-100"><AlertCircle size={15} /> {divError}</div>}
            {divSaved && <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-green-50 text-green-700 border border-green-100"><CheckCircle size={15} /> Division settings saved for {selectedDivBranch}.</div>}

            {/* Branch selector */}
            <div className="grid grid-cols-5 gap-2">
              {BRANCH_SHORT.map(b => (
                <button key={b} onClick={() => setSelectedDivBranch(b)}
                  className="py-2 rounded-lg text-sm font-bold transition-all"
                  style={selectedDivBranch === b ? { background: "#4F46E5", color: "#fff" } : { background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--input-border)" }}>
                  {b}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t space-y-6" style={{ borderColor: "var(--card-border)" }}>
              {/* ─ Contact & Location ─ */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-secondary)" }}>Branch Contact & Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Display Name">
                    <input className={inp} style={inpStyle} value={curDiv.displayName}
                      onChange={e => setDiv("displayName")(e.target.value)} placeholder={`ZAG SIGNS ${selectedDivBranch}`} />
                  </Field>
                  <Field label="Contact Person">
                    <input className={inp} style={inpStyle} value={curDiv.contactName}
                      onChange={e => setDiv("contactName")(e.target.value)} placeholder="Branch Manager Name" />
                  </Field>
                  <Field label="Contact Phone">
                    <input className={inp} style={inpStyle} value={curDiv.contactPhone}
                      onChange={e => setDiv("contactPhone")(e.target.value)} placeholder="+91 94470 00000" />
                  </Field>
                  <Field label="Notes">
                    <input className={inp} style={inpStyle} value={curDiv.notes}
                      onChange={e => setDiv("notes")(e.target.value)} placeholder="Any branch-specific notes" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Branch Address">
                      <textarea rows={2} className="w-full border rounded-xl px-3 py-2 text-sm resize-none" style={inpStyle}
                        value={curDiv.address} onChange={e => setDiv("address")(e.target.value)}
                        placeholder="Full address of this branch" />
                    </Field>
                  </div>
                </div>
              </div>

              {/* ─ Operating Hours ─ */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-secondary)" }}>Operating Hours</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Start Time">
                    <input type="time" className={inp} style={inpStyle} value={curDiv.startTime}
                      onChange={e => setDiv("startTime")(e.target.value)} />
                  </Field>
                  <Field label="End Time">
                    <input type="time" className={inp} style={inpStyle} value={curDiv.endTime}
                      onChange={e => setDiv("endTime")(e.target.value)} />
                  </Field>
                  <Field label="Shift Hours">
                    <input type="number" min={1} max={24} step={0.5} className={inp} style={inpStyle}
                      value={curDiv.shiftHours} onChange={e => setDiv("shiftHours")(parseFloat(e.target.value) || 8)} />
                  </Field>
                </div>
              </div>

              {/* ─ Machine Types ─ */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-secondary)" }}>Machine Types at this Branch</h3>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Enable the machine categories available at {selectedDivBranch} and set default hourly rates. These rates are used when scheduling jobs.</p>
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--card-border)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide" style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                        <th className="px-4 py-2 text-left w-8"></th>
                        <th className="px-4 py-2 text-left">Machine Type</th>
                        <th className="px-4 py-2 text-left">Default Rate (₹/hr)</th>
                        <th className="px-4 py-2 text-left">Applicable Print Types</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                      {curDiv.machineTypes.map((mt, idx) => (
                        <tr key={mt.type} className={mt.enabled ? "" : "opacity-50"}>
                          <td className="px-4 py-2">
                            <button onClick={() => toggleMachineType(idx)}
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                mt.enabled ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
                              }`}>
                              {mt.enabled && <span className="text-white text-xs font-bold">✓</span>}
                            </button>
                          </td>
                          <td className="px-4 py-2 font-medium" style={{ color: "var(--text-primary)" }}>{mt.type}</td>
                          <td className="px-4 py-2">
                            <input type="number" min={0} step={10} disabled={!mt.enabled}
                              className="border rounded-lg px-2 py-1 text-sm w-24 disabled:opacity-40"
                              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
                              value={mt.defaultRate} onChange={e => setMachineRate(idx, parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {ALL_PRINT_TYPES.map(pt => (
                                <button key={pt} disabled={!mt.enabled}
                                  onClick={() => toggleMachinePrintType(idx, pt)}
                                  className={`text-xs px-2 py-0.5 rounded-full border transition-all disabled:opacity-30 ${
                                    mt.printTypes.includes(pt) ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "border-gray-200 text-gray-500"
                                  }`}>
                                  {pt}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─ Material Categories ─ */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-secondary)" }}>Active Material Categories</h3>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Check the categories of materials that are stocked / used at {selectedDivBranch}. Used to filter inventory views for this branch.</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map(cat => {
                    const active = curDiv.materialCategories.includes(cat);
                    return (
                      <button key={cat} onClick={() => toggleCategory(cat)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
                        style={active ? { background: "#4F46E5", color: "#fff", borderColor: "#4F46E5" } :
                          { background: "var(--input-bg)", color: "var(--text-secondary)", borderColor: "var(--input-border)" }}>
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  {curDiv.materialCategories.length === 0 ? "None selected — all categories will be shown." : `Active: ${curDiv.materialCategories.join(", ")}`}
                </p>
              </div>

              {/* Save */}
              <div className="flex gap-2 pt-2">
                <button onClick={handleDivSave} disabled={divSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                  {divSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> :
                   divSaved  ? <><CheckCircle size={14} /> Saved!</> :
                   <><Save size={14} /> Save {selectedDivBranch} Settings</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── QUOTATION SETTINGS ────────────────────────────────────────────── */}
        {tab === "quotation" && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Quotation Settings</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Default values pre-filled when creating or printing quotations.</p>
            <Field label="Default Validity (days)" hint="Number of days a quotation is valid.">
              <input type="number" min={1} max={365} value={form.validityDays}
                onChange={e => set("validityDays")(Number(e.target.value))}
                className="w-32 border rounded-xl px-3 py-2 text-sm" style={inpStyle} />
            </Field>
            <Field label="Default Terms & Conditions" hint="One term per line. These appear on every quotation.">
              <textarea value={form.defaultTerms} onChange={e => set("defaultTerms")(e.target.value)} rows={10}
                placeholder="Payment due within 15 days of invoice date.\n50% advance required to commence production.\n..."
                className="w-full border rounded-xl px-3 py-2 text-sm font-mono resize-y" style={inpStyle} />
            </Field>
            {form.defaultTerms && (
              <div className="p-4 rounded-xl border" style={{ borderColor: "var(--card-border)", background: "var(--background)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Terms & Conditions preview:</p>
                <div style={{ border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "6px" }}>TERMS &amp; CONDITIONS</div>
                  <ol style={{ margin: 0, padding: "0 0 0 14px", fontSize: "9px", color: "#374151", lineHeight: "1.6" }}>
                    {form.defaultTerms.split("\n").filter(Boolean).map((t, i) => <li key={i}>{t}</li>)}
                  </ol>
                </div>
              </div>
            )}
            <button onClick={() => set("defaultTerms")(DEFAULT_TERMS)} className="text-xs text-indigo-500 underline">
              Reset to default ZAG SIGNS terms
            </button>
          </div>
        )}

        {/* Save footer (only for company/bank/quotation tabs) */}
        {["company", "bank", "quotation"].includes(tab) && (
          <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Changes take effect on all new quotations immediately after saving.
            </p>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> :
               saved  ? <><CheckCircle size={14} /> Saved!</> :
               <><Save size={14} /> Save Settings</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
