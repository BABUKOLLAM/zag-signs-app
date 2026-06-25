import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Image,
} from "@react-pdf/renderer";

// ── Version ──────────────────────────────────────────────────────────────────
const VERSION = "1.3";
const VERSION_DATE = "25/06/2026";
const LOGO_URL = "https://bprozagcrm.xyz/zagsigns-logo.png";

// ── Styles ────────────────────────────────────────────────────────────────────
const c = {
  indigo:    "#4F46E5",
  indigoLt:  "#EEF2FF",
  gray1:     "#111827",
  gray2:     "#374151",
  gray3:     "#6B7280",
  gray4:     "#9CA3AF",
  gray5:     "#E5E7EB",
  gray6:     "#F9FAFB",
  amber:     "#F59E0B",
  amberLt:   "#FEF3C7",
  amberDk:   "#92400E",
  amberDk2:  "#78350F",
  green:     "#16A34A",
  white:     "#FFFFFF",
};

const s = StyleSheet.create({
  page:          { paddingTop: 15, paddingBottom: 20, paddingHorizontal: 20, fontSize: 9, fontFamily: "Helvetica", color: c.gray2, backgroundColor: "#fff" },
  coverPage:     { paddingTop: 15, paddingBottom: 20, paddingHorizontal: 20, fontSize: 9, fontFamily: "Helvetica", color: c.gray2, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },

  // Cover
  coverLogo:     { width: 120, height: "auto", marginBottom: 20 },
  coverTitle:    { fontSize: 26, fontFamily: "Helvetica-Bold", color: c.indigo, letterSpacing: 0.5, marginBottom: 6 },
  coverSub:      { fontSize: 13, color: c.gray3, marginBottom: 22 },
  coverBar:      { width: 60, height: 3, backgroundColor: c.indigo, marginBottom: 22 },
  coverBody:     { fontSize: 10, color: c.gray2, lineHeight: 1.7, textAlign: "center", maxWidth: 320, marginBottom: 30 },
  coverVer:      { fontSize: 10, fontFamily: "Helvetica-Bold", color: c.gray1, marginBottom: 4 },
  coverMeta:     { fontSize: 8.5, color: c.gray4, marginBottom: 2, textAlign: "center" },
  coverFooter:   { fontSize: 8, color: c.gray3, marginTop: 20 },

  // Section headings
  sectionTitle:  { fontSize: 14, fontFamily: "Helvetica-Bold", color: c.indigo, paddingBottom: 5, borderBottomWidth: 1.5, borderBottomColor: c.gray5, marginBottom: 10 },
  subTitle:      { fontSize: 9, fontFamily: "Helvetica-Bold", color: c.gray2, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 7 },

  // Body text
  intro:         { fontSize: 9, color: c.gray2, lineHeight: 1.65, marginBottom: 10 },

  // Steps
  stepRow:       { flexDirection: "row", gap: 8, marginBottom: 8 },
  stepBadge:     { width: 20, height: 20, borderRadius: 10, backgroundColor: c.indigo, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepNum:       { fontSize: 8, fontFamily: "Helvetica-Bold", color: c.white },
  stepContent:   { flex: 1 },
  stepTitle:     { fontSize: 9, fontFamily: "Helvetica-Bold", color: c.gray1, marginBottom: 2 },
  stepDesc:      { fontSize: 8.5, color: c.gray2, lineHeight: 1.6 },

  // Tips
  tipsBox:       { backgroundColor: c.indigoLt, borderWidth: 1, borderColor: "#C7D2FE", borderRadius: 4, padding: 8, marginTop: 4 },
  tipsHead:      { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: c.indigo, marginBottom: 4 },
  tipItem:       { fontSize: 8.5, color: c.gray2, lineHeight: 1.55, marginBottom: 3 },

  // Warning
  warnBox:       { backgroundColor: c.amberLt, borderWidth: 1, borderColor: c.amber, borderRadius: 4, padding: 8, marginBottom: 8 },
  warnLabel:     { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: c.amberDk },
  warnText:      { fontSize: 8.5, color: c.amberDk2, lineHeight: 1.55 },

  // TOC
  tocRow:        { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: c.gray5, paddingVertical: 4 },
  tocNum:        { width: 22, fontSize: 9, fontFamily: "Helvetica-Bold", color: c.indigo },
  tocTitle:      { flex: 1, fontSize: 9, color: c.gray2 },

  // Role matrix
  matHead:       { flexDirection: "row", backgroundColor: c.indigo, padding: 5 },
  matHeadCell:   { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: c.white, textAlign: "center", flex: 1 },
  matHeadFirst:  { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: c.white, width: 90 },
  matRow:        { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: c.gray5, paddingVertical: 3 },
  matCell:       { flex: 1, fontSize: 7.5, color: c.gray2, textAlign: "center" },
  matFirst:      { width: 90, fontSize: 7.5, color: c.gray2, fontFamily: "Helvetica-Bold" },
  matCheck:      { color: c.green, fontFamily: "Helvetica-Bold" },
  matDash:       { color: c.gray5 },

  // FAQ
  faqQ:          { fontSize: 9, fontFamily: "Helvetica-Bold", color: c.gray1, marginBottom: 3 },
  faqA:          { fontSize: 8.5, color: c.gray2, lineHeight: 1.6, marginBottom: 10 },

  // Shortcuts table
  shortRow:      { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: c.gray5, paddingVertical: 5 },
  shortKey:      { width: 130, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: c.indigo },
  shortAction:   { flex: 1, fontSize: 8.5, color: c.gray2 },

  // Footer
  pageFooter:    { position: "absolute", bottom: 8, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: c.gray4 },
});

// ── Data ──────────────────────────────────────────────────────────────────────
const TOC = [
  { num: "1",  title: "Introduction & System Overview" },
  { num: "2",  title: "Getting Started — Login & Navigation" },
  { num: "3",  title: "End-to-End Business Workflow" },
  { num: "4",  title: "Leads & CRM Module" },
  { num: "5",  title: "Opportunities Module" },
  { num: "6",  title: "Customers Module" },
  { num: "7",  title: "Quotations Module" },
  { num: "8",  title: "Invoices & Tally Integration" },
  { num: "9",  title: "Work Order Tickets & Designer Workflow" },
  { num: "10", title: "Sales Orders" },
  { num: "11", title: "Work Orders & Production" },
  { num: "12", title: "Finance — Collections & Payments" },
  { num: "13", title: "HR & Attendance" },
  { num: "14", title: "Field Visits, Activity Tracker & Team Reports" },
  { num: "15", title: "Fixed Journey Plan (FJP)" },
  { num: "16", title: "Expense Reports" },
  { num: "17", title: "Three-Tier Approval Workflow" },
  { num: "18", title: "Admin & Settings" },
  { num: "19", title: "Batch Data Import & Export" },
  { num: "20", title: "Role Permission Matrix" },
  { num: "21", title: "Frequently Asked Questions" },
  { num: "22", title: "Keyboard Shortcuts & Tips" },
];

interface Step { step: string; desc: string; }
interface Section { num: string; title: string; intro: string; steps?: Step[]; tips?: string[]; warning?: string; }

const SECTIONS: Section[] = [
  { num: "1", title: "Introduction & System Overview",
    intro: "ZAG SIGNS ERP is a cloud-based Enterprise Resource Planning system built exclusively for ZAG SIGNS and its branches. It manages the complete business lifecycle — from capturing a sales lead to issuing a Tax Invoice and syncing with Tally — in one integrated platform.\n\nThe system is accessible at bprozagcrm.xyz from any browser (desktop, mobile, tablet). No installation is required.\n\nModules covered: CRM (Leads & Opportunities), Customers, Quotations, Invoices (with Tally XML export), Work Order Tickets & Designer workflow, Sales Orders, Production, Inventory, Finance (Collections), HR & Attendance, Field Visits, Activity Tracker, Fixed Journey Plans (FJP), Expense Reports, Three-Tier Approval Workflow, Team Reports (DAR/WWR/MWR), Batch Data Import/Export, Admin & User Management, and Audit Trail." },
  { num: "2", title: "Getting Started — Login & Navigation",
    intro: "Login and navigate the system in a few steps.",
    steps: [
      { step: "Open the application", desc: "Open any modern browser and go to bprozagcrm.xyz. Recommended: Google Chrome (latest version)." },
      { step: "Sign in", desc: "Enter your registered email address and password. New users receive login credentials via email after account approval by IT Admin." },
      { step: "Dashboard", desc: "After login you land on the Dashboard. It shows live KPIs: Total Revenue, Active Orders, Open Leads, Pending Collections, Open Complaints and Team Tasks." },
      { step: "Sidebar navigation", desc: "On desktop: click any module in the left sidebar. Sections: OVERVIEW, SALES, FIELD SALES, OPERATIONS, FINANCE, PEOPLE & FIELD, REPORTS, ADMIN. On mobile: tap the hamburger icon (top-left)." },
      { step: "Global search", desc: "Press Cmd+K (Mac) or Ctrl+K (Windows) to open global search. Type any name, number or keyword to search across all modules simultaneously." },
      { step: "Install on mobile (PWA)", desc: "Android: Chrome → three-dot menu → Add to Home Screen. iPhone: Safari → Share → Add to Home Screen." },
    ],
    tips: ["Your session stays active for 24 hours.", "Modules you do not have access to are automatically hidden from the sidebar."] },
  { num: "3", title: "End-to-End Business Workflow",
    intro: "The complete business workflow follows this chain:\n\nLEAD → OPPORTUNITY → CUSTOMER → QUOTATION → WORK ORDER → SALES ORDER → INVOICE → TALLY\n\nEach step is connected. Action buttons on every row let you move forward without re-entering data:\n• Lead row: [Opp] → Opportunity | [Customer] → Customer | [Quote] → Quotation\n• Opportunity row: [Customer] → Customer | [Quote] → Quotation\n• Customer row: [Quote] → Quotation\n• Approved Quotation: [Ticket] → Work Order Ticket | [Invoice] → Tax Invoice\n• Invoice: [Tally XML] → Tally import file | [Mark Paid] → updates payment status\n\nThis design ensures zero data re-entry from lead capture to final accounting." },
  { num: "4", title: "Leads & CRM Module",
    intro: "Track every sales prospect from first contact to conversion.",
    steps: [
      { step: "Add a new lead", desc: "Leads & CRM → 'New Lead'. Required: Name, Phone, Branch, Source. Optional: Company, Email, Estimated Value, Follow-up Date, Assigned Executive." },
      { step: "Lead status workflow", desc: "Status: NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON or LOST. Always set a Follow-up Date." },
      { step: "Convert to Opportunity", desc: "Click 'Opp' button on the lead row. An Opportunity is created linked to this lead." },
      { step: "Convert to Customer", desc: "Click 'Customer' button. A Customer record is created auto-filled from lead data." },
      { step: "Create Quotation from Lead", desc: "Click 'Quote' button. Quotation form opens with company name pre-filled." },
      { step: "Bulk import leads", desc: "Click 'Import' to bulk-upload a list — see Section 19." },
    ],
    tips: ["Leads with today's Follow-up Date appear highlighted at the top.", "Use Source = 'Referral' and note the referrer's name in Notes."],
    warning: "Do not mark a lead as WON without creating the Customer record — it breaks linkage for future orders." },
  { num: "5", title: "Opportunities Module",
    intro: "Track deal probability and pipeline value with visual funnel stages.",
    steps: [
      { step: "View the pipeline funnel", desc: "Opportunities page shows clickable stage buttons at the top with deal counts and total value." },
      { step: "Stages and probability", desc: "Qualification (20%) → Proposal Sent (40%) → Negotiation (65%) → Verbal Commitment (85%) → Closed Won (100%) / Closed Lost (0%)." },
      { step: "Update stage", desc: "Use the Stage dropdown on any row to move the deal forward. Probability auto-updates." },
      { step: "Convert to Customer or Quotation", desc: "Use the 'Customer' and 'Quote' action buttons on each opportunity row." },
    ], tips: ["Closed Lost deals are hidden by default. Click the 'Lost' stage filter to review them."] },
  { num: "6", title: "Customers Module",
    intro: "Customer master records with full transaction history.",
    steps: [
      { step: "Add a customer", desc: "Customers → 'Add Customer'. Required: Name, Company, Phone, Branch. Optional: Email, GST No, Address, Credit Limit." },
      { step: "Bulk import customers", desc: "Click 'Import' to migrate existing customer base from Excel — see Section 19." },
      { step: "Create quotation from customer", desc: "Click 'Quote' button on any customer row." },
      { step: "View transaction history", desc: "Click any customer row to see all linked quotations, orders, invoices, complaints and collections." },
    ], tips: ["Customers converted from leads already have all their history linked."] },
  { num: "7", title: "Quotations Module",
    intro: "Create, send, revise and convert professional quotations with full GST support.",
    steps: [
      { step: "Create a quotation", desc: "Quotations → 'New Quotation'. Select Customer. Add line items: Description, Qty, Unit, Rate. Set GST % and Discount." },
      { step: "Quotation number format", desc: "Auto-generated as ZAG/Q/BRANCH/001. Sequential per branch, never reset." },
      { step: "Update status", desc: "DRAFT → SENT → SUBMITTED → APPROVED → REJECTED. Update immediately when status changes." },
      { step: "Print the quotation PDF", desc: "Click 'PDF' on any row. Includes: logo, GSTIN, line items, CGST/SGST, bank details and signature blocks." },
      { step: "Revise a quotation", desc: "Click 'Revise'. New quotation created as ZAG/Q/HO/007-R2, pre-filled with original items." },
      { step: "Raise a ticket / invoice", desc: "On APPROVED quotation: click 'Ticket' to raise a Work Order Ticket, or 'Invoice' to create a Tax Invoice." },
    ],
    tips: ["GST: Enter GST %. CGST and SGST are each half.", "Valid Until date auto-expires the quotation."],
    warning: "Do not create multiple root quotations for the same deal. Use 'Revise' to create revised versions." },
  { num: "8", title: "Invoices & Tally Integration",
    intro: "Generate Tax Invoices and sync to Tally with one click.",
    steps: [
      { step: "Create an invoice", desc: "On an approved quotation, click 'Invoice'. All data is auto-copied. Invoice No: ZAG/INV/HO/001." },
      { step: "Print the Tax Invoice PDF", desc: "Click Printer icon. PDF shows: 'TAX INVOICE', Invoice No, Date, Due Date, line items with CGST/SGST, bank details, signature blocks." },
      { step: "Export to Tally — Step 1", desc: "Click 'Tally XML' on any invoice row. File downloads as ZAG-INV-HO-001.xml." },
      { step: "Export to Tally — Step 2 (Tally side)", desc: "In TallyPrime: Gateway of Tally → Import Data → Vouchers → enter file path → Enter." },
      { step: "Mark payment status", desc: "'Mark Paid' — full payment. 'Partial' — partial. Status: PENDING → PARTIAL → PAID. OVERDUE appears after Due Date." },
    ],
    tips: ["Always export Tally XML on the invoice date.", "Verify in Tally Day Book after import."],
    warning: "Never import the same Tally XML file twice — it creates a duplicate Sales Voucher." },
  { num: "9", title: "Work Order Tickets & Designer Workflow",
    intro: "A branch-level ticketing system. The front office raises a work order from a customer requirement — direct visit, phone or WhatsApp — or straight from an approved quotation. The ticket is assigned to a designer who completes the first phase before the job moves to production and billing.",
    steps: [
      { step: "Raise a ticket (front office)", desc: "Work Order Tickets → 'New Ticket'. Choose Source (Walk-in / Phone / WhatsApp / From Quotation). Enter Customer, Nature of Work, ETA and Priority." },
      { step: "Raise from a quotation", desc: "On an approved/submitted quotation, click 'Ticket' — customer, items and amounts auto-filled." },
      { step: "Assign a designer", desc: "Select the preferred/available designer before printing. Ticket pushed to that designer's queue." },
      { step: "Print the work-order slip", desc: "Click 'Print'. A4 slip shows costing, nature of work, ETA, signature blocks." },
      { step: "Designer picks it up (My Work)", desc: "Designer signs in → 'My Work' → sees own queue → 'Pick' then 'Start'. Status: NEW → ASSIGNED → IN PROGRESS." },
      { step: "Close with remarks", desc: "Designer marks 'Half-Done' (reason required) or 'Done' (remarks required). Ticket moves to billing." },
    ],
    tips: ["Priority = High for rush jobs — they sort to the top of every designer's queue.", "Every status change is timestamped for turnaround time tracking."],
    warning: "Half-Done requires a reason and Done requires remarks — enforced so no job is closed without a note." },
  { num: "10", title: "Sales Orders",
    intro: "Manage confirmed customer orders through production to delivery.",
    steps: [
      { step: "Create order", desc: "Sales Orders → 'New Order'. Link to Customer and optional Quotation. Set Delivery Date and Total Amount." },
      { step: "Track status", desc: "Draft → Confirmed → In Production → Ready → Installed → Invoiced → Collected." },
      { step: "Link work order", desc: "Once Confirmed, create a Work Order linked to this Sales Order for production tracking." },
    ], tips: ["Paid Amount updates automatically as Collections are recorded."] },
  { num: "11", title: "Work Orders & Production",
    intro: "Job execution tracking, production logs, machine scheduling and inventory management.",
    steps: [
      { step: "Create work order", desc: "Work Orders → 'New Work Order'. Link to Sales Order. Set Description, Start Date, Due Date, Priority." },
      { step: "Update progress", desc: "Pending → In Progress → Quality Check → Dispatch Ready → Completed." },
      { step: "Machine scheduling", desc: "Production → Machines → 'Schedule Board'. Assign jobs to machines. Conflict detection prevents double-booking." },
      { step: "Material consumption", desc: "Production → Materials → 'Add Materials'. Select work order, material, and planned quantity. Stock auto-deducted." },
      { step: "Quality checkpoints", desc: "Production → Quality → 'New Checkpoint'. Select stage. Mark PASS, FAIL, or CONDITIONAL PASS. Log defects if failed." },
    ], tips: ["Work orders link to sales orders — sales executive sees real-time production status."] },
  { num: "12", title: "Finance — Collections & Payments",
    intro: "Record all payments received and track outstanding dues.",
    steps: [
      { step: "Record a payment (collection)", desc: "Collections → 'Record Payment'. Select: Customer, Invoice, Amount, Payment Mode (Cash / Cheque / NEFT / UPI), Reference No, Date." },
      { step: "Invoice payment tracking", desc: "Invoice status: PENDING → PARTIAL → PAID. OVERDUE appears when due date passes with a balance." },
      { step: "View collections summary", desc: "Filter by date range to see total cash received, mode-wise breakdown and outstanding invoices." },
    ],
    tips: ["Always enter UTR/reference number for NEFT and UPI payments.", "Outstanding balance updates automatically with each collection."] },
  { num: "13", title: "HR & Attendance",
    intro: "Employee profiles, daily attendance and leave management.",
    steps: [
      { step: "Add employee", desc: "HR & Attendance → Employees → 'Add Employee'. Required: Name, Designation, Department, Branch." },
      { step: "Bulk import employees", desc: "Click 'Import' on the Employees tab to upload staff records from Excel — see Section 19." },
      { step: "Mark attendance", desc: "Attendance → 'Mark Attendance'. Select Employee, Date, Status (Present/Absent/Half Day/On Leave/Holiday)." },
      { step: "Leave request & approval", desc: "Leave Requests → 'New Request'. HR/MD see Approve / Reject on PENDING requests." },
    ], tips: ["Attendance can be marked once per employee per day."] },
  { num: "14", title: "Field Visits, Activity Tracker & Team Reports",
    intro: "Log all customer visits, track daily sales activities, and file DAR/WWR/MWR reports for manager review.",
    steps: [
      { step: "Log a field visit", desc: "Field Visits → 'New Visit'. Required: Visit Type, Customer Name, Location, Start Time, End Time, Outcome." },
      { step: "Daily Activity Log", desc: "Sales → Activities → 'Log Activity'. Choose type: Call / Meeting / Demo / Email / WhatsApp. All activities feed into the DAR automatically." },
      { step: "Auto-generate DAR", desc: "Sales → DAR → 'Generate Today's DAR'. System pre-fills from today's logged activities. Submit by 9 PM. Automated reminder sent at 9 PM daily." },
      { step: "Weekly Work Report (WWR)", desc: "Team Reports → WWR → 'New WWR'. File weekly: target vs achievement, challenges, action plan." },
      { step: "Monthly Work Report (MWR)", desc: "Team Reports → MWR → 'New MWR'. File monthly KPIs: sales achievement %, collection %, efficiency %." },
      { step: "Team Performance Dashboard", desc: "Sales → Team (Manager view). See each executive's activity count, leads, orders, collections vs target." },
    ],
    tips: ["Log every call and visit immediately — the auto-DAR depends on complete activity data.", "Automated reminder email at 9 PM for anyone who has not submitted their DAR.", "Claims window reminder email sent every Saturday and Sunday morning."] },
  { num: "15", title: "Fixed Journey Plan (FJP)",
    intro: "The Fixed Journey Plan is a mandatory monthly travel schedule submitted by each sales executive before the 27th of the previous month. It lists planned customer visits day-by-day, showing route, mode of travel, estimated km, and purpose. It serves as the reference document for travel expense claims.",
    steps: [
      { step: "Open FJP form", desc: "Sidebar → FIELD SALES → Journey Plan (FJP). A banner shows the submission window status — green if open, red if the 27th deadline has passed." },
      { step: "Add journey rows", desc: "Click 'Add Row'. Fill: Date, From Place, To Place, Customer/Prospect Name, Purpose, Mode of Travel, Estimated KM." },
      { step: "Save as draft", desc: "Click 'Save Draft' to save progress without submitting. Return and edit draft FJPs before submitting." },
      { step: "Submit FJP", desc: "Click 'Submit FJP'. System assigns FJP-YYYY-MM-NNN number. Submission blocked after 27th." },
      { step: "Print the FJP", desc: "In FJP History, click 'Print'. Printout includes route table, total KM, cost estimate (Rs.6/km), signature blocks." },
      { step: "Reference in Expense Claim", desc: "When submitting an expense report, select the relevant FJP from the dropdown to link it." },
    ],
    tips: ["Submit by the 27th — window closes automatically after that.", "Estimated travel cost calculated at Rs.6 per km (minimum rate)."],
    warning: "FJP submission after the 27th deadline is blocked by the system. Submit at least 2-3 days before the deadline." },
  { num: "16", title: "Expense Reports",
    intro: "Sales executives submit expense reports for all out-of-pocket costs — travel, accommodation, food, client entertainment, communication, and other business expenses. Each report can reference an FJP and must have itemised bills.",
    steps: [
      { step: "Open Expense Reports", desc: "Sidebar → FIELD SALES → Expense Reports. Click 'New Expense' to open the submission form." },
      { step: "Select expense type and FJP", desc: "Choose Expense Type: TRAVEL, ACCOMMODATION, FOOD, CLIENT_ENTERTAINMENT, COMMUNICATION, or OTHER. For travel, select the related FJP." },
      { step: "Enter expense line items", desc: "Add one row per expense item: Date, Category, Description, From/To Place, KM (for travel), Amount (Rs.), bill available (tick/untick)." },
      { step: "Enter advance received", desc: "Enter cash advance received. System auto-calculates Net Payable = Total - Advance." },
      { step: "Attach supporting documents", desc: "Click 'Choose Files' → select scanned bills/receipts → click 'Upload to Drive'. Files saved to Google Drive and linked to your report." },
      { step: "Save draft or submit", desc: "'Save Draft' to save without submitting. 'Submit for Approval' to enter the HOD → Accounts → CEO chain." },
      { step: "Print the expense voucher", desc: "Click 'Print' on any submitted report. Attach original hard-copy bills to this printout before handing to Accounts." },
    ],
    tips: ["Upload all bills to Drive before submitting — attachments cannot be added after submission.", "Items without bills are accepted but flagged — Accounts may query them."],
    warning: "Always print the expense voucher, attach original hard-copy bills, and physically submit to Accounts — required for audit compliance." },
  { num: "17", title: "Three-Tier Approval Workflow",
    intro: "Expense reports go through a mandatory three-stage approval before reimbursement. The chain is: HOD (Recommend) → Accounts (Verify) → CEO (Approve). Each stage can Approve, Hold, or Reject with a mandatory reason.",
    steps: [
      { step: "HOD stage — Recommend", desc: "After submission, the report lands with the HOD (Business Manager / AVP / MD). Options: Recommend (moves to Accounts), Hold (with reason), Reject (with reason)." },
      { step: "Accounts stage — Verify", desc: "Once recommended, Accounts verifies bill amounts, GST claims, advance deductions, policy compliance. Options: Verify (moves to CEO), Hold, Reject." },
      { step: "CEO stage — Approve", desc: "After Accounts verification, MD/CEO gives the final decision. Options: Approve (reimbursement authorised), Hold, Reject." },
      { step: "Email notifications", desc: "Submitter and HOD receive an email at every stage action — recommended, held, or rejected — with the reason." },
      { step: "Approval dashboard (Approvers)", desc: "Sidebar → FIELD SALES → Approvals. Approvers see expenses pending their action with a coloured 'Action Required' badge." },
      { step: "View attachment links", desc: "Expand any expense card → 'Attached Documents' → click any Drive link to open the bill/receipt in a new tab." },
    ],
    tips: ["Hold means 'pause and clarify' — the submitter can clarify and resubmit if required.", "Approvers can view full approval history inside each expense card."],
    warning: "Reasons are mandatory for Hold and Reject actions. The system will not allow an action without a reason." },
  { num: "18", title: "Admin & Settings",
    intro: "User management, company settings and complete audit trail. MD and IT Admin only.",
    steps: [
      { step: "Add new user", desc: "Admin → User Management → 'Add User'. Enter Full Name, Email, Role, Branch, Phone. User receives a Welcome Email. Status starts as PENDING." },
      { step: "Approve user", desc: "Find the PENDING user → click Approve. Status becomes ACTIVE." },
      { step: "Update role or branch", desc: "Click a user row → Edit → change Role, Branch or Status → Save. Changes take effect on next login." },
      { step: "Company Settings", desc: "Admin → Company Settings. Configure Company Name, Address, GSTIN, PAN, Bank Details, Logo URL, UPI QR URL and Default Terms." },
      { step: "Audit Trail", desc: "Admin → Audit Trail. See every action: who did it, on which record, when, and what changed (before/after)." },
    ],
    warning: "Audit log entries are permanent and cannot be deleted or edited — even by the MD or IT Admin." },
  { num: "19", title: "Batch Data Import & Export",
    intro: "Bulk-load and download data for Customers, Leads, Inventory and Employees using Excel.",
    steps: [
      { step: "Download the template", desc: "On Customers, Leads, Inventory or HR → click 'Import' → 'Download Template (.xlsx)'. Data sheet with headers ready to fill + Instructions sheet." },
      { step: "Fill in your data", desc: "Enter one record per row. Columns marked * are required. Do not rename or reorder headers." },
      { step: "Upload & preview", desc: "Click 'Import' again → drag or choose your file. Valid rows counted as 'ready'; missing required fields highlighted amber and skipped." },
      { step: "Import & read the report", desc: "Click 'Import N records'. Summary shows how many created, which duplicates skipped (with row numbers) and any errors." },
      { step: "Export", desc: "Click 'Excel' on any of these pages to download the current filtered list as a spreadsheet." },
    ],
    tips: ["Maximum 2,000 rows per file.", "Branch must be one of TVM, KTYM, EKM or CLT.", "Employee import restricted to HR and administrators."],
    warning: "Duplicates are skipped, never overwritten — importing the same file twice will not create copies." },
];

const ROLE_MATRIX = {
  roles: ["MD", "AVP", "BM", "Sales", "CRE", "Dsgn", "Prodn", "Accts", "HR", "IT"],
  modules: [
    { name: "Dashboard",          access: [1,1,1,1,1,1,1,1,1,1] },
    { name: "Leads & CRM",        access: [1,1,1,1,1,0,0,0,0,1] },
    { name: "Customers",          access: [1,1,1,1,1,0,0,1,0,1] },
    { name: "Quotations",         access: [1,1,1,1,0,0,0,0,0,1] },
    { name: "Work Order Tickets", access: [1,1,1,1,1,1,0,0,0,1] },
    { name: "Sales Orders",       access: [1,1,1,1,0,0,1,1,0,1] },
    { name: "Production",         access: [1,1,0,0,0,0,1,0,0,1] },
    { name: "Inventory",          access: [1,1,0,0,0,0,1,0,0,1] },
    { name: "Invoices",           access: [1,1,1,0,0,0,0,1,0,1] },
    { name: "Collections",        access: [1,1,1,0,0,0,0,1,0,1] },
    { name: "HR & Attendance",    access: [1,1,0,0,0,0,0,0,1,1] },
    { name: "Field Visits",       access: [1,1,1,1,1,0,0,0,0,1] },
    { name: "Activity / DAR",     access: [1,1,1,1,1,0,0,0,0,1] },
    { name: "Journey Plan (FJP)", access: [1,1,1,1,0,0,0,0,0,1] },
    { name: "Expense Reports",    access: [1,1,1,1,0,0,0,0,0,1] },
    { name: "Approvals (HOD)",    access: [1,1,1,0,0,0,0,0,0,0] },
    { name: "Approvals (Accts)",  access: [1,0,0,0,0,0,0,1,0,0] },
    { name: "Approvals (CEO)",    access: [1,0,0,0,0,0,0,0,0,0] },
    { name: "Reports",            access: [1,1,1,1,1,1,1,1,1,1] },
    { name: "Admin",              access: [1,0,0,0,0,0,0,0,0,1] },
  ],
};

const FAQS = [
  { q: "How do I reset my password?", a: "Contact your IT Admin. Admin → User Management → find the user → Reset Password. A new password email is sent." },
  { q: "How do I raise a work order ticket?", a: "Work Order Tickets → New Ticket, fill the details, assign a designer, then Print. Ticket appears in that designer's 'My Work' queue." },
  { q: "How does a designer get and close a job?", a: "Designer signs in → My Work → Pick → Start. When finished: Done (remarks required) or Half-Done (reason required). Job moves to billing." },
  { q: "How do I bulk-upload customers or leads?", a: "Open Customers (or Leads/Inventory/HR) → Import → Download Template → fill it → upload → preview → Import. Duplicates skipped and reported. See Section 19." },
  { q: "Why were some rows skipped during import?", a: "Rows skipped if they duplicate an existing record (by phone/name/email) or are missing a required field. Result summary lists each skipped row with its reason." },
  { q: "How do I create a revised quotation?", a: "Click 'Revise' on the quotation row. New quotation created pre-filled with original items and a -R2 suffix. Edit changes, add Revision Note, and submit." },
  { q: "How do I import an invoice into Tally?", a: "Click 'Tally XML' on the invoice → file downloads. In Tally: Gateway of Tally → Import Data → Vouchers → enter file path → Enter." },
  { q: "The Tally import shows 'ledger not found'. What do I do?", a: "Create these ledgers in Tally: 'Sales Account' (Sales Accounts), 'Output CGST' and 'Output SGST' (Duties & Taxes)." },
  { q: "How do I record a partial payment?", a: "On the invoice click 'Partial', then Collections → Record Payment → enter the amount. Record another collection when balance arrives." },
  { q: "Can multiple users log in at the same time?", a: "Yes. Each user has their own secure session and all changes sync in real time." },
  { q: "What is the FJP deadline and what happens if I miss it?", a: "FJP must be submitted on or before the 27th of the month preceding the travel month. After the 27th, the window closes automatically." },
  { q: "Can I attach receipts to my expense report?", a: "Yes. In the expense form, choose files, then click 'Upload to Drive'. Files saved to Google Drive and linked to your expense report." },
  { q: "My expense was put 'On Hold' — what do I do?", a: "You will receive an email with the HOD's reason. Review the comment, provide the clarification or correction requested, and resubmit if required." },
  { q: "Who can approve expense reports?", a: "Three-stage chain: HOD (Business Manager / AVP / MD) recommends → Accounts verifies → MD/CEO approves." },
  { q: "How do I log my daily activities for the DAR?", a: "Sales → Activities → 'Log Activity'. At end of day go to Sales → DAR → 'Generate Today's DAR' to auto-build the report from your logged activities." },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function PageFooter({ title }: { title: string }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text>ZAG SIGNS ERP — User Manual v{VERSION}</Text>
      <Text>{title}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function SectionPage({ section }: { section: Section }) {
  return (
    <Page size="A4" style={s.page} wrap>
      <PageFooter title={`${section.num}. ${section.title}`} />

      <Text style={s.sectionTitle}>{section.num}. {section.title}</Text>

      <Text style={s.intro}>{section.intro}</Text>

      {section.warning && (
        <View style={s.warnBox}>
          <Text style={s.warnLabel}>Important: </Text>
          <Text style={s.warnText}>{section.warning}</Text>
        </View>
      )}

      {section.steps && section.steps.length > 0 && (
        <View>
          <Text style={s.subTitle}>Step-by-Step Guide</Text>
          {section.steps.map((step, i) => (
            <View key={i} style={s.stepRow} wrap={false}>
              <View style={s.stepBadge}><Text style={s.stepNum}>{i + 1}</Text></View>
              <View style={s.stepContent}>
                <Text style={s.stepTitle}>{step.step}</Text>
                <Text style={s.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {section.tips && section.tips.length > 0 && (
        <View style={s.tipsBox} wrap={false}>
          <Text style={s.tipsHead}>Pro Tips</Text>
          {section.tips.map((tip, i) => (
            <Text key={i} style={s.tipItem}>• {tip}</Text>
          ))}
        </View>
      )}
    </Page>
  );
}

// ── Main document ─────────────────────────────────────────────────────────────
export function ManualPDFDocument() {
  return (
    <Document
      title={`ZAG SIGNS ERP — User Manual v${VERSION}`}
      author="ZAG SIGNS"
      subject="ERP User Manual"
      creator="bprozagcrm.xyz"
    >
      {/* ── COVER PAGE ── */}
      <Page size="A4" style={s.coverPage}>
        <Image src={LOGO_URL} style={s.coverLogo} />
        <Text style={s.coverTitle}>ZAG SIGNS ERP</Text>
        <Text style={s.coverSub}>User Manual — Complete Guide</Text>
        <View style={s.coverBar} />
        <Text style={s.coverBody}>
          This manual covers every module of the ZAG SIGNS ERP — from lead capture and quotations
          to work-order tickets, tax invoices, Tally sync, Fixed Journey Plans, expense reports
          with three-tier approvals, and bulk data import.
        </Text>
        <Text style={s.coverVer}>VER {VERSION} · {VERSION_DATE}</Text>
        <Text style={s.coverMeta}>bprozagcrm.xyz</Text>
        <Text style={s.coverMeta}>Confidential — Internal Use Only</Text>
        <Text style={s.coverFooter}>Powered by Team bpro</Text>
      </Page>

      {/* ── TABLE OF CONTENTS ── */}
      <Page size="A4" style={s.page}>
        <PageFooter title="Table of Contents" />
        <Text style={s.sectionTitle}>Table of Contents</Text>
        {TOC.map(item => (
          <View key={item.num} style={s.tocRow}>
            <Text style={s.tocNum}>{item.num}.</Text>
            <Text style={s.tocTitle}>{item.title}</Text>
          </View>
        ))}
      </Page>

      {/* ── CONTENT SECTIONS ── */}
      {SECTIONS.map(section => (
        <SectionPage key={section.num} section={section} />
      ))}

      {/* ── ROLE MATRIX ── */}
      <Page size="A4" style={s.page}>
        <PageFooter title="20. Role Permission Matrix" />
        <Text style={s.sectionTitle}>20. Role Permission Matrix</Text>
        <Text style={[s.intro, { marginBottom: 8 }]}>
          BM = Business Manager, Sales = Sales Executive, CRE = Customer Relations,
          Dsgn = Designer, Prodn = Production, Accts = Accounts, IT = IT Admin.
        </Text>
        <View style={s.matHead}>
          <Text style={s.matHeadFirst}>Module</Text>
          {ROLE_MATRIX.roles.map(r => <Text key={r} style={s.matHeadCell}>{r}</Text>)}
        </View>
        {ROLE_MATRIX.modules.map((m, i) => (
          <View key={m.name} style={[s.matRow, { backgroundColor: i % 2 === 0 ? "#fff" : c.gray6 }]}>
            <Text style={s.matFirst}>{m.name}</Text>
            {m.access.map((a, j) => (
              <Text key={j} style={[s.matCell, a ? s.matCheck : s.matDash]}>{a ? "✓" : "—"}</Text>
            ))}
          </View>
        ))}
      </Page>

      {/* ── FAQ ── */}
      <Page size="A4" style={s.page}>
        <PageFooter title="21. Frequently Asked Questions" />
        <Text style={s.sectionTitle}>21. Frequently Asked Questions</Text>
        {FAQS.map((faq, i) => (
          <View key={i} wrap={false}>
            <Text style={s.faqQ}>Q{i + 1}. {faq.q}</Text>
            <Text style={s.faqA}>{faq.a}</Text>
          </View>
        ))}
      </Page>

      {/* ── SHORTCUTS & BEST PRACTICES ── */}
      <Page size="A4" style={s.page}>
        <PageFooter title="22. Keyboard Shortcuts & Tips" />
        <Text style={s.sectionTitle}>22. Keyboard Shortcuts & Tips</Text>
        <View style={{ marginBottom: 14 }}>
          {[
            ["Cmd+K / Ctrl+K", "Open global search (search anything across all modules)"],
            ["Escape",          "Close any open modal, dialog or search overlay"],
            ["Cmd+P / Ctrl+P",  "Print the current page (use in Quotations or Invoices to save PDF)"],
            ["Cmd+Shift+R",     "Hard refresh — force reload latest data from server"],
          ].map(([key, action]) => (
            <View key={key} style={s.shortRow} wrap={false}>
              <Text style={s.shortKey}>{key}</Text>
              <Text style={s.shortAction}>{action}</Text>
            </View>
          ))}
        </View>
        <Text style={[s.subTitle, { marginTop: 6 }]}>General Best Practices</Text>
        {[
          "Always update lead status and follow-up date after every customer interaction.",
          "Create invoices from quotations (using the Invoice button) — never manually.",
          "Submit FJP by the 27th of the previous month without fail.",
          "Upload all bills to Drive before submitting expense reports.",
          "Raise work-order tickets the moment a job is confirmed, and assign a designer before printing the slip.",
          "Export Tally XML on the same day as the invoice for clean day-book entries.",
          "Mark invoices Paid/Partial immediately when payment is received.",
          "Never share your login credentials. Contact IT Admin if you suspect unauthorised access.",
          "Install the app on your phone (Add to Home Screen) for on-the-go access during field visits.",
        ].map((tip, i) => (
          <Text key={i} style={[s.tipItem, { marginBottom: 5 }]}>• {tip}</Text>
        ))}
        {/* Back cover */}
        <View style={{ marginTop: 30, borderTopWidth: 1.5, borderTopColor: c.indigo, paddingTop: 14, alignItems: "center" }}>
          <Text style={{ fontSize: 8.5, color: c.gray4, marginBottom: 2 }}>VER {VERSION} · {VERSION_DATE} · bprozagcrm.xyz</Text>
          <Text style={{ fontSize: 8.5, color: c.gray4, marginBottom: 4 }}>Confidential — Internal Use Only · For technical support, contact your IT Admin.</Text>
          <Text style={{ fontSize: 8, color: c.gray3 }}>Powered by Team bpro</Text>
        </View>
      </Page>
    </Document>
  );
}
