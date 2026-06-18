// ─── QUOTATION PRINT TEMPLATE ────────────────────────────────────────────────
// Company details, bank details and terms are now configured in:
//   Admin → Company Settings  (/admin/settings)
//
// The COMPANY and BANK constants below are fallbacks only — they are used
// when the settings API hasn't loaded yet or as initial seed values.
// ─────────────────────────────────────────────────────────────────────────────

export interface CompanyConfig {
  name: string; tagline: string; address: string;
  phone: string; email: string; website: string;
  gstNo: string; panNo: string; logoUrl?: string;
  defaultTerms: string;
}

export interface BankConfig {
  bankName: string; bankBranch: string; accountNo: string;
  ifscCode: string; accountType: string;
}

// Fallback values (used until Admin saves real settings)
const DEFAULT_COMPANY: CompanyConfig = {
  name: "ZAG SIGNS",
  tagline: "Excellence in Signage Solutions",
  address: "123 Industrial Area, Thiruvananthapuram, Kerala – 695 001",
  phone: "+91 94470 00000",
  email: "info@zagsigns.com",
  website: "www.zagsigns.com",
  gstNo: "32AAAAA0000A1Z5",
  panNo: "AAAAA0000A",
  defaultTerms: [
    "Payment due within 15 days of invoice date.",
    "50% advance required to commence production.",
    "Goods once sold will not be taken back.",
    "This is a computer-generated quotation and does not require a signature to be valid.",
    "Price quoted is valid for 30 days from the date of quotation.",
    "Delivery timeline starts from receipt of advance & approved artwork.",
  ].join("\n"),
};

const DEFAULT_BANK: BankConfig = {
  bankName: "State Bank of India",
  bankBranch: "Thiruvananthapuram Main Branch",
  accountNo: "00000 00000 00000",
  ifscCode: "SBIN0000000",
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
  items: QuotationItem[];
  subtotal: number; tax: number; discount: number; total: number;
  terms: string; notes: string;
}

