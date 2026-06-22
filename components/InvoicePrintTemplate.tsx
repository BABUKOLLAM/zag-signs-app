// Invoice print template — TAX INVOICE format
// Mirrors QuotationPrintTemplate but uses Invoice-specific fields

import { type CompanyConfig, type BankConfig } from "./QuotationPrintTemplate";

const DEFAULT_COMPANY: CompanyConfig = {
  name:    "ZAG SIGNS",
  tagline: "Excellence in Signage Solutions",
  address: "TC 44/848/5, Sainarayana Building, Edapazhinji Road, Vazhuthakkad, Thiruvananthapuram – 695 014, Kerala",
  phone:   "+91 98953 73806 / +91 62820 50921",
  email:   "zagadvt@gmail.com",
  website: "www.zagsigns.com",
  gstNo:   "32ATXPK5181A1ZO",
  panNo:   "",
  logoUrl: "/zagsigns-logo.png",
  defaultTerms: "",
};

const DEFAULT_BANK: BankConfig = {
  bankName:    "Dhanlaxmi Bank",
  bankBranch:  "Vazhuthakkad",
  accountNo:   "003705300009231",
  ifscCode:    "DLXB0000231",
  accountType: "Current Account",
};

export interface InvoiceItem {
  description: string; qty: number; unit: string; unitPrice: number; total: number;
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  dueDate?: string;
  status: string;
  quotationNo?: string;
  customerName?: string;
  customerCompany?: string;
  customerAddress?: string;
  customerGst?: string;
  customerPhone?: string;
  salutation?: string;
  attentionName?: string;
  branch?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  notes?: string;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:  "#D97706",
  PARTIAL:  "#7C3AED",
  PAID:     "#16A34A",
  OVERDUE:  "#DC2626",
};

