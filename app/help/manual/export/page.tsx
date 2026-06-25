"use client";
import { useEffect } from "react";
import { SCREENS, Caption } from "../Screens";
import PoweredByBpro from "@/components/PoweredByBpro";

// ── Version (printed on cover, footer & back cover) ──
const VERSION = "1.2";
const VERSION_DATE = "20/06/2026";

// Print styles injected at component mount
const PRINT_STYLE = `
  * {
    box-sizing: border-box;
  }
  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    background: white !important;
    color: black !important;
  }
  @media screen {
    body {
      background: #f5f5f5;
    }
  }
  @media print {
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: white !important;
    }
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
    }
    .no-print {
      display: none !important;
      visibility: hidden !important;
    }
    .page-break {
      page-break-before: always;
      page-break-inside: avoid;
    }
    h1, h2, h3 {
      page-break-after: avoid;
    }
    .avoid-break {
      page-break-inside: avoid;
    }
    a {
      color: black !important;
      text-decoration: none;
    }
  }
  @page {
    size: A4;
    margin: 15mm;
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TOC = [
  { num: "1", title: "Introduction & System Overview" },
  { num: "2", title: "Getting Started — Login & Navigation" },
  { num: "3", title: "End-to-End Business Workflow" },
  { num: "4", title: "Leads & CRM Module" },
  { num: "5", title: "Opportunities Module" },
  { num: "6", title: "Customers Module" },
  { num: "7", title: "Quotations Module" },
  { num: "8", title: "Invoices & Tally Integration" },
  { num: "9", title: "Work Order Tickets & Designer Workflow" },
  { num: "10", title: "Sales Orders" },
  { num: "11", title: "Work Orders & Production" },
  { num: "12", title: "Finance — Collections & Payments" },
  { num: "13", title: "HR & Attendance" },
  { num: "14", title: "Field Visits & Team Reports" },
  { num: "15", title: "Admin & Settings" },
  { num: "16", title: "Batch Data Import & Export" },
  { num: "17", title: "Role Permission Matrix" },
  { num: "18", title: "Frequently Asked Questions" },
  { num: "19", title: "Keyboard Shortcuts & Tips" },
];

interface ManualStep { step: string; desc: string; note?: string; }
interface ManualSection {
  num: string; title: string; intro: string;
  steps?: ManualStep[]; tips?: string[]; warning?: string; screenKey?: string;
}

const SECTIONS: ManualSection[] = [
  {
    num: "1", title: "Introduction & System Overview",
    intro: `ZAG SIGNS ERP is a cloud-based Enterprise Resource Planning system built exclusively for ZAG SIGNS
and its branches. It manages the complete business lifecycle — from capturing a sales lead to issuing a
Tax Invoice and syncing with Tally — in one integrated platform.

The system is accessible at bprozagcrm.xyz from any browser (desktop, mobile, tablet). No installation
is required. All data is stored securely on cloud servers with automatic backups.

Modules covered: CRM (Leads & Opportunities), Customers, Quotations, Invoices (with Tally XML export),
Work Order Tickets & Designer workflow, Sales Orders, Production, Inventory, Finance (Collections),
HR & Attendance, Field Visits, Team Reports (DAR/WWR/MWR), Batch Data Import/Export, Admin & User
Management, and Audit Trail.

Note: the screens shown throughout this manual are representative illustrations of the live application.`,
  },
  {
    num: "2", title: "Getting Started — Login & Navigation",
    intro: "Login and navigate the system in a few steps.",
    screenKey: "2",
    steps: [
      { step: "Open the application", desc: "Open any modern browser and go to bprozagcrm.xyz. Recommended: Google Chrome (latest version). The system works on all major browsers and mobile devices." },
      { step: "Sign in", desc: "Enter your registered email address and password. New users receive login credentials via email after their account is approved by the IT Admin." },
      { step: "Dashboard — your home screen", desc: "After login you land on the Dashboard. It shows live KPIs: Total Revenue, Active Orders, Open Leads, Pending Collections, Open Complaints and Team Tasks." },
      { step: "Sidebar navigation", desc: "On desktop: click any module in the left sidebar. The sidebar is organised into sections — OVERVIEW, SALES, OPERATIONS, FINANCE, PEOPLE & FIELD, REPORTS, ADMIN. On mobile: tap the ☰ icon (top-left) to open the full menu." },
      { step: "Global search", desc: "Press Cmd+K (Mac) or Ctrl+K (Windows) at any time to open the global search. Type any name, number or keyword to search across all modules simultaneously." },
      { step: "Install on mobile (PWA)", desc: "Android: Chrome → ⋮ menu → Add to Home Screen. iPhone: Safari → Share button → Add to Home Screen. The app then opens full-screen like a native mobile app." },
    ],
    tips: [
      "Your session stays active for 24 hours. If you see the login screen, your session has expired — sign in again.",
      "Modules you do not have access to are automatically hidden from the sidebar.",
    ],
  },
  {
    num: "3", title: "End-to-End Business Workflow",
    intro: `The complete business workflow in ZAG SIGNS ERP follows this chain:

