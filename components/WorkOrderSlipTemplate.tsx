"use client";

// Printable A4 work-order slip. Designed to fit on one page with a half-A4
// variant that can be torn for the customer copy.

export interface WorkOrderSlip {
  ticketNo: string;
  branch: string;
  source: string;            // WALK_IN / PHONE / WHATSAPP / EMAIL / QUOTATION / OTHER
  status: string;
  priority: string;
  customerName: string;
  customerCompany?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  quotationNo?: string;
  natureOfWork: string;
  description: string;
  reference?: string;
  estimatedCost: number;
  advancePaid: number;
  balanceDue: number;
  paymentMode?: string;
  receivedAt: string;        // ISO
  expectedAt?: string | null;
  assignedDesignerName?: string;
  createdByName?: string;
}

export interface SlipCompany {
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  gstNo?: string;
  logoUrl?: string;
}

const DEFAULT_COMPANY: SlipCompany = {
  name: "ZAG SIGNS",
  tagline: "Excellence in Signage Solutions",
  address: "",
  phone: "",
  email: "",
  website: "",
  gstNo: "",
  logoUrl: "/zagsigns-logo.png",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
}
function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })} ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

const SOURCE_LABEL: Record<string, string> = {
  WALK_IN: "Walk-in", PHONE: "Phone Call", WHATSAPP: "WhatsApp",
  EMAIL: "Email", QUOTATION: "From Quotation", OTHER: "Other",
};