function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s?: string) {
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

export default function InvoicePrintTemplate({
  inv,
  company: companyProp,
  bank: bankProp,
}: {
  inv: InvoiceData;
  company?: Partial<CompanyConfig>;
  bank?: Partial<BankConfig>;
}) {
  const C: CompanyConfig = { ...DEFAULT_COMPANY, ...companyProp };
  const B: BankConfig    = { ...DEFAULT_BANK,    ...bankProp };

  const statusColor = STATUS_COLOR[inv.status] ?? "#6B7280";
  const cgst = inv.taxAmount / 2;
  const sgst = inv.taxAmount / 2;

  const billToName = inv.salutation
    ? `${inv.salutation} ${inv.customerCompany || inv.customerName || ""}`
    : (inv.customerCompany || inv.customerName || "—");

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#1a1a1a", background: "#fff", minHeight: "297mm" }}>

      {/* ── LETTERHEAD ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", paddingBottom: "8px" }}>
        <div style={{ position: "relative", width: "60px", height: "60px", flexShrink: 0 }}>
          <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: "900", fontSize: "18px", letterSpacing: "-1px" }}>
              {C.name.substring(0, 3).toUpperCase()}
            </span>
          </div>
          {C.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={C.logoUrl} alt={C.name}
              style={{ position: "absolute", top: 0, left: 0, width: "60px", height: "60px", objectFit: "contain", borderRadius: "10px" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          )}
        </div>
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

      <div style={{ height: "3px", background: "linear-gradient(90deg,#4F46E5,#7C3AED)", marginBottom: "0" }} />
      <div style={{ textAlign: "center", padding: "5px 0 4px", background: "#F8F7FF", borderBottom: "1px solid #E5E7EB" }}>
        <span style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "6px", color: "#4F46E5" }}>
          TAX INVOICE
        </span>
      </div>

      {/* ── META ROW ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F9FAFB", border: "1px solid #E5E7EB", borderTop: "none", padding: "6px 12px", marginBottom: "8px", gap: "8px" }}>
        <div style={{ display: "flex", gap: "20px", fontSize: "10px", flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "#6B7280" }}>Invoice No: </span>
            <strong style={{ color: "#4F46E5", fontSize: "11px" }}>{inv.invoiceNo}</strong>
          </div>
          <div>
            <span style={{ color: "#6B7280" }}>Date: </span>
            <strong>{fmtDate(inv.invoiceDate)}</strong>
          </div>
          {inv.dueDate && (
            <div>
              <span style={{ color: "#6B7280" }}>Due: </span>
              <strong style={{ color: "#DC2626" }}>{fmtDate(inv.dueDate)}</strong>
            </div>
          )}
          {inv.quotationNo && (
            <div>
              <span style={{ color: "#6B7280" }}>Quotation Ref: </span>
              <strong>{inv.quotationNo}</strong>
            </div>
          )}
          <div>
            <span style={{ color: "#6B7280" }}>Status: </span>
            <span style={{ background: statusColor, color: "#fff", fontSize: "9px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px" }}>
              {inv.status}
            </span>
          </div>
        </div>
      </div>

      {/* ── BILL TO ── */}
      <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "7px 12px", marginBottom: "9px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "5px" }}>BILL TO</div>
        <div style={{ fontSize: "13px", fontWeight: "800", color: "#111827" }}>{billToName}</div>
        {inv.attentionName && (
          <div style={{ fontSize: "10px", color: "#374151", marginTop: "3px" }}>
            <span style={{ color: "#6B7280" }}>Kind Attn: </span>
            <strong>{inv.attentionName}</strong>
          </div>
        )}
        {inv.customerAddress && (
          <div style={{ fontSize: "9px", color: "#6B7280", marginTop: "4px", lineHeight: "1.5" }}>
            {inv.customerAddress}
          </div>
        )}
        <div style={{ display: "flex", gap: "16px", marginTop: "3px", flexWrap: "wrap" }}>
          {inv.customerGst && (
            <div style={{ fontSize: "9px", color: "#374151" }}>
              <span style={{ color: "#6B7280" }}>GSTIN: </span><strong>{inv.customerGst}</strong>
            </div>
          )}
          {inv.customerPhone && (
            <div style={{ fontSize: "9px", color: "#374151" }}>
              <span style={{ color: "#6B7280" }}>Ph: </span>{inv.customerPhone}
            </div>
          )}
        </div>
      </div>

      {/* ── ITEMS TABLE ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2px" }}>
        <thead>
          <tr style={{ background: "#4F46E5", color: "#fff" }}>
            <th style={{ padding: "5px 8px", textAlign: "center", width: "30px", fontSize: "10px", fontWeight: "700" }}>#</th>
            <th style={{ padding: "5px 8px", textAlign: "left", fontSize: "10px", fontWeight: "700" }}>Description / Particulars</th>
            <th style={{ padding: "5px 8px", textAlign: "center", width: "46px", fontSize: "10px", fontWeight: "700" }}>Qty</th>
            <th style={{ padding: "5px 8px", textAlign: "center", width: "46px", fontSize: "10px", fontWeight: "700" }}>Unit</th>
            <th style={{ padding: "5px 8px", textAlign: "right", width: "80px", fontSize: "10px", fontWeight: "700" }}>Rate (₹)</th>
            <th style={{ padding: "5px 8px", textAlign: "right", width: "90px", fontSize: "10px", fontWeight: "700" }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.length === 0 && (
            <tr><td colSpan={6} style={{ padding: "16px", textAlign: "center", color: "#9CA3AF" }}>No items</td></tr>
          )}
          {inv.items.map((item, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              <td style={{ padding: "5px 8px", textAlign: "center", color: "#6B7280" }}>{i + 1}</td>
              <td style={{ padding: "5px 8px" }}>{item.description}</td>
              <td style={{ padding: "5px 8px", textAlign: "center" }}>{item.qty}</td>
              <td style={{ padding: "5px 8px", textAlign: "center", color: "#6B7280" }}>{item.unit}</td>
              <td style={{ padding: "5px 8px", textAlign: "right" }}>{inr(item.unitPrice)}</td>
              <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: "600" }}>{inr(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── TOTALS ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "6px" }}>
        <table style={{ fontSize: "10px", borderCollapse: "collapse", minWidth: "240px" }}>
          <tbody>
            <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
              <td style={{ padding: "4px 10px", color: "#6B7280" }}>Subtotal</td>
              <td style={{ padding: "4px 10px", textAlign: "right" }}>{inr(inv.subtotal)}</td>
            </tr>
            {inv.taxRate > 0 && inv.taxAmount > 0 && (
              <>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <td style={{ padding: "4px 10px", color: "#6B7280" }}>CGST @ {inv.taxRate / 2}%</td>
                  <td style={{ padding: "4px 10px", textAlign: "right" }}>{inr(cgst)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <td style={{ padding: "4px 10px", color: "#6B7280" }}>SGST @ {inv.taxRate / 2}%</td>
                  <td style={{ padding: "4px 10px", textAlign: "right" }}>{inr(sgst)}</td>
                </tr>
              </>
            )}
            {inv.discount > 0 && (
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                <td style={{ padding: "4px 10px", color: "#059669" }}>Discount</td>
                <td style={{ padding: "4px 10px", textAlign: "right", color: "#059669" }}>−{inr(inv.discount)}</td>
              </tr>
            )}
            <tr style={{ background: "#4F46E5", color: "#fff" }}>
              <td style={{ padding: "6px 10px", fontWeight: "800", fontSize: "12px" }}>TOTAL DUE</td>
              <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: "900", fontSize: "13px" }}>{inr(inv.totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "5px", padding: "4px 10px", fontSize: "10px", color: "#3730A3", marginBottom: "8px" }}>
        <strong>Amount in Words:</strong> {numberToWords(inv.totalAmount)}
      </div>

      {inv.notes && (
        <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "5px", padding: "5px 10px", marginBottom: "8px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#075985", letterSpacing: "1px", marginBottom: "3px" }}>REMARKS</div>
          <div style={{ fontSize: "10px", color: "#0C4A6E" }}>{inv.notes}</div>
        </div>
      )}

      {/* ── PAYMENT DETAILS ── */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "6px", padding: "7px 10px", marginBottom: "10px" }}>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "5px" }}>
          PAYMENT DETAILS — Please transfer to:
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          <table style={{ fontSize: "10px", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Bank Name",    B.bankName],
                ["Branch",       B.bankBranch],
                ["Account No",   B.accountNo],
                ["IFSC Code",    B.ifscCode],
                ["Account Type", B.accountType],
              ].filter(([, v]) => v).map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: "#6B7280", paddingBottom: "3px", paddingRight: "10px", whiteSpace: "nowrap" }}>{k}</td>
                  <td style={{ fontWeight: "600", color: "#111" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {C.paymentQrUrl && (
            <div style={{ textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={C.paymentQrUrl} alt="" style={{ width: "70px", height: "70px", objectFit: "contain" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <div style={{ fontSize: "8px", color: "#6B7280" }}>Scan to pay</div>
            </div>
          )}
        </div>
      </div>

      {/* ── SIGNATURE ── */}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #E5E7EB", paddingTop: "10px", gap: "12px", pageBreakInside: "avoid" }}>
        <div style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: "6px", padding: "7px 12px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "4px" }}>RECEIVED BY</div>
          <div style={{ height: "34px", borderBottom: "1px dashed #9CA3AF", marginBottom: "5px" }} />
          <div style={{ fontSize: "9px", color: "#374151", lineHeight: "1.9" }}>
            <div>Name: <span style={{ borderBottom: "1px solid #CBD5E1", display: "inline-block", width: "130px" }}>&nbsp;</span></div>
            <div>Date: <span style={{ borderBottom: "1px solid #CBD5E1", display: "inline-block", width: "130px" }}>&nbsp;</span></div>
          </div>
          <div style={{ fontSize: "8px", color: "#9CA3AF", marginTop: "3px" }}>Customer Signature &amp; Stamp</div>
        </div>
        <div style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: "6px", padding: "7px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#6B7280", letterSpacing: "1px", marginBottom: "4px" }}>FOR {C.name.toUpperCase()}</div>
          <div style={{ height: "34px", borderBottom: "1px dashed #9CA3AF", marginBottom: "5px" }} />
          <div style={{ color: "#4F46E5", fontWeight: "700", fontSize: "11px" }}>{C.name}</div>
          <div style={{ fontSize: "8px", color: "#6B7280", marginTop: "1px" }}>{C.tagline}</div>
          <div style={{ fontSize: "8px", color: "#9CA3AF", marginTop: "3px", fontStyle: "italic" }}>
            ✦ Authorised Signatory
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ marginTop: "8px", borderTop: "2px solid #4F46E5", paddingTop: "5px", pageBreakInside: "avoid" }}>
        <div style={{ textAlign: "center", fontSize: "8px", color: "#9CA3AF", lineHeight: "1.6" }}>
          <strong style={{ color: "#6B7280" }}>{C.name}</strong>
          &nbsp;|&nbsp; {C.address}
          &nbsp;|&nbsp; {C.phone}
          {C.gstNo ? <>&nbsp;|&nbsp; GSTIN: {C.gstNo}</> : ""}
          {C.panNo ? <>&nbsp;|&nbsp; PAN: {C.panNo}</> : ""}
        </div>
        <div style={{ textAlign: "center", fontSize: "8px", color: "#9CA3AF", marginTop: "2px" }}>
          This is a computer-generated tax invoice and is valid without a physical signature.
        </div>
      </div>
    </div>
  );
}
