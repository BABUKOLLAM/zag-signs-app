"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { api } from "@/lib/api-client";
import {
  Building2, CreditCard, FileText, Save, CheckCircle,
  Loader2, AlertCircle, Eye,
} from "lucide-react";

interface CompanySettings {
  name: string; tagline: string; address: string;
  phone: string; email: string; website: string;
  gstNo: string; panNo: string; logoUrl: string;
  bankName: string; bankBranch: string; accountNo: string;
  ifscCode: string; accountType: string;
  defaultTerms: string; validityDays: number;
}

const DEFAULT_TERMS = [
  "Payment due within 15 days of invoice date.",
  "50% advance required to commence production.",
  "Goods once sold will not be taken back.",
  "This is a computer-generated quotation and does not require a signature to be valid.",
  "Price quoted is valid for 30 days from the date of quotation.",
  "Delivery timeline starts from receipt of advance & approved artwork.",
].join("\n");

const TABS = [
  { id: "company",    label: "Company Info",  icon: <Building2 size={15} /> },
  { id: "bank",       label: "Bank Details",  icon: <CreditCard size={15} /> },
  { id: "quotation",  label: "Quotation",     icon: <FileText size={15} /> },
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
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
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
    defaultTerms: DEFAULT_TERMS, validityDays: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    api.get<{ data: CompanySettings }>("/settings")
      .then(r => setForm(f => ({ ...f, ...r.data })))
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof CompanySettings) => (val: string | number) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await api.put("/settings", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings. Check your permissions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <TopBar
        title="Company Settings"
        subtitle="Admin"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : saved
                ? <><CheckCircle size={14} /> Saved!</>
                : <><Save size={14} /> Save Changes</>
            }
          </button>
        }
      />

      <div className="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-5">

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
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all"
              style={tab === t.id
                ? { background: "#4F46E5", color: "#fff" }
                : { color: "var(--text-secondary)" }
              }
            >
              {t.icon} <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── COMPANY INFO TAB ─────────────────────────────────────────── */}
        {tab === "company" && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Company Information</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              These details appear on the quotation header and footer.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Company Name *">
                <Input value={form.name} onChange={set("name")} placeholder="ZAG SIGNS" />
              </Field>
              <Field label="Tagline / Slogan">
                <Input value={form.tagline} onChange={set("tagline")} placeholder="Excellence in Signage Solutions" />
              </Field>
            </div>

            <Field label="Full Address *" hint="Include city, state, PIN code">
              <textarea
                value={form.address}
                onChange={e => set("address")(e.target.value)}
                rows={2}
                placeholder="123 Industrial Area, Thiruvananthapuram, Kerala – 695 001"
                className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
                style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Phone Number">
                <Input value={form.phone} onChange={set("phone")} placeholder="+91 94470 00000" />
              </Field>
              <Field label="Email Address">
                <Input value={form.email} onChange={set("email")} placeholder="info@zagsigns.com" type="email" />
              </Field>
              <Field label="Website">
                <Input value={form.website} onChange={set("website")} placeholder="www.zagsigns.com" />
              </Field>
              <Field label="GST Number (GSTIN)">
                <Input value={form.gstNo} onChange={set("gstNo")} placeholder="32AAAAA0000A1Z5" />
              </Field>
              <Field label="PAN Number">
                <Input value={form.panNo} onChange={set("panNo")} placeholder="AAAAA0000A" />
              </Field>
              <Field label="Logo URL" hint="Paste a public image URL. Leave blank to use the ZAG monogram.">
                <Input value={form.logoUrl} onChange={set("logoUrl")} placeholder="https://yoursite.com/logo.png" />
              </Field>
            </div>

            {/* Logo preview */}
            {form.logoUrl && (
              <div className="p-3 rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Logo preview:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logoUrl} alt="Company logo" className="h-12 object-contain" onError={e => (e.currentTarget.style.display = "none")} />
              </div>
            )}

            {/* Quotation header preview */}
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

        {/* ── BANK DETAILS TAB ─────────────────────────────────────────── */}
        {tab === "bank" && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Bank Details</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Printed on every quotation so customers know where to transfer payment.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Bank Name">
                <Input value={form.bankName} onChange={set("bankName")} placeholder="State Bank of India" />
              </Field>
              <Field label="Branch Name">
                <Input value={form.bankBranch} onChange={set("bankBranch")} placeholder="Thiruvananthapuram Main Branch" />
              </Field>
              <Field label="Account Number">
                <Input value={form.accountNo} onChange={set("accountNo")} placeholder="00000 00000 00000" />
              </Field>
              <Field label="IFSC Code">
                <Input value={form.ifscCode} onChange={set("ifscCode")} placeholder="SBIN0000000" />
              </Field>
              <Field label="Account Type">
                <select
                  value={form.accountType}
                  onChange={e => set("accountType")(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                  style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
                >
                  <option>Current Account</option>
                  <option>Savings Account</option>
                  <option>OD Account</option>
                </select>
              </Field>
            </div>

            {/* Bank preview */}
            <div className="p-4 rounded-xl border mt-2" style={{ borderColor: "var(--card-border)", background: "var(--background)" }}>
              <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>Bank section preview (on quotation):</p>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 12px" }}>
                <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "6px" }}>BANK DETAILS</div>
                {[
                  ["Bank Name", form.bankName || "—"],
                  ["Branch", form.bankBranch || "—"],
                  ["Account No", form.accountNo || "—"],
                  ["IFSC Code", form.ifscCode || "—"],
                  ["Account Type", form.accountType || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: "12px", fontSize: "10px", marginBottom: "3px" }}>
                    <span style={{ color: "#6B7280", minWidth: "80px" }}>{k}</span>
                    <span style={{ fontWeight: "600" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── QUOTATION SETTINGS TAB ───────────────────────────────────── */}
        {tab === "quotation" && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Quotation Settings</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Default values pre-filled when creating or printing quotations.
            </p>

            <Field label="Default Validity (days)" hint="Number of days a quotation is valid. Used as default when creating new quotations.">
              <input
                type="number"
                min={1}
                max={365}
                value={form.validityDays}
                onChange={e => set("validityDays")(Number(e.target.value))}
                className="w-32 border rounded-xl px-3 py-2 text-sm"
                style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
              />
            </Field>

            <Field
              label="Default Terms & Conditions"
              hint="One term per line. These appear on every quotation unless overridden per-quotation."
            >
              <textarea
                value={form.defaultTerms}
                onChange={e => set("defaultTerms")(e.target.value)}
                rows={10}
                placeholder={"Payment due within 15 days of invoice date.\n50% advance required to commence production.\n..."}
                className="w-full border rounded-xl px-3 py-2 text-sm font-mono resize-y"
                style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
              />
            </Field>

            {/* Terms preview */}
            {form.defaultTerms && (
              <div className="p-4 rounded-xl border" style={{ borderColor: "var(--card-border)", background: "var(--background)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Terms & Conditions preview (on quotation):</p>
                <div style={{ border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "6px" }}>TERMS &amp; CONDITIONS</div>
                  <ol style={{ margin: 0, padding: "0 0 0 14px", fontSize: "9px", color: "#374151", lineHeight: "1.6" }}>
                    {form.defaultTerms.split("\n").filter(Boolean).map((t, i) => <li key={i}>{t}</li>)}
                  </ol>
                </div>
              </div>
            )}

            {/* Load defaults button */}
            <button
              onClick={() => set("defaultTerms")(DEFAULT_TERMS)}
              className="text-xs text-indigo-500 underline"
            >
              Reset to default ZAG SIGNS terms
            </button>
          </div>
        )}

        {/* Save footer */}
        <div
          className="flex items-center justify-between rounded-2xl p-4"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Changes take effect on all new quotations immediately after saving.
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : saved
                ? <><CheckCircle size={14} /> Saved!</>
                : <><Save size={14} /> Save Settings</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
