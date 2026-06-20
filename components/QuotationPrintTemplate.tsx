// ─── QUOTATION PRINT TEMPLATE ────────────────────────────────────────────────
// Redesigned layout:
//  • "QUOTATION" centred below the blue letterhead line
//  • Ref number format: ZAG/Q/BRANCH/001
//  • Salutation + Kind Attn on Bill To
//  • Our Payment Details (renamed) with optional QR image
//  • "Accepted by" block with Name / Designation lines
//  • "Digitally Signed" for ZAG authorised signatory
//  • QR code (via qrserver.com) for quotation reference
//  • Proposed-by footer
// ─────────────────────────────────────────────────────────────────────────────

export interface CompanyConfig {
  name: string; tagline: string; address: string;
  phone: string; email: string; website: string;
  gstNo: string; panNo: string; logoUrl?: string;
  defaultTerms: string;
  paymentQrUrl?: string;
}

export interface BankConfig {
  bankName: string; bankBranch: string; accountNo: string;
  ifscCode: string; accountType: string;
}

const DEFAULT_COMPANY: CompanyConfig = {
  name:    "ZAG SIGNS",
  tagline: "Excellence in Signage Solutions",
  address: "TC 44/848/5, Sainarayana Building, Edapazhinji Road, Vazhuthakkad, Thiruvananthapuram – 695 014, Kerala",
  phone:   "+91 98953 73806 / +91 62820 50921",
  email:   "zagadvt@gmail.com",
  website: "www.zagsigns.com",
  gstNo:   "32ATXPK5181A1ZO",
  panNo:   "",
  defaultTerms: [
    "Payment due within 15 days of invoice date.",
    "50% advance required to commence production.",
    "Goods once sold will not be taken back.",
    "Price quoted is valid for 30 days from the date of quotation.",
    "Delivery timeline starts from receipt of advance & approved artwork.",
    "Disputes, if any, are subject to Thiruvananthapuram jurisdiction.",
  ].join("\n"),
};

const DEFAULT_BANK: BankConfig = {
  bankName:    "Dhanlaxmi Bank",
  bankBranch:  "Vazhuthakkad",
  accountNo:   "003705300009231",
  ifscCode:    "DLXB0000231",
  accountType: "Current Account",
};

export interface QuotationItem {
  description: string; qty: number; unit: string; unitPrice: number; total: number;
}

export interface QuotationData {
  quotationNo: string; createdAt: string; validUntil: string;
  status: string; statusLabel: string;
  customer: { name: string; company: string } | null;
  customerName?: string;
  salutation?: string;
  attentionSalutation?: string;
  attentionName?: string;
  branch?: string;
  proposedByName?: string;
  proposedByDesignation?: string;
  proposedByBranch?: string;
  items: QuotationItem[];
  subtotal: number; taxRate: number; tax: number; discount: number; total: number;
  terms: string; notes: string;
}

function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function numberToWords(n: number): string {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const int = Math.floor(n);
  if (int === 0) return "Zero Rupees Only";
  function chunk(x: number): string {
    if (x === 0) return "";
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x/10)] + (x % 10 ? " " + ones[x % 10] : "");
    return ones[Math.floor(x/100)] + " Hundred" + (x % 100 ? " " + chunk(x % 100) : "");
  }
  let w = "";
  const cr = Math.floor(int/10000000); if (cr) w += chunk(cr) + " Crore ";
  const lk = Math.floor((int%10000000)/100000); if (lk) w += chunk(lk) + " Lakh ";
  const th = Math.floor((int%100000)/1000); if (th) w += chunk(th) + " Thousand ";
  const rs = int % 1000; if (rs) w += chunk(rs);
  return w.trim() + " Rupees Only";
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT:     "#6B7280",
  SENT:      "#2563EB",
  EMAIL:     "#7C3AED",
  WHATSAPP:  "#059669",
  SUBMITTED: "#D97706",
  APPROVED:  "#16A34A",
  REJECTED:  "#DC2626",
  EXPIRED:   "#9A3412",
};

