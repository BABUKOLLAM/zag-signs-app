// Generates a Tally-compatible Sales Voucher XML for a single invoice.
// Import in Tally via: Gateway of Tally → Import Data → Vouchers → select the .xml file

export interface TallyItem {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface TallyInvoiceData {
  invoiceNo: string;
  invoiceDate: string;     // YYYY-MM-DD
  customerName: string;
  customerGst?: string;
  branch: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  items: TallyItem[];
  notes?: string;
  // Ledger names — default to standard Tally names; customise per company
  partyLedger?: string;     // defaults to customerName
  salesLedger?: string;     // defaults to "Sales Account"
  cgstLedger?: string;      // defaults to "Output CGST"
  sgstLedger?: string;      // defaults to "Output SGST"
  discountLedger?: string;  // defaults to "Discount Allowed"
}

function esc(s: string | undefined | null): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function tallyDate(dateStr: string): string {
  // Tally uses YYYYMMDD format
  return dateStr.replace(/-/g, "");
}

function fmt2(n: number): string {
  return n.toFixed(2);
}

export function generateTallyXml(inv: TallyInvoiceData): string {
  const partyLedger   = inv.partyLedger   || inv.customerName;
  const salesLedger   = inv.salesLedger   || "Sales Account";
  const cgstLedger    = inv.cgstLedger    || "Output CGST";
  const sgstLedger    = inv.sgstLedger    || "Output SGST";
  const discountLedger = inv.discountLedger || "Discount Allowed";

  const cgst = inv.taxAmount / 2;
  const sgst = inv.taxAmount / 2;
  const netSales = inv.subtotal - inv.discount;
  const date = tallyDate(inv.invoiceDate);

  // Inventory entries for each line item
  const inventoryLines = inv.items.map((item) => `
          <ALLINVENTORYENTRIES.LIST>
            <STOCKITEMNAME>${esc(item.description)}</STOCKITEMNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <RATE>${fmt2(item.unitPrice)}/${esc(item.unit)}</RATE>
            <AMOUNT>${fmt2(item.total)}</AMOUNT>
            <ACTUALQTY>${item.qty} ${esc(item.unit)}</ACTUALQTY>
            <BILLEDQTY>${item.qty} ${esc(item.unit)}</BILLEDQTY>
            <BATCHALLOCATIONS.LIST>
              <GODOWNNAME>Main Location</GODOWNNAME>
              <BATCHNAME>Primary Batch</BATCHNAME>
              <ACTUALQTY>${item.qty} ${esc(item.unit)}</ACTUALQTY>
              <BILLEDQTY>${item.qty} ${esc(item.unit)}</BILLEDQTY>
              <AMOUNT>${fmt2(item.total)}</AMOUNT>
            </BATCHALLOCATIONS.LIST>
          </ALLINVENTORYENTRIES.LIST>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>##SVCURRENTCOMPANY</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">
            <DATE>${date}</DATE>
            <EFFECTIVEDATE>${date}</EFFECTIVEDATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${esc(inv.invoiceNo)}</VOUCHERNUMBER>
            <NARRATION>${esc(inv.notes || `Invoice ${inv.invoiceNo} — ${inv.customerName}`)}</NARRATION>
            <PARTYLEDGERNAME>${esc(partyLedger)}</PARTYLEDGERNAME>
            <ISINVOICE>Yes</ISINVOICE>${inv.customerGst ? `
            <BASICBUYERGSTIN>${esc(inv.customerGst)}</BASICBUYERGSTIN>` : ""}

            <!-- Party Debit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${esc(partyLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${fmt2(inv.totalAmount)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Sales Credit -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${esc(salesLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${fmt2(netSales)}</AMOUNT>${inventoryLines}
            </ALLLEDGERENTRIES.LIST>${cgst > 0 ? `

            <!-- CGST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${esc(cgstLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${fmt2(cgst)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- SGST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${esc(sgstLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${fmt2(sgst)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>` : ""}${inv.discount > 0 ? `

            <!-- Discount -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${esc(discountLedger)}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${fmt2(inv.discount)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>` : ""}

          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}