LEAD  →  OPPORTUNITY  →  CUSTOMER  →  QUOTATION  →  WORK ORDER  →  SALES ORDER  →  INVOICE  →  TALLY

Each step is connected. Action buttons on every row let you move forward without re-entering data:
• On a Lead row: [Opp] → creates Opportunity | [Customer] → creates Customer | [Quote] → creates Quotation
• On an Opportunity row: [Customer] → creates Customer | [Quote] → creates Quotation
• On a Customer row: [Quote] → creates Quotation
• On an approved Quotation: [Ticket] → raises a Work Order Ticket | [Invoice] → creates Tax Invoice (items auto-copied)
• On an Invoice: [Tally XML] → downloads Tally import file | [Mark Paid] → updates payment status

This design ensures zero data re-entry from lead capture to final accounting.`,
  },
  {
    num: "4", title: "Leads & CRM Module",
    intro: "Track every sales prospect from first contact to conversion.",
    screenKey: "4",
    steps: [
      { step: "Add a new lead", desc: "Leads & CRM → click 'New Lead'. Required: Name, Phone, Branch, Source. Optional: Company, Email, Estimated Value, Follow-up Date, Assigned Executive." },
      { step: "Lead status workflow", desc: "Status moves through: NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON or LOST. Update the status as the conversation progresses. Always set a Follow-up Date." },
      { step: "Convert to Opportunity", desc: "Click the blue 'Opp' button on the lead row. An Opportunity is created linked to this lead. The lead status moves to QUALIFIED." },
      { step: "Convert to Customer", desc: "Click the green 'Customer' button. A Customer record is created auto-filled from the lead data. The lead is marked WON." },
      { step: "Create Quotation from Lead", desc: "Click the amber 'Quote' button. The Quotation form opens with the company name pre-filled and the customer field locked to this lead. Add items and submit." },
      { step: "Bulk import leads", desc: "Click 'Import' to bulk-upload a list from an exhibition or campaign — see Section 16, Batch Data Import & Export." },
      { step: "Export leads", desc: "Click 'Excel' to download the current filtered view. Use the status, branch and search filters first to narrow the list before exporting." },
    ],
    tips: [
      "Leads with today's Follow-up Date appear highlighted at the top of the list.",
      "Use Source = 'Referral' and note the referrer's name in the Notes field for tracking.",
    ],
    warning: "Do not mark a lead as WON without creating the Customer record — it breaks the linkage for future orders.",
  },
  {
    num: "5", title: "Opportunities Module",
    intro: "Track deal probability and pipeline value with visual funnel stages.",
    steps: [
      { step: "View the pipeline funnel", desc: "Opportunities page shows clickable stage buttons at the top with deal counts and total value. Click any stage to filter the table below." },
      { step: "Stages and probability", desc: "Stages: Qualification (20%) → Proposal Sent (40%) → Negotiation (65%) → Verbal Commitment (85%) → Closed Won (100%) / Closed Lost (0%). Probability auto-updates when you change stage." },
      { step: "Update stage", desc: "In the table, use the Stage dropdown on any row to move the deal forward. This updates probability automatically." },
      { step: "Convert to Customer or Quotation", desc: "Use the 'Customer' and 'Quote' action buttons on each opportunity row, same as on the Leads page." },
    ],
    tips: ["Closed Lost deals are hidden by default. Click the 'Lost' stage filter to review them."],
  },
  {
    num: "6", title: "Customers Module",
    intro: "Customer master records with full transaction history.",
    steps: [
      { step: "Add a customer", desc: "Customers → 'Add Customer'. Required: Name, Company, Phone, Branch. Optional: Email, GST No, Address, Credit Limit. Customer No auto-generated as C001." },
      { step: "Bulk import customers", desc: "Click 'Import' to migrate your existing customer base from Excel in one upload — see Section 16." },
      { step: "Create quotation from customer", desc: "Click the amber 'Quote' button on any customer row. The quotation form opens with this customer pre-selected." },
      { step: "View transaction history", desc: "Click any customer row to see all linked quotations, orders, invoices, complaints and collections in one panel." },
      { step: "Outstanding balance", desc: "The Outstanding Balance field updates automatically as invoices are created and collections are recorded." },
    ],
    tips: ["Customers converted from leads already have all their history linked — no manual setup needed."],
  },
  {
    num: "7", title: "Quotations Module",
    intro: "Create, send, revise and convert professional quotations with full GST support.",
    screenKey: "7",
    steps: [
      { step: "Create a quotation", desc: "Quotations → 'New Quotation'. Select Customer. Add line items: Description, Qty, Unit (Nos/Sqft/Rft/Mtr/Job/Set), Rate per Unit. Set GST % and Discount amount at the bottom. Click 'Create Quotation'." },
      { step: "Quotation number format", desc: "Auto-generated as ZAG/Q/BRANCH/001 (e.g. ZAG/Q/HO/007 for HO branch, ZAG/Q/TVM/003 for TVM branch). Numbers are sequential per branch and never reset." },
      { step: "Update status", desc: "DRAFT → SENT → EMAIL or WHATSAPP (record channel) → SUBMITTED → APPROVED → REJECTED. Update immediately when status changes." },
      { step: "Print the quotation PDF", desc: "Click 'PDF' on any row. The print dialog opens. Select 'Save as PDF'. The PDF includes: company logo, letterhead, GSTIN, line items table, CGST/SGST, bank details and signature blocks." },
      { step: "Revise a quotation", desc: "Click 'Revise' on any row. A new quotation is created as ZAG/Q/HO/007-R2, pre-filled with the original items. Edit changed items, add a Revision Note, and submit. All revisions show in the Revision History on the printed PDF." },
      { step: "Raise a ticket / invoice", desc: "On an APPROVED or SUBMITTED quotation: click 'Ticket' to raise a Work Order Ticket, or 'Invoice' to create a Tax Invoice — all items and customer details copy across automatically." },
    ],
    tips: [
      "GST calculation: Enter GST % in the Tax field. CGST and SGST are each half. Both print as separate lines.",
      "The 'Valid Until' date auto-expires the quotation (status becomes EXPIRED) after that date.",
      "Add a Salutation (M/s, Mr., Dr.) for the company and Kind Attn for the contact person — both print on the Bill To section.",
    ],
    warning: "Do not create multiple root quotations for the same deal. Use 'Revise' to create revised versions — this maintains a clean revision chain and correct numbering.",
  },
  {
    num: "8", title: "Invoices & Tally Integration",
    intro: "Generate Tax Invoices and sync to Tally with one click.",
    screenKey: "8",
    steps: [
      { step: "Create an invoice", desc: "Recommended: On an approved quotation, click 'Invoice'. All data is auto-copied. Invoice No format: ZAG/INV/HO/001." },
      { step: "Print the Tax Invoice PDF", desc: "Click the Printer icon on any invoice. Select 'Save as PDF'. The PDF shows: 'TAX INVOICE' header, Invoice No, Date, Due Date, Bill To, line items with CGST/SGST breakdown, bank details, signature blocks and GSTIN." },
      { step: "Export to Tally — Step 1", desc: "Click 'Tally XML' on any invoice row. The file downloads as ZAG-INV-HO-001.xml automatically. The invoice shows a green 'Tally synced' badge after export." },
      { step: "Export to Tally — Step 2 (Tally side)", desc: "In TallyPrime: Gateway of Tally → Import Data → Vouchers → press Enter → enter the path to the downloaded .xml file → press Enter. The Sales Voucher is created in Tally." },
      { step: "Tally ledger mapping", desc: "The XML creates: [Customer Name] (Party Ledger, debit), Sales Account (credit), Output CGST (credit), Output SGST (credit), Discount Allowed (debit, if any). Ensure these ledger names exist in your Tally company." },
      { step: "Mark payment status", desc: "'Mark Paid' — full payment received. 'Partial' — partial payment received (also record in Collections). Status: PENDING → PARTIAL → PAID. OVERDUE appears automatically after the Due Date passes with a balance." },
    ],
    tips: [
      "Always export Tally XML on the invoice date for clean accounts.",
      "Verify in Tally Day Book after import before processing any further vouchers.",
    ],
    warning: "Never import the same Tally XML file twice — it creates a duplicate Sales Voucher. Check the Day Book in Tally first. The 'Tally synced' badge indicates the file was already downloaded.",
  },
  {
    num: "9", title: "Work Order Tickets & Designer Workflow",
    intro: `A branch-level ticketing system. The front office raises a work order from a customer requirement —