export default function WorkOrderSlipTemplate({
  slip, company,
}: { slip: WorkOrderSlip; company?: SlipCompany }) {
  const C = { ...DEFAULT_COMPANY, ...company };

  return (
    <div style={{
      width: "210mm", minHeight: "297mm",
      padding: "12mm 14mm",
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      fontSize: "10pt", color: "#1a1a1a", background: "#fff",
      boxSizing: "border-box",
    }}>
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #4F46E5", paddingBottom: "10px", marginBottom: "14px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {C.logoUrl ? (
            <img src={C.logoUrl} alt="" style={{ width: "60px", height: "60px", objectFit: "contain" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : null}
          <div>
            <div style={{ fontSize: "18pt", fontWeight: 900, color: "#4F46E5", letterSpacing: "1px" }}>{C.name}</div>
            <div style={{ fontSize: "8pt", color: "#6B7280" }}>{C.tagline}</div>
            <div style={{ fontSize: "8pt", color: "#374151", marginTop: "3px", whiteSpace: "pre-line" }}>{C.address}</div>
            <div style={{ fontSize: "8pt", color: "#374151" }}>
              {C.phone ? `Tel: ${C.phone}` : ""}{C.phone && C.email ? "  ·  " : ""}{C.email ? `Email: ${C.email}` : ""}
            </div>
            {C.gstNo && <div style={{ fontSize: "8pt", color: "#374151" }}>GSTIN: {C.gstNo}</div>}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ display: "inline-block", background: "#4F46E5", color: "#fff", padding: "6px 14px", borderRadius: "4px", fontSize: "11pt", fontWeight: 700, letterSpacing: "1px" }}>
            WORK ORDER
          </div>
          <div style={{ marginTop: "6px", fontSize: "11pt", fontWeight: 800, color: "#111" }}>{slip.ticketNo}</div>
          <div style={{ fontSize: "8pt", color: "#6B7280" }}>Branch: {slip.branch}</div>
          <div style={{ fontSize: "8pt", color: "#6B7280" }}>Issued: {fmtDateTime(slip.receivedAt)}</div>
        </div>
      </div>

      {/* ── META STRIP ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "14px" }}>
        <MetaCell label="Source"        value={SOURCE_LABEL[slip.source] ?? slip.source} />
        <MetaCell label="Priority"      value={slip.priority} />
        <MetaCell label="Expected By"   value={fmtDate(slip.expectedAt)} />
        <MetaCell label="Status"        value={slip.status.replace(/_/g, " ")} />
      </div>

      {/* ── CUSTOMER & WORK ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <SectionBox title="CUSTOMER">
          <div style={{ fontSize: "11pt", fontWeight: 700, color: "#111" }}>{slip.customerName}</div>
          {slip.customerCompany && <div style={{ fontSize: "9pt", color: "#374151" }}>{slip.customerCompany}</div>}
          {slip.customerAddress && <div style={{ fontSize: "9pt", color: "#374151", whiteSpace: "pre-line", marginTop: "2px" }}>{slip.customerAddress}</div>}
          <div style={{ fontSize: "9pt", color: "#374151", marginTop: "4px" }}>
            {slip.customerPhone ? `📞 ${slip.customerPhone}` : ""}
          </div>
          {slip.customerEmail && <div style={{ fontSize: "9pt", color: "#374151" }}>✉ {slip.customerEmail}</div>}
        </SectionBox>

        <SectionBox title="WORK DETAILS">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", marginBottom: "3px" }}>
            <span style={{ color: "#6B7280" }}>Nature of Work:</span>
            <span style={{ fontWeight: 600, color: "#111" }}>{slip.natureOfWork}</span>
          </div>
          {slip.reference && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", marginBottom: "3px" }}>
              <span style={{ color: "#6B7280" }}>Reference:</span>
              <span style={{ fontWeight: 600, color: "#111" }}>{slip.reference}</span>
            </div>
          )}
          {slip.quotationNo && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", marginBottom: "3px" }}>
              <span style={{ color: "#6B7280" }}>Quotation:</span>
              <span style={{ fontWeight: 600, color: "#4F46E5" }}>{slip.quotationNo}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt" }}>
            <span style={{ color: "#6B7280" }}>Assigned Designer:</span>
            <span style={{ fontWeight: 600, color: "#111" }}>{slip.assignedDesignerName || "— pending —"}</span>
          </div>
        </SectionBox>
      </div>

      {/* ── DESCRIPTION ── */}
      <SectionBox title="DESCRIPTION OF WORK">
        <div style={{ fontSize: "10pt", color: "#1a1a1a", lineHeight: 1.55, whiteSpace: "pre-line", minHeight: "40px" }}>
          {slip.description}
        </div>
      </SectionBox>

      {/* ── COSTING ── */}
      <div style={{ marginTop: "14px", border: "1px solid #4F46E5", borderRadius: "6px", overflow: "hidden" }}>
        <div style={{ background: "#4F46E5", color: "#fff", padding: "6px 12px", fontSize: "9pt", fontWeight: 700, letterSpacing: "0.5px" }}>
          COSTING & PAYMENT
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
              <td style={{ padding: "8px 12px", fontSize: "9pt", color: "#6B7280", width: "60%" }}>Estimated Cost</td>
              <td style={{ padding: "8px 12px", fontSize: "10pt", fontWeight: 700, textAlign: "right", color: "#111" }}>₹ {fmt(slip.estimatedCost)}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
              <td style={{ padding: "8px 12px", fontSize: "9pt", color: "#6B7280" }}>Advance Paid ({slip.paymentMode || "—"})</td>
              <td style={{ padding: "8px 12px", fontSize: "10pt", fontWeight: 700, textAlign: "right", color: "#16A34A" }}>₹ {fmt(slip.advancePaid)}</td>
            </tr>
            <tr style={{ background: "#F9FAFB" }}>
              <td style={{ padding: "10px 12px", fontSize: "10pt", fontWeight: 700, color: "#111" }}>BALANCE DUE</td>
              <td style={{ padding: "10px 12px", fontSize: "12pt", fontWeight: 900, textAlign: "right", color: "#DC2626" }}>₹ {fmt(slip.balanceDue)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── INSTRUCTIONS ── */}
      <div style={{ marginTop: "14px", fontSize: "8pt", color: "#374151", lineHeight: 1.5, padding: "8px 10px", background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "4px" }}>
        <strong>Designer:</strong> Please pick up this ticket from the system at <code>/my-work</code>,
        complete the design phase, and mark it Done (or Half-Done with reason) before handing over to production.
        Estimated cost is indicative; final invoice may vary based on actual material & service.
      </div>

      {/* ── SIGNATURES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "30px" }}>
        <SignatureBlock label="Received By (Office)" sub={slip.createdByName || ""} />
        <SignatureBlock label="Customer Signature" sub="(I confirm the details above)" />
        <SignatureBlock label="Authorised Signatory" sub="For ZAG SIGNS" />
      </div>

      {/* ── FOOTER ── */}
      <div style={{ marginTop: "20px", paddingTop: "8px", borderTop: "1px dashed #D1D5DB", display: "flex", justifyContent: "space-between", fontSize: "7.5pt", color: "#9CA3AF" }}>
        <span>This is a computer-generated work order. Retain for records.</span>
        <span>{slip.ticketNo}</span>
      </div>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", padding: "6px 8px" }}>
      <div style={{ fontSize: "7.5pt", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: "10pt", color: "#111", fontWeight: 600, marginTop: "1px" }}>{value || "—"}</div>
    </div>
  );
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: "6px", overflow: "hidden" }}>
      <div style={{ background: "#F3F4F6", padding: "5px 10px", fontSize: "8pt", fontWeight: 700, color: "#374151", letterSpacing: "0.5px" }}>{title}</div>
      <div style={{ padding: "8px 10px" }}>{children}</div>
    </div>
  );
}

function SignatureBlock({ label, sub }: { label: string; sub: string }) {
  return (
    <div>
      <div style={{ height: "40px", borderBottom: "1px solid #6B7280" }} />
      <div style={{ marginTop: "4px", fontSize: "9pt", fontWeight: 700, color: "#111" }}>{label}</div>
      {sub && <div style={{ fontSize: "7.5pt", color: "#9CA3AF" }}>{sub}</div>}
    </div>
  );
}