function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberToWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const int = Math.floor(n);
  if (int === 0) return "Zero";
  function chunk(x: number): string {
    if (x === 0) return "";
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
    return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + chunk(x % 100) : "");
  }
  let word = "";
  const crore = Math.floor(int / 10000000); if (crore) word += chunk(crore) + " Crore ";
  const lakh = Math.floor((int % 10000000) / 100000); if (lakh) word += chunk(lakh) + " Lakh ";
  const thousand = Math.floor((int % 100000) / 1000); if (thousand) word += chunk(thousand) + " Thousand ";
  const rest = int % 1000; if (rest) word += chunk(rest);
  return word.trim() + " Rupees Only";
}

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

  const customerName = q.customer?.company || q.customer?.name || q.customerName || "—";
  const termLines = q.terms
    ? q.terms.split("\n").filter(Boolean)
    : C.defaultTerms.split("\n").filter(Boolean);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#1a1a1a", background: "#fff" }}>

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #4F46E5", paddingBottom: "12px", marginBottom: "14px" }}>

        {/* Left: Logo + Company */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {C.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={C.logoUrl} alt={C.name} style={{ height: "54px", width: "auto", objectFit: "contain" }} />
          ) : (
            <div style={{ width: "54px", height: "54px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: "900", fontSize: "16px", letterSpacing: "-1px" }}>
                {C.name.substring(0, 3).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div style={{ fontSize: "20px", fontWeight: "900", color: "#4F46E5", letterSpacing: "1px" }}>{C.name}</div>
            <div style={{ fontSize: "9px", color: "#6B7280", marginTop: "1px" }}>{C.tagline}</div>
            <div style={{ fontSize: "9px", color: "#374151", marginTop: "4px" }}>{C.address}</div>
            <div style={{ fontSize: "9px", color: "#374151" }}>
              {[C.phone, C.email, C.website].filter(Boolean).join("  |  ")}
            </div>
            {(C.gstNo || C.panNo) && (
              <div style={{ fontSize: "9px", color: "#374151" }}>
                {C.gstNo && `GSTIN: ${C.gstNo}`}
                {C.gstNo && C.panNo ? "  |  " : ""}
                {C.panNo && `PAN: ${C.panNo}`}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quotation meta box */}
        <div style={{ textAlign: "right" }}>
          <div style={{ background: "#4F46E5", color: "#fff", fontSize: "14px", fontWeight: "800", padding: "6px 16px", borderRadius: "6px", letterSpacing: "2px" }}>QUOTATION</div>
          <table style={{ marginTop: "8px", fontSize: "10px", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td style={{ color: "#6B7280", paddingRight: "10px", paddingBottom: "3px" }}>Quote No</td><td style={{ fontWeight: "700", color: "#111" }}>{q.quotationNo}</td></tr>
              <tr><td style={{ color: "#6B7280", paddingBottom: "3px" }}>Date</td><td style={{ color: "#111" }}>{q.createdAt}</td></tr>
              <tr><td style={{ color: "#6B7280", paddingBottom: "3px" }}>Valid Until</td><td style={{ color: q.validUntil ? "#D97706" : "#111", fontWeight: q.validUntil ? "700" : "400" }}>{q.validUntil || "—"}</td></tr>
              <tr><td style={{ color: "#6B7280" }}>Status</td><td><span style={{ background: "#ECFDF5", color: "#065F46", fontSize: "9px", fontWeight: "700", padding: "1px 6px", borderRadius: "10px" }}>{q.statusLabel}</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BILL TO ──────────────────────────────────────────────────────────── */}
      <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "4px" }}>BILL TO</div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#111" }}>{customerName}</div>
        {q.customer?.name && q.customer.company && (
          <div style={{ fontSize: "10px", color: "#6B7280" }}>Attn: {q.customer.name}</div>
        )}
      </div>

      {/* ── ITEMS TABLE ──────────────────────────────────────────────────────── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px" }}>
        <thead>
          <tr style={{ background: "#4F46E5", color: "#fff" }}>
            <th style={{ padding: "8px 10px", textAlign: "center", width: "32px", fontSize: "10px", fontWeight: "700" }}>#</th>
            <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "10px", fontWeight: "700" }}>Description / Particulars</th>
            <th style={{ padding: "8px 10px", textAlign: "center", width: "48px", fontSize: "10px", fontWeight: "700" }}>Qty</th>
            <th style={{ padding: "8px 10px", textAlign: "center", width: "48px", fontSize: "10px", fontWeight: "700" }}>Unit</th>
            <th style={{ padding: "8px 10px", textAlign: "right", width: "80px", fontSize: "10px", fontWeight: "700" }}>Rate (₹)</th>
            <th style={{ padding: "8px 10px", textAlign: "right", width: "90px", fontSize: "10px", fontWeight: "700" }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {q.items.length === 0 && (
            <tr><td colSpan={6} style={{ padding: "16px", textAlign: "center", color: "#9CA3AF", fontSize: "10px" }}>No items</td></tr>
          )}
          {q.items.map((item, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              <td style={{ padding: "8px 10px", textAlign: "center", color: "#6B7280" }}>{i + 1}</td>
              <td style={{ padding: "8px 10px" }}>{item.description}</td>
              <td style={{ padding: "8px 10px", textAlign: "center" }}>{item.qty}</td>
              <td style={{ padding: "8px 10px", textAlign: "center", color: "#6B7280" }}>{item.unit}</td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>{inr(item.unitPrice)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "600" }}>{inr(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── TOTALS ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
        <table style={{ fontSize: "10px", borderCollapse: "collapse", minWidth: "220px" }}>
          <tbody>
            <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
              <td style={{ padding: "5px 10px", color: "#6B7280" }}>Subtotal</td>
              <td style={{ padding: "5px 10px", textAlign: "right" }}>{inr(q.subtotal)}</td>
            </tr>
            {q.tax > 0 && (
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                <td style={{ padding: "5px 10px", color: "#6B7280" }}>GST / Tax</td>
                <td style={{ padding: "5px 10px", textAlign: "right" }}>{inr(q.tax)}</td>
              </tr>
            )}
            {q.discount > 0 && (
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                <td style={{ padding: "5px 10px", color: "#059669" }}>Discount</td>
                <td style={{ padding: "5px 10px", textAlign: "right", color: "#059669" }}>−{inr(q.discount)}</td>
              </tr>
            )}
            <tr style={{ background: "#4F46E5", color: "#fff" }}>
              <td style={{ padding: "8px 10px", fontWeight: "800", fontSize: "12px" }}>GRAND TOTAL</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "800", fontSize: "13px" }}>{inr(q.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in words */}
      <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "5px", padding: "6px 12px", fontSize: "10px", color: "#3730A3", marginBottom: "14px" }}>
        <strong>Amount in Words:</strong> {numberToWords(q.total)}
      </div>

      {/* Notes */}
      {q.notes && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "5px", padding: "8px 12px", marginBottom: "14px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#92400E", marginBottom: "3px" }}>NOTES</div>
          <div style={{ fontSize: "10px", color: "#78350F" }}>{q.notes}</div>
        </div>
      )}

      {/* ── BANK + TERMS ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "14px" }}>
        <div style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 12px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "6px" }}>BANK DETAILS</div>
          <table style={{ fontSize: "10px", borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {[
                ["Bank Name", B.bankName],
                ["Branch", B.bankBranch],
                ["Account No", B.accountNo],
                ["IFSC Code", B.ifscCode],
                ["Account Type", B.accountType],
              ].filter(([, v]) => v).map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: "#6B7280", paddingBottom: "3px", paddingRight: "8px", whiteSpace: "nowrap" }}>{k}</td>
                  <td style={{ fontWeight: "600", color: "#111" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1.2, border: "1px solid #E5E7EB", borderRadius: "6px", padding: "10px 12px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "6px" }}>TERMS &amp; CONDITIONS</div>
          <ol style={{ margin: 0, padding: "0 0 0 14px", fontSize: "9px", color: "#374151", lineHeight: "1.6" }}>
            {termLines.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </div>
      </div>

      {/* ── SIGNATURES ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #E5E7EB", paddingTop: "14px", marginTop: "6px" }}>
        <div style={{ textAlign: "center", width: "160px" }}>
          <div style={{ height: "50px", borderBottom: "1px solid #9CA3AF", marginBottom: "5px" }} />
          <div style={{ fontSize: "9px", color: "#6B7280" }}>Customer Signature &amp; Stamp</div>
        </div>
        <div style={{ textAlign: "center", fontSize: "10px", color: "#6B7280" }}>
          <div style={{ color: "#4F46E5", fontWeight: "700", fontSize: "11px" }}>{C.name}</div>
          <div style={{ fontSize: "8px", marginTop: "2px" }}>{C.tagline}</div>
        </div>
        <div style={{ textAlign: "center", width: "160px" }}>
          <div style={{ height: "50px", borderBottom: "1px solid #9CA3AF", marginBottom: "5px" }} />
          <div style={{ fontSize: "9px", color: "#6B7280" }}>Authorised Signatory</div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: "12px", textAlign: "center", fontSize: "8px", color: "#9CA3AF", borderTop: "1px solid #F3F4F6", paddingTop: "8px" }}>
        {C.name} &nbsp;|&nbsp; {C.address} &nbsp;|&nbsp; {C.phone}
        {C.gstNo ? ` &nbsp;|&nbsp; GSTIN: ${C.gstNo}` : ""}
      </div>
    </div>
  );
}