direct visit, phone or WhatsApp — or straight from an approved quotation. The ticket is assigned to a
designer who completes the first phase before the job moves to production and billing. A parallel office
board gives the manager full control of work-in-progress, turnaround time and individual productivity.`,
    screenKey: "9",
    steps: [
      { step: "Raise a ticket (front office)", desc: "Work Order Tickets → 'New Ticket'. Choose Source (Walk-in / Phone / WhatsApp / From Quotation). Enter Customer, Nature of Work, Description, Reference (PO/sketch), Estimated Cost, Advance Paid, Payment Mode, ETA and Priority. Ticket No is ZAG/WO/BRANCH/001." },
      { step: "Raise from a quotation", desc: "On an approved/submitted quotation, click 'Ticket' — the customer, items and amounts are auto-filled into a new ticket." },
      { step: "Assign a designer", desc: "Select the preferred/available designer before printing. The ticket is then pushed to that designer's queue." },
      { step: "Print the work-order slip", desc: "Click 'Print'. The A4 slip shows costing, nature of work, ETA, reference, payment mode and customer + office signature blocks." },
      { step: "Designer picks it up (My Work)", desc: "The designer signs in → 'My Work' → sees only their own queue → 'Pick' then 'Start'. Status: NEW → ASSIGNED → IN PROGRESS." },
      { step: "Close with remarks", desc: "The designer marks 'Half-Done' (a reason is required) or 'Done' (remarks required for the next step / billing). The ticket then moves to billing." },
      { step: "Office control board", desc: "The branch manager sees columns — Assigned / In Progress / Half-Done / Done — plus average turnaround, per-designer productivity and SLA timers (tickets past their ETA turn red)." },
    ],
    tips: [
      "Use Priority = High for rush jobs — they sort to the top of every designer's queue.",
      "Every status change is timestamped, so turnaround time (assigned → done) is calculated automatically.",
    ],
    warning: "Half-Done requires a reason and Done requires remarks — this is enforced so no job is closed without a note for billing or the next step.",
  },
  {
    num: "10", title: "Sales Orders",
    intro: "Manage confirmed customer orders through production to delivery.",
    steps: [
      { step: "Create order", desc: "Sales Orders → 'New Order'. Link to Customer and optional Quotation. Set Delivery Date and Total Amount." },
      { step: "Track status", desc: "Draft → Confirmed → In Production → Ready → Installed → Invoiced → Collected." },
      { step: "Link work order", desc: "Once Confirmed, create a Work Order from the Work Orders module linked to this Sales Order for production tracking." },
    ],
    tips: ["Paid Amount updates automatically as Collections are recorded against this order."],
  },
  {
    num: "11", title: "Work Orders & Production",
    intro: "Job execution tracking, daily production logs and inventory management.",
    steps: [
      { step: "Create work order", desc: "Work Orders → 'New Work Order'. Link to Sales Order. Set Description, Start Date, Due Date, Priority and Assigned Team." },
      { step: "Update progress", desc: "Change status: Pending → In Progress → Quality Check → Dispatch Ready → Completed. Add notes visible to the sales team." },
      { step: "Log daily production", desc: "Production → 'New Log'. Select Work Order, enter: Units Produced, Downtime Hours, Downtime Reason (if any), Units Dispatched." },
      { step: "Inventory management", desc: "Inventory → 'Record Movement'. Select material, type (Stock In / Stock Out), quantity and reason. Stock levels update instantly. Items below minimum stock are highlighted." },
    ],
    tips: ["Work orders link to sales orders — the sales executive sees real-time production status without calling the production team."],
  },
  {
    num: "12", title: "Finance — Collections & Payments",
    intro: "Record all payments received and track outstanding dues.",
    screenKey: "COLLECTION",
    steps: [
      { step: "Record a payment (collection)", desc: "Collections → 'Record Payment'. Select: Customer, Invoice (optional), Sales Order (optional), Amount, Payment Mode (Cash / Cheque / NEFT / UPI / Bank Transfer), Reference No (cheque no / UTR no), Date." },
      { step: "Invoice payment tracking", desc: "Invoice status updates automatically: PENDING → PARTIAL → PAID. OVERDUE appears when the due date passes with a balance outstanding." },
      { step: "View collections summary", desc: "Filter collections by date range to see total cash received, a mode-wise breakdown (cash / NEFT / UPI etc.) and which invoices are still outstanding." },
    ],
    tips: [
      "Always enter the UTR/reference number for NEFT and UPI payments for bank reconciliation.",
      "Outstanding balance on customer records updates automatically with each collection.",
    ],
  },
  {
    num: "13", title: "HR & Attendance",
    intro: "Employee profiles, daily attendance and leave management.",
    screenKey: "HR",
    steps: [
      { step: "Add employee", desc: "HR & Attendance → Employees → 'Add Employee'. Required: Name, Designation, Department, Branch. Optional: Phone, Email, Date of Joining, Salary." },
      { step: "Bulk import employees", desc: "Click 'Import' on the Employees tab to upload staff records from Excel (HR/Admin only) — see Section 16." },
      { step: "Mark attendance", desc: "Attendance → 'Mark Attendance'. Select Employee, Date, Status (Present/Absent/Half Day/On Leave/Holiday). Add check-in and check-out times." },
      { step: "Leave request & approval", desc: "Leave Requests → 'New Request' (type, dates, reason). HR/MD see Approve / Reject on PENDING requests; the change is visible to the employee immediately." },
    ],
    tips: ["Attendance can be marked once per employee per day. To correct a mistake, open the existing record and update it."],
  },
  {
    num: "14", title: "Field Visits & Team Reports",
    intro: "Log all customer visits and file daily/weekly/monthly activity reports.",
    steps: [
      { step: "Log field visit", desc: "Field Visits → 'New Visit'. Required: Visit Type, Customer Name, Location, Start Time, End Time, Outcome. Optional: GPS coordinates, Next Action." },
      { step: "Daily Activity Report (DAR)", desc: "Team Reports → DAR → 'New DAR'. File daily: customer visits, calls made, orders booked, collections, travel, production output. Submit by end of day." },
      { step: "Weekly Work Report (WWR)", desc: "WWR → 'New WWR'. File weekly: sales target vs achievement, challenges, action plan. Submit by Monday for the previous week." },
      { step: "Monthly Work Report (MWR)", desc: "MWR → 'New MWR'. File monthly KPIs: sales achievement %, collection %, production efficiency %, complaints resolved." },
      { step: "Approval workflow", desc: "Reports flow: Submitted → Manager Approved → AVP Approved → MD Approved. Approvers see pending items on their Dashboard." },
    ],
  },
  {
    num: "15", title: "Admin & Settings",
    intro: "User management, company settings and complete audit trail. MD and IT Admin only.",
    steps: [
      { step: "Add new user", desc: "Admin → User Management → 'Add User'. Enter Full Name, Email, Role, Branch, Phone. The user receives a Welcome Email with a temporary password. Status starts as PENDING." },
      { step: "Approve user", desc: "In User Management, find the PENDING user → click Approve. Status becomes ACTIVE and the user can sign in." },
      { step: "Update role or branch", desc: "Click a user row → Edit → change Role, Branch or Status → Save. Changes take effect on next login." },
      { step: "Company Settings", desc: "Admin → Company Settings. Configure Company Name, Address, GSTIN, PAN, Bank Details, Logo URL, UPI QR URL and Default Terms. These appear on all quotations and invoices." },
      { step: "Audit Trail", desc: "Admin → Audit Trail. See every action: who did it, on which record, when, and what changed (before/after). Filter by table, action or user email." },
    ],
    warning: "Audit log entries are permanent and cannot be deleted or edited — even by the MD or IT Admin.",
  },
  {
    num: "16", title: "Batch Data Import & Export",
    intro: `Bulk-load and download data for Customers, Leads, Inventory and Employees using Excel —