export default function QuotationPrintTemplate({
  q,
  company: companyProp,
  bank: bankProp,
}: {
  q: QuotationData;
  company?: Partial<CompanyConfig>;
  bank?: Partial<BankConfig>;
}) {
  const C: CompanyConfig = { ...DEFAULT_COMPANY, ...companyProp };
  const B: BankConfig    = { ...DEFAULT_BANK,    ...bankProp };

  const companyDisplay = q.salutation
    ? `${q.salutation} ${q.customer?.company || q.customerName || ""}`
    : (q.customer?.company || q.customerName || "—");

  const termLines = q.terms
    ? q.terms.split("\n").filter(Boolean)
    : C.defaultTerms.split("\n").filter(Boolean);

  const statusColor = STATUS_COLOR[q.status] ?? "#6B7280";

  // QR code URL for quotation reference (api.qrserver.com — free, no install needed)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=70x70&format=svg&data=${encodeURIComponent(q.quotationNo)}`;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#1a1a1a", background: "#fff", minHeight: "297mm" }}>

      {/* ── LETTERHEAD ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", paddingBottom: "10px" }}>
        {/* Logo */}
        {C.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={C.logoUrl} alt={C.name} style={{ height: "60px", width: "auto", objectFit: "contain", flexShrink: 0 }} />
        ) : (
          <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: "900", fontSize: "18px", letterSpacing: "-1px" }}>
              {C.name.substring(0, 3).toUpperCase()}
            </span>
          </div>
        )}
        {/* Company details */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#4F46E5", letterSpacing: "1px" }}>{C.name}</div>
          <div style={{ fontSize: "9px", color: "#6B7280", marginTop: "1px" }}>{C.tagline}</div>
          <div style={{ fontSize: "9px", color: "#374151", marginTop: "4px", lineHeight: "1.5" }}>{C.address}</div>
          <div style={{ fontSize: "9px", color: "#374151" }}>
            {[C.phone, C.email, C.website].filter(Boolean).join("  |  ")}
          </div>
          {C.gstNo && (
            <div style={{ fontSize: "9px", color: "#374151" }}>GSTIN: {C.gstNo}{C.panNo ? `  |  PAN: ${C.panNo}` : ""}</div>
          )}
        </div>
      </div>

      {/* ── BLUE DIVIDER ────────────────────────────────────────────────────── */}
      <div style={{ height: "3px", background: "linear-gradient(90deg,#4F46E5,#7C3AED)", marginBottom: "0" }} />

      {/* ── CENTRED "QUOTATION" TITLE ───────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "8px 0 6px", background: "#F8F7FF", borderBottom: "1px solid #E5E7EB" }}>
        <span style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "6px", color: "#4F46E5" }}>
          QUOTATION
        </span>
      </div>

      {/* ── QUOTATION META ROW ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9FAFB", border: "1px solid #E5E7EB", borderTop: "none", padding: "8px 14px", marginBottom: "12px", gap: "8px" }}>
        <div style={{ display: "flex", gap: "24px", fontSize: "10px" }}>
          <div>
            <span style={{ color: "#6B7280" }}>Ref No: </span>
            <strong style={{ color: "#4F46E5", fontSize: "11px" }}>{q.quotationNo}</strong>
          </div>
          <div>
            <span style={{ color: "#6B7280" }}>Date: </span>
            <strong>{fmtDate(q.createdAt)}</strong>
          </div>
          {q.validUntil && (
            <div>
              <span style={{ color: "#6B7280" }}>Valid Until: </span>
              <strong style={{ color: "#D97706" }}>{fmtDate(q.validUntil)}</strong>
            </div>
          )}
          <div>
            <span style={{ color: "#6B7280" }}>Status: </span>
            <span style={{ background: statusColor, color: "#fff", fontSize: "9px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px" }}>
              {q.statusLabel}
            </span>
          </div>
        </div>
        {/* QR code for quotation reference */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt={q.quotationNo} width={54} height={54}
          style={{ display: "block", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "2px" }} />
      </div>

      {/* ── BILL TO ──────────────────────────────────────────────────────────── */}
      <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "5px" }}>BILL TO</div>
        <div style={{ fontSize: "13px", fontWeight: "800", color: "#111827" }}>{companyDisplay}</div>
        {(q.attentionName || q.customer?.name) && (
          <div style={{ fontSize: "10px", color: "#374151", marginTop: "3px" }}>
            <span style={{ color: "#6B7280" }}>Kind Attn: </span>
            <strong>
              {q.attentionSalutation ? `${q.attentionSalutation} ` : ""}
              {q.attentionName || q.customer?.name}
            </strong>
          </div>
        )}
      </div>

      {/* ── ITEMS TABLE ──────────────────────────────────────────────────────── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px" }}>
        <thead>
          <tr style={{ background: "#4F46E5", color: "#fff" }}>
            <th style={{ padding: "7px 10px", textAlign: "center", width: "30px", fontSize: "10px", fontWeight: "700" }}>#</th>
            <th style={{ padding: "7px 10px", textAlign: "left", fontSize: "10px", fontWeight: "700" }}>Description / Particulars</th>
            <th style={{ padding: "7px 10px", textAlign: "center", width: "46px", fontSize: "10px", fontWeight: "700" }}>Qty</th>
            <th style={{ padding: "7px 10px", textAlign: "center", width: "46px", fontSize: "10px", fontWeight: "700" }}>Unit</th>
            <th style={{ padding: "7px 10px", textAlign: "right", width: "80px", fontSize: "10px", fontWeight: "700" }}>Rate (₹)</th>
            <th style={{ padding: "7px 10px", textAlign: "right", width: "90px", fontSize: "10px", fontWeight: "700" }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {q.items.length === 0 && (
            <tr><td colSpan={6} style={{ padding: "16px", textAlign: "center", color: "#9CA3AF" }}>No items</td></tr>
          )}
          {q.items.map((item, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              <td style={{ padding: "7px 10px", textAlign: "center", color: "#6B7280" }}>{i + 1}</td>
              <td style={{ padding: "7px 10px" }}>{item.description}</td>
              <td style={{ padding: "7px 10px", textAlign: "center" }}>{item.qty}</td>
              <td style={{ padding: "7px 10px", textAlign: "center", color: "#6B7280" }}>{item.unit}</td>
              <td style={{ padding: "7px 10px", textAlign: "right" }}>{inr(item.unitPrice)}</td>
              <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: "600" }}>{inr(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── TOTALS ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <table style={{ fontSize: "10px", borderCollapse: "collapse", minWidth: "240px" }}>
          <tbody>
            <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
              <td style={{ padding: "5px 12px", color: "#6B7280" }}>Subtotal</td>
              <td style={{ padding: "5px 12px", textAlign: "right" }}>{inr(q.subtotal)}</td>
            </tr>
            {q.taxRate > 0 && q.tax > 0 && (
              <>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <td style={{ padding: "5px 12px", color: "#6B7280" }}>CGST @ {q.taxRate / 2}%</td>
                  <td style={{ padding: "5px 12px", textAlign: "right" }}>{inr(q.tax / 2)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <td style={{ padding: "5px 12px", color: "#6B7280" }}>SGST @ {q.taxRate / 2}%</td>
                  <td style={{ padding: "5px 12px", textAlign: "right" }}>{inr(q.tax / 2)}</td>
                </tr>
              </>
            )}
            {q.discount > 0 && (
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                <td style={{ padding: "5px 12px", color: "#059669" }}>Discount</td>
                <td style={{ padding: "5px 12px", textAlign: "right", color: "#059669" }}>−{inr(q.discount)}</td>
              </tr>
            )}
            <tr style={{ background: "#4F46E5", color: "#fff" }}>
              <td style={{ padding: "8px 12px", fontWeight: "800", fontSize: "12px" }}>GRAND TOTAL</td>
              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: "900", fontSize: "13px" }}>{inr(q.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in words */}
      <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "5px", padding: "6px 12px", fontSize: "10px", color: "#3730A3", marginBottom: "14px" }}>
        <strong>Amount in Words:</strong> {numberToWords(q.total)}
      </div>

      {q.notes && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "5px", padding: "8px 12px", marginBottom: "14px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#92400E", marginBottom: "3px" }}>NOTES</div>
          <div style={{ fontSize: "10px", color: "#78350F" }}>{q.notes}</div>
        </div>
      )}

      {/* ── PAYMENT DETAILS + TERMS ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
        {/* OUR PAYMENT DETAILS */}
        <div style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 12px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "6px" }}>
            OUR PAYMENT DETAILS
          </div>
          <table style={{ fontSize: "10px", borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {[
                ["Bank Name",    B.bankName],
                ["Branch",       B.bankBranch],
                ["Account No",   B.accountNo],
                ["IFSC Code",    B.ifscCode],
                ["Account Type", B.accountType],
              ].filter(([, v]) => v).map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: "#6B7280", paddingBottom: "3px", paddingRight: "8px", whiteSpace: "nowrap" }}>{k}</td>
                  <td style={{ fontWeight: "600", color: "#111" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Payment QR code (UPI / advance) — uploaded in Company Settings */}
          {C.paymentQrUrl && (
            <div style={{ marginTop: "8px", textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={C.paymentQrUrl} alt="Pay QR" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
              <div style={{ fontSize: "8px", color: "#6B7280", marginTop: "2px" }}>Scan to pay advance</div>
            </div>
          )}
        </div>

        {/* TERMS & CONDITIONS */}
        <div style={{ flex: 1.3, border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 12px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "6px" }}>
            TERMS &amp; CONDITIONS
          </div>
          <ol style={{ margin: 0, padding: "0 0 0 14px", fontSize: "9px", color: "#374151", lineHeight: "1.7" }}>
            {termLines.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </div>
      </div>

      {/* ── SIGNATURE BLOCK ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #E5E7EB", paddingTop: "14px", marginTop: "4px", gap: "16px" }}>
        {/* Customer side */}
        <div style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 14px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "6px" }}>
            ACCEPTED BY
          </div>
          <div style={{ height: "44px", borderBottom: "1px dashed #9CA3AF", marginBottom: "6px" }} />
          <div style={{ fontSize: "9px", color: "#374151", lineHeight: "2" }}>
            <div>Name: <span style={{ borderBottom: "1px solid #CBD5E1", display: "inline-block", width: "130px" }}>&nbsp;</span></div>
            <div>Designation: <span style={{ borderBottom: "1px solid #CBD5E1", display: "inline-block", width: "110px" }}>&nbsp;</span></div>
          </div>
          <div style={{ fontSize: "8px", color: "#9CA3AF", marginTop: "4px" }}>Customer Signature &amp; Stamp</div>
        </div>

        {/* ZAG Signs side */}
        <div style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 14px", textAlign: "center" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "6px" }}>
            FOR {C.name.toUpperCase()}
          </div>
          <div style={{ height: "44px", borderBottom: "1px dashed #9CA3AF", marginBottom: "6px" }} />
          <div style={{ color: "#4F46E5", fontWeight: "700", fontSize: "11px" }}>{C.name}</div>
          <div style={{ fontSize: "8px", color: "#6B7280", marginTop: "2px" }}>{C.tagline}</div>
          <div style={{ fontSize: "8px", color: "#9CA3AF", marginTop: "4px", fontStyle: "italic" }}>
            ✦ Digitally Signed — Authorised Signatory
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: "14px", borderTop: "2px solid #4F46E5", paddingTop: "8px" }}>
        {/* Proposed by */}
        {q.proposedByName && (
          <div style={{ fontSize: "9px", color: "#374151", marginBottom: "4px", textAlign: "center" }}>
            <strong>Proposed by:</strong>&nbsp;
            {q.proposedByName}
            {q.proposedByDesignation ? ` | ${q.proposedByDesignation}` : ""}
            {q.proposedByBranch ? ` | Branch: ${q.proposedByBranch}` : ""}
          </div>
        )}
        <div style={{ textAlign: "center", fontSize: "8px", color: "#9CA3AF" }}>
          {C.name} &nbsp;|&nbsp; {C.address} &nbsp;|&nbsp; {C.phone}
          {C.gstNo ? ` &nbsp;|&nbsp; GSTIN: ${C.gstNo}` : ""}
        </div>
      </div>
    </div>
  );
}