ideal for first-time migration and periodic exports. Each of these pages carries Import and Excel buttons.`,
    screenKey: "BATCH",
    steps: [
      { step: "Download the template", desc: "On Customers, Leads, Inventory or HR → click 'Import' → 'Download Template (.xlsx)'. The file has a Data sheet (headers ready to fill) and an Instructions sheet listing required fields and examples." },
      { step: "Fill in your data", desc: "Enter one record per row in the Data sheet. Columns marked with * are required. Do not rename or reorder the headers. Save the file (.xlsx or .csv)." },
      { step: "Upload & preview", desc: "Click 'Import' again → drag or choose your file. You get a preview: valid rows are counted as 'ready'; rows missing required fields are highlighted amber and will be skipped." },
      { step: "Import & read the report", desc: "Click 'Import N records'. A summary shows how many were created, which duplicate rows were skipped (with row numbers) and any errors." },
      { step: "Export", desc: "Click 'Excel' on any of these pages to download the current (filtered) list as a spreadsheet." },
    ],
    tips: [
      "Maximum 2,000 rows per file — split larger lists into multiple uploads.",
      "Branch must be one of TVM, KTYM, EKM or CLT. Duplicates are detected by phone (customers/leads), name+category (inventory) or email (employees).",
      "Employee import is restricted to HR and administrators.",
    ],
    warning: "Duplicates are skipped, never overwritten — importing the same file twice will not change existing records or create copies.",
  },
];

const ROLE_MATRIX = {
  roles: ["MD", "AVP", "BM", "Sales", "CRE", "Designer", "Prodn", "Accts", "HR", "IT"],
  modules: [
    { name: "Dashboard",        access: [1,1,1,1,1,1,1,1,1,1] },
    { name: "Leads & CRM",      access: [1,1,1,1,1,0,0,0,0,1] },
    { name: "Customers",        access: [1,1,1,1,1,0,0,1,0,1] },
    { name: "Quotations",       access: [1,1,1,1,0,0,0,0,0,1] },
    { name: "Work Order Tickets", access: [1,1,1,1,1,1,0,0,0,1] },
    { name: "Sales Orders",     access: [1,1,1,1,0,0,1,1,0,1] },
    { name: "Production",       access: [1,1,0,0,0,0,1,0,0,1] },
    { name: "Inventory",        access: [1,1,0,0,0,0,1,0,0,1] },
    { name: "Invoices",         access: [1,1,1,0,0,0,0,1,0,1] },
    { name: "Collections",      access: [1,1,1,0,0,0,0,1,0,1] },
    { name: "HR & Attendance",  access: [1,1,0,0,0,0,0,0,1,1] },
    { name: "Field Visits",     access: [1,1,1,1,1,0,0,0,0,1] },
    { name: "Reports",          access: [1,1,1,1,1,1,1,1,1,1] },
    { name: "Admin",            access: [1,0,0,0,0,0,0,0,0,1] },
  ],
};

const FAQS = [
  { q: "How do I reset my password?", a: "Contact your IT Admin. Admin → User Management → find the user → Reset Password. A new password email is sent." },
  { q: "How do I raise a work order ticket?", a: "Work Order Tickets → New Ticket (choose Walk-in/Phone/WhatsApp/From Quotation), fill the details, assign a designer, then Print. The ticket appears in that designer's 'My Work' queue." },
  { q: "How does a designer get and close a job?", a: "The designer signs in → My Work → Pick → Start. When finished they click Done (remarks required) or Half-Done (reason required). The job then moves to billing." },
  { q: "How do I bulk-upload customers or leads?", a: "Open Customers (or Leads/Inventory/HR) → Import → Download Template → fill it → upload → preview → Import. Duplicates are skipped and reported. See Section 16." },
  { q: "Why were some rows skipped during import?", a: "Rows are skipped if they duplicate an existing record (by phone / name / email) or are missing a required field. The result summary lists each skipped row with its reason." },
  { q: "How do I create a revised quotation?", a: "Click 'Revise' on the quotation row. A new quotation is created pre-filled with original items and a -R2 suffix. Edit the changes, add a Revision Note, and submit." },
  { q: "How do I import an invoice into Tally?", a: "Click 'Tally XML' on the invoice → file downloads. In Tally: Gateway of Tally → Import Data → Vouchers → enter file path → Enter. The Sales Voucher is created." },
  { q: "The Tally import shows 'ledger not found'. What do I do?", a: "Create these ledgers in Tally: 'Sales Account' (Sales Accounts), 'Output CGST' and 'Output SGST' (Duties & Taxes). Or ask IT Admin to configure custom ledger names." },
  { q: "How do I record a partial payment?", a: "On the invoice click 'Partial', then Collections → Record Payment → enter the amount. Record another collection when the balance arrives — the invoice moves to PAID." },
  { q: "Can multiple users log in at the same time?", a: "Yes. Each user has their own secure session and all changes sync in real time across everyone logged in." },
  { q: "The PDF is printing on 2 pages. How do I fix it?", a: "In the print dialog set Margins to 'Minimum', scale to about 90%, and tick 'Background graphics'. For long documents, more than one page is normal." },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ManualPage() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = PRINT_STYLE;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div data-manual-content style={{ fontFamily: "Arial, sans-serif", fontSize: "11pt", color: "#000", maxWidth: "100%", width: "100%", margin: "0", padding: "0", backgroundColor: "white", lineHeight: "1.5" }}>

      {/* ── Print button (hidden on print) ── */}
      <div className="no-print" style={{ position: "fixed", top: "16px", right: "16px", zIndex: 50, display: "flex", gap: "8px" }}>
        <button onClick={() => window.history.back()}
          style={{ background: "#6B7280", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
          ← Back
        </button>
        <a href="/api/manual/pdf" download="ZAG-SIGNS-ERP-Manual-v1.2.pdf"
          style={{ display: "inline-block", background: "#10B981", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", cursor: "pointer", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
          📥 Download PDF
        </a>
        <button onClick={() => window.print()}
          style={{ background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
          🖨 Print
        </button>
      </div>

      {/* ── COVER PAGE ── */}
      <div style={{ minHeight: "265mm", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", borderBottom: "3px solid #4F46E5", paddingBottom: "16mm" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/zagsigns-logo.png" alt="ZAG SIGNS" style={{ height: "70px", width: "auto", marginBottom: "26px" }} />
        <h1 style={{ fontSize: "26pt", fontWeight: 900, color: "#4F46E5", letterSpacing: "1px", margin: "0 0 8px" }}>ZAG SIGNS ERP</h1>
        <h2 style={{ fontSize: "15pt", fontWeight: 400, color: "#6B7280", margin: "0 0 28px" }}>User Manual — Complete Guide</h2>
        <div style={{ width: "60px", height: "3px", background: "linear-gradient(90deg,#F0563F,#C2298A,#4F46E5)", margin: "0 auto 28px" }} />
        <p style={{ fontSize: "11pt", color: "#374151", lineHeight: 1.7, maxWidth: "125mm" }}>
          This manual covers every module of the ZAG SIGNS ERP — from lead capture and quotations to
          work-order tickets, tax invoices, Tally sync and bulk data import.
        </p>
        <div style={{ marginTop: "34px", fontSize: "11pt", color: "#111827", fontWeight: 700 }}>
          VER {VERSION} · {VERSION_DATE}
        </div>
        <div style={{ marginTop: "6px", fontSize: "10pt", color: "#9CA3AF" }}>
          <p style={{ margin: "2px 0" }}>bprozagcrm.xyz</p>
          <p style={{ margin: "2px 0" }}>Confidential — Internal Use Only</p>
        </div>
        <div style={{ marginTop: "22px" }}>
          <PoweredByBpro variant="light" logoHeight={20} />
        </div>
      </div>

      {/* ── TABLE OF CONTENTS ── */}
      <div className="page-break" style={{ paddingTop: "20px" }}>
        <h2 style={{ fontSize: "16pt", fontWeight: 800, color: "#4F46E5", borderBottom: "2px solid #4F46E5", paddingBottom: "8px", marginBottom: "16px" }}>
          Table of Contents
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {TOC.map(item => (
              <tr key={item.num} style={{ borderBottom: "1px dotted #E5E7EB" }}>
                <td style={{ padding: "6px 0", width: "30px", color: "#4F46E5", fontWeight: 700, fontSize: "10pt" }}>{item.num}.</td>
                <td style={{ padding: "6px 0", color: "#374151", fontSize: "10pt" }}>{item.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── CONTENT SECTIONS ── */}
      {SECTIONS.map(section => {
        const screen = section.screenKey ? SCREENS[section.screenKey] : undefined;
        return (
          <div key={section.num} className="page-break" style={{ paddingTop: "20px" }}>
            <h2 style={{ fontSize: "15pt", fontWeight: 800, color: "#4F46E5", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px", marginBottom: "14px" }}>
              {section.num}. {section.title}
            </h2>

            {/* Intro */}
            <p style={{ fontSize: "10.5pt", color: "#374151", lineHeight: 1.7, marginBottom: "14px", whiteSpace: "pre-line" }}>
              {section.intro}
            </p>

            {/* Screen illustration */}
            {screen && (
              <div className="avoid-break" style={{ margin: "0 0 16px" }}>
                {screen.node}
                <Caption>{screen.caption}</Caption>
              </div>
            )}

            {/* Warning */}
            {section.warning && (
              <div className="avoid-break" style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px" }}>
                <strong style={{ color: "#92400E", fontSize: "10pt" }}>⚠ Important: </strong>
                <span style={{ color: "#78350F", fontSize: "10pt" }}>{section.warning}</span>
              </div>
            )}

            {/* Steps */}
            {section.steps && section.steps.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: "11pt", fontWeight: 700, color: "#374151", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Step-by-Step Guide
                </h3>
                {section.steps.map((s, i) => (
                  <div key={i} className="avoid-break" style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ width: "26px", height: "26px", background: "#4F46E5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                      <span style={{ color: "#fff", fontSize: "10pt", fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "10.5pt", color: "#1a1a1a" }}>{s.step}</strong>
                      <p style={{ fontSize: "10pt", color: "#374151", lineHeight: 1.65, margin: "3px 0 0" }}>{s.desc}</p>
                      {s.note && (
                        <p style={{ fontSize: "9.5pt", color: "#6366F1", margin: "4px 0 0", fontStyle: "italic" }}>ℹ {s.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            {section.tips && section.tips.length > 0 && (
              <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "6px", padding: "10px 14px" }}>
                <h4 style={{ fontSize: "10pt", fontWeight: 700, color: "#4F46E5", margin: "0 0 8px" }}>Pro Tips</h4>
                <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                  {section.tips.map((tip, i) => (
                    <li key={i} style={{ fontSize: "10pt", color: "#374151", lineHeight: 1.6, marginBottom: "4px" }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* ── ROLE MATRIX ── */}
      <div className="page-break" style={{ paddingTop: "20px" }}>
        <h2 style={{ fontSize: "15pt", fontWeight: 800, color: "#4F46E5", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px", marginBottom: "14px" }}>
          17. Role Permission Matrix
        </h2>
        <p style={{ fontSize: "10pt", color: "#374151", marginBottom: "14px" }}>
          Which modules each role can access. BM = Business Manager, Sales = Sales Executive, CRE = Customer Relations,
          Prodn = Production, Accts = Accounts, IT = IT Admin. Roles are assigned by the IT Admin in Admin → User Management.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
          <thead>
            <tr style={{ background: "#4F46E5", color: "#fff" }}>
              <th style={{ padding: "6px 7px", textAlign: "left", fontWeight: 700 }}>Module</th>
              {ROLE_MATRIX.roles.map(r => (
                <th key={r} style={{ padding: "6px 3px", textAlign: "center", fontWeight: 700, whiteSpace: "nowrap" }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLE_MATRIX.modules.map((m, i) => (
              <tr key={m.name} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <td style={{ padding: "5px 7px", fontWeight: 500, color: "#374151", whiteSpace: "nowrap" }}>{m.name}</td>
                {m.access.map((a, j) => (
                  <td key={j} style={{ padding: "5px 3px", textAlign: "center", color: a ? "#16A34A" : "#D1D5DB", fontWeight: a ? 700 : 400 }}>
                    {a ? "✓" : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── FAQ ── */}
      <div className="page-break" style={{ paddingTop: "20px" }}>
        <h2 style={{ fontSize: "15pt", fontWeight: 800, color: "#4F46E5", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px", marginBottom: "14px" }}>
          18. Frequently Asked Questions
        </h2>
        {FAQS.map((faq, i) => (
          <div key={i} className="avoid-break" style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid #F3F4F6" }}>
            <p style={{ fontWeight: 700, fontSize: "10.5pt", color: "#1a1a1a", margin: "0 0 5px" }}>Q{i+1}. {faq.q}</p>
            <p style={{ fontSize: "10pt", color: "#374151", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
          </div>
        ))}
      </div>

      {/* ── SHORTCUTS ── */}
      <div className="page-break" style={{ paddingTop: "20px" }}>
        <h2 style={{ fontSize: "15pt", fontWeight: 800, color: "#4F46E5", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px", marginBottom: "14px" }}>
          19. Keyboard Shortcuts & Tips
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead>
            <tr style={{ background: "#F3F4F6" }}>
              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "10pt", fontWeight: 700, color: "#374151" }}>Shortcut</th>
              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "10pt", fontWeight: 700, color: "#374151" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Cmd+K / Ctrl+K", "Open global search (search anything across all modules)"],
              ["Escape",          "Close any open modal, dialog or search overlay"],
              ["Cmd+P / Ctrl+P",  "Print the current page (use in Quotations or Invoices to save PDF)"],
              ["Cmd+Shift+R",     "Hard refresh — force reload latest data from server"],
            ].map(([key, action]) => (
              <tr key={key} style={{ borderBottom: "1px solid #E5E7EB" }}>
                <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: "10pt", fontWeight: 700, color: "#4F46E5", whiteSpace: "nowrap" }}>{key}</td>
                <td style={{ padding: "7px 10px", fontSize: "10pt", color: "#374151" }}>{action}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ fontSize: "12pt", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>General Best Practices</h3>
        <ul style={{ fontSize: "10pt", color: "#374151", lineHeight: 1.7, paddingLeft: "18px" }}>
          <li>Always update the lead status and follow-up date after every customer interaction.</li>
          <li>Create invoices from quotations (using the Invoice button) — never manually — to keep data consistent.</li>
          <li>Raise work-order tickets the moment a job is confirmed, and assign a designer before printing the slip.</li>
          <li>Export Tally XML on the same day as the invoice for clean day-book entries.</li>
          <li>When importing data, always download a fresh template first and keep the headers unchanged.</li>
          <li>Mark invoices Paid/Partial immediately when payment is received — don't let OVERDUE pile up.</li>
          <li>Never share your login credentials. Contact IT Admin if you suspect unauthorised access.</li>
          <li>Install the app on your phone (Add to Home Screen) for on-the-go access during field visits.</li>
        </ul>

        {/* Back cover */}
        <div style={{ marginTop: "40px", textAlign: "center", borderTop: "2px solid #4F46E5", paddingTop: "20px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zagsigns-logo.png" alt="ZAG SIGNS" style={{ height: "34px", width: "auto", marginBottom: "10px" }} />
          <p style={{ fontSize: "9pt", color: "#9CA3AF", margin: "2px 0" }}>VER {VERSION} · {VERSION_DATE} · bprozagcrm.xyz</p>
          <p style={{ fontSize: "9pt", color: "#9CA3AF", margin: "2px 0" }}>Confidential — Internal Use Only · For technical support, contact your IT Admin.</p>
          <div style={{ marginTop: "12px" }}>
            <PoweredByBpro variant="light" logoHeight={18} />
          </div>
        </div>
      </div>

    </div>
  );
}
