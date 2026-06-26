"use client";
import { useEffect } from "react";
import { SCREENS, Caption } from "./Screens";
import PoweredByBpro from "@/components/PoweredByBpro";

const VERSION = "1.3";
const VERSION_DATE = "25/06/2026";

const PRINT_STYLE = `
  * { box-sizing: border-box; }
  body, html { margin: 0; padding: 0; width: 100%; background: white !important; color: black !important; }
  @media screen { body { background: #f5f5f5; } }
  @media print {
    body * { visibility: visible !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: white !important; }
    * { box-shadow: none !important; }
    .no-print { display: none !important; }
    nav, aside, header, footer, [class*="sidebar"], [class*="Sidebar"], [class*="topbar"], [class*="TopBar"], [class*="bottom-nav"] { display: none !important; }
    .lg\\:ml-64 { margin-left: 0 !important; }
    .page-break { page-break-before: always; page-break-inside: avoid; }
    h1, h2, h3 { page-break-after: avoid; }
    .avoid-break { page-break-inside: avoid; }
    a { color: black !important; text-decoration: none; }
  }
  @page { size: A4; margin: 15mm; }
`;

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

interface ManualStep { step: string; desc: string; note?: string; }
interface ManualSection { num: string; title: string; intro: string; steps?: ManualStep[]; tips?: string[]; warning?: string; screenKey?: string; }

const SECTIONS: ManualSection[] = [
  { num: "1", title: "Introduction & System Overview",
    intro: `ZAG SIGNS ERP is a cloud-based Enterprise Resource Planning system built exclusively for ZAG SIGNS and its branches. It manages the complete business lifecycle — from capturing a sales lead to issuing a Tax Invoice and syncing with Tally — in one integrated platform.\n\nThe system is accessible at bprozagcrm.xyz from any browser (desktop, mobile, tablet). No installation is required.\n\nModules covered: CRM (Leads & Opportunities), Customers, Quotations, Invoices (with Tally XML export), Work Order Tickets & Designer workflow, Sales Orders, Production, Inventory, Finance (Collections), HR & Attendance, Field Visits, Activity Tracker, Fixed Journey Plans (FJP), Expense Reports, Three-Tier Approval Workflow, Team Reports (DAR/WWR/MWR), Batch Data Import/Export, Admin & User Management, and Audit Trail.` },
  { num: "2", title: "Getting Started — Login & Navigation", intro: "Login and navigate the system in a few steps.", screenKey: "2",
    steps: [
      { step: "Open the application", desc: "Open any modern browser and go to bprozagcrm.xyz. Recommended: Google Chrome (latest version)." },
      { step: "Sign in", desc: "Enter your registered email address and password. New users receive login credentials via email after account approval by IT Admin." },
      { step: "Dashboard", desc: "After login you land on the Dashboard. It shows live KPIs: Total Revenue, Active Orders, Open Leads, Pending Collections, Open Complaints and Team Tasks." },
      { step: "Sidebar navigation", desc: "On desktop: click any module in the left sidebar. Sections: OVERVIEW, SALES, FIELD SALES, OPERATIONS, FINANCE, PEOPLE & FIELD, REPORTS, ADMIN. On mobile: tap ☰ (top-left)." },
      { step: "Global search", desc: "Press Cmd+K (Mac) or Ctrl+K (Windows) to open global search. Type any name, number or keyword to search across all modules simultaneously." },
      { step: "Install on mobile (PWA)", desc: "Android: Chrome → ⋮ → Add to Home Screen. iPhone: Safari → Share → Add to Home Screen. Opens full-screen like a native app." },
    ],
    tips: ["Your session stays active for 24 hours.", "Modules you do not have access to are automatically hidden from the sidebar."] },
  { num: "3", title: "End-to-End Business Workflow",
    intro: `The complete business workflow follows this chain:\n\nLEAD → OPPORTUNITY → CUSTOMER → QUOTATION → WORK ORDER → SALES ORDER → INVOICE → TALLY\n\nEach step is connected. Action buttons on every row let you move forward without re-entering data:\n• On a Lead row: [Opp] → Opportunity | [Customer] → Customer | [Quote] → Quotation\n• On an Opportunity row: [Customer] → Customer | [Quote] → Quotation\n• On a Customer row: [Quote] → Quotation\n• On an approved Quotation: [Ticket] → Work Order Ticket | [Invoice] → Tax Invoice\n• On an Invoice: [Tally XML] → Tally import file | [Mark Paid] → updates payment status\n\nThis design ensures zero data re-entry from lead capture to final accounting.` },
  { num: "4", title: "Leads & CRM Module", intro: "Track every sales prospect from first contact to conversion.", screenKey: "4",
    steps: [
      { step: "Add a new lead", desc: "Leads & CRM → 'New Lead'. Required: Name, Phone, Branch, Source. Optional: Company, Email, Estimated Value, Follow-up Date, Assigned Executive." },
      { step: "Lead status workflow", desc: "Status: NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON or LOST. Always set a Follow-up Date." },
      { step: "Convert to Opportunity", desc: "Click 'Opp' button on the lead row. An Opportunity is created linked to this lead." },
      { step: "Convert to Customer", desc: "Click 'Customer' button. A Customer record is created auto-filled from lead data." },
      { step: "Create Quotation from Lead", desc: "Click 'Quote' button. Quotation form opens with company name pre-filled." },
      { step: "Bulk import leads", desc: "Click 'Import' to bulk-upload a list — see Section 19, Batch Data Import & Export." },
    ],
    tips: ["Leads with today's Follow-up Date appear highlighted at the top.", "Use Source = 'Referral' and note the referrer's name in Notes."],
    warning: "Do not mark a lead as WON without creating the Customer record — it breaks linkage for future orders." },
  { num: "5", title: "Opportunities Module", intro: "Track deal probability and pipeline value with visual funnel stages.",
    steps: [
      { step: "View the pipeline funnel", desc: "Opportunities page shows clickable stage buttons at the top with deal counts and total value." },
      { step: "Stages and probability", desc: "Qualification (20%) → Proposal Sent (40%) → Negotiation (65%) → Verbal Commitment (85%) → Closed Won (100%) / Closed Lost (0%)." },
      { step: "Update stage", desc: "Use the Stage dropdown on any row to move the deal forward. Probability auto-updates." },
      { step: "Convert to Customer or Quotation", desc: "Use the 'Customer' and 'Quote' action buttons on each opportunity row." },
    ], tips: ["Closed Lost deals are hidden by default. Click the 'Lost' stage filter to review them."] },
  { num: "6", title: "Customers Module", intro: "Customer master records with full transaction history.",
    steps: [
      { step: "Add a customer", desc: "Customers → 'Add Customer'. Required: Name, Company, Phone, Branch. Optional: Email, GST No, Address, Credit Limit." },
      { step: "Bulk import customers", desc: "Click 'Import' to migrate existing customer base from Excel — see Section 19." },
      { step: "Create quotation from customer", desc: "Click 'Quote' button on any customer row." },
      { step: "View transaction history", desc: "Click any customer row to see all linked quotations, orders, invoices, complaints and collections." },
    ], tips: ["Customers converted from leads already have all their history linked."] },
  { num: "7", title: "Quotations Module", intro: "Create, send, revise and convert professional quotations with full GST support.", screenKey: "7",
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
  { num: "8", title: "Invoices & Tally Integration", intro: "Generate Tax Invoices and sync to Tally with one click.", screenKey: "8",
    steps: [
      { step: "Create an invoice", desc: "Recommended: On an approved quotation, click 'Invoice'. All data is auto-copied. Invoice No: ZAG/INV/HO/001." },
      { step: "Print the Tax Invoice PDF", desc: "Click Printer icon. PDF shows: 'TAX INVOICE', Invoice No, Date, Due Date, line items with CGST/SGST, bank details, signature blocks." },
      { step: "Export to Tally — Step 1", desc: "Click 'Tally XML' on any invoice row. File downloads as ZAG-INV-HO-001.xml." },
      { step: "Export to Tally — Step 2 (Tally side)", desc: "In TallyPrime: Gateway of Tally → Import Data → Vouchers → enter file path → Enter." },
      { step: "Mark payment status", desc: "'Mark Paid' — full payment. 'Partial' — partial. Status: PENDING → PARTIAL → PAID. OVERDUE appears after Due Date." },
    ],
    tips: ["Always export Tally XML on the invoice date.", "Verify in Tally Day Book after import."],
    warning: "Never import the same Tally XML file twice — it creates a duplicate Sales Voucher." },
  { num: "9", title: "Work Order Tickets & Designer Workflow", intro: "A branch-level ticketing system. The front office raises a work order from a customer requirement — direct visit, phone or WhatsApp — or straight from an approved quotation. The ticket is assigned to a designer who completes the first phase before the job moves to production and billing.", screenKey: "9",
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
  { num: "10", title: "Sales Orders", intro: "Manage confirmed customer orders through production to delivery.",
    steps: [
      { step: "Create order", desc: "Sales Orders → 'New Order'. Link to Customer and optional Quotation. Set Delivery Date and Total Amount." },
      { step: "Track status", desc: "Draft → Confirmed → In Production → Ready → Installed → Invoiced → Collected." },
      { step: "Link work order", desc: "Once Confirmed, create a Work Order linked to this Sales Order for production tracking." },
    ], tips: ["Paid Amount updates automatically as Collections are recorded."] },
  { num: "11", title: "Work Orders & Production", intro: "Job execution tracking, production logs, machine scheduling and inventory management.",
    steps: [
      { step: "Create work order", desc: "Work Orders → 'New Work Order'. Link to Sales Order. Set Description, Start Date, Due Date, Priority." },
      { step: "Update progress", desc: "Pending → In Progress → Quality Check → Dispatch Ready → Completed." },
      { step: "Machine scheduling", desc: "Production → Machines → 'Schedule Board'. Assign jobs to machines. Conflict detection prevents double-booking." },
      { step: "Material consumption", desc: "Production → Materials → 'Add Materials'. Select work order, material, and planned quantity. Stock auto-deducted." },
      { step: "Quality checkpoints", desc: "Production → Quality → 'New Checkpoint'. Select stage (Pre-Production / Mid-Production / Pre-Delivery). Mark PASS, FAIL, or CONDITIONAL PASS. Log defects if failed." },
    ], tips: ["Work orders link to sales orders — sales executive sees real-time production status."] },
  { num: "12", title: "Finance — Collections & Payments", intro: "Record all payments received and track outstanding dues.", screenKey: "COLLECTION",
    steps: [
      { step: "Record a payment (collection)", desc: "Collections → 'Record Payment'. Select: Customer, Invoice, Amount, Payment Mode (Cash / Cheque / NEFT / UPI), Reference No, Date." },
      { step: "Invoice payment tracking", desc: "Invoice status: PENDING → PARTIAL → PAID. OVERDUE appears when due date passes with a balance." },
      { step: "View collections summary", desc: "Filter by date range to see total cash received, mode-wise breakdown and outstanding invoices." },
    ],
    tips: ["Always enter UTR/reference number for NEFT and UPI payments.", "Outstanding balance updates automatically with each collection."] },
  { num: "13", title: "HR & Attendance", intro: "Employee profiles, daily attendance and leave management.", screenKey: "HR",
    steps: [
      { step: "Add employee", desc: "HR & Attendance → Employees → 'Add Employee'. Required: Name, Designation, Department, Branch." },
      { step: "Bulk import employees", desc: "Click 'Import' on the Employees tab to upload staff records from Excel — see Section 19." },
      { step: "Mark attendance", desc: "Attendance → 'Mark Attendance'. Select Employee, Date, Status (Present/Absent/Half Day/On Leave/Holiday)." },
      { step: "Leave request & approval", desc: "Leave Requests → 'New Request'. HR/MD see Approve / Reject on PENDING requests." },
    ], tips: ["Attendance can be marked once per employee per day."] },
  { num: "14", title: "Field Visits, Activity Tracker & Team Reports", intro: "Log all customer visits, track daily sales activities, and file DAR/WWR/MWR reports for manager review.",
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
    intro: `The Fixed Journey Plan is a mandatory monthly travel schedule submitted by each sales executive before the 27th of the previous month. It lists planned customer visits day-by-day, showing route, mode of travel, estimated km, and purpose. It serves as the reference document for travel expense claims.`,
    steps: [
      { step: "Open FJP form", desc: "Sidebar → FIELD SALES → Journey Plan (FJP). A banner shows the submission window status — green if open (days remaining shown), red if the 27th deadline has passed." },
      { step: "Add journey rows", desc: "Click 'Add Row'. Fill: Date, From Place, To Place, Customer/Prospect Name, Purpose, Mode of Travel (Two Wheeler / Four Wheeler / Bus / Train / Flight / Auto), Estimated KM." },
      { step: "Save as draft", desc: "Click 'Save Draft' to save progress without submitting. Return and edit draft FJPs before submitting." },
      { step: "Submit FJP", desc: "Click 'Submit FJP'. System assigns FJP-YYYY-MM-NNN number. Submission blocked after 27th." },
      { step: "Print the FJP", desc: "In FJP History, click 'Print'. Printout includes route table, total KM, cost estimate (₹6/km), signature blocks." },
      { step: "Reference in Expense Claim", desc: "When submitting an expense report, select the relevant FJP from the dropdown to link it." },
    ],
    tips: ["Submit by the 27th — window closes automatically after that.", "Estimated travel cost calculated at ₹6 per km (minimum rate)."],
    warning: "FJP submission after the 27th deadline is blocked by the system. Submit at least 2–3 days before the deadline." },
  { num: "16", title: "Expense Reports",
    intro: `Sales executives submit expense reports for all out-of-pocket costs — travel, accommodation, food, client entertainment, communication, and other business expenses. Each report can reference an FJP and must have itemised bills. Approved reports result in reimbursement from Accounts.`,
    steps: [
      { step: "Open Expense Reports", desc: "Sidebar → FIELD SALES → Expense Reports. Click 'New Expense' to open the submission form." },
      { step: "Select expense type and FJP", desc: "Choose Expense Type: TRAVEL, ACCOMMODATION, FOOD, CLIENT_ENTERTAINMENT, COMMUNICATION, or OTHER. For travel, select the related FJP." },
      { step: "Enter expense line items", desc: "Add one row per expense item: Date, Category, Description, From/To Place, KM (for travel), Amount (₹), bill available (tick/untick)." },
      { step: "Enter advance received", desc: "Enter cash advance received. System auto-calculates Net Payable = Total – Advance." },
      { step: "Attach supporting documents", desc: "Click 'Choose Files' → select scanned bills/receipts → click 'Upload to Drive'. Files saved to Google Drive and linked to your report. Approvers can view them from the approval screen." },
      { step: "Save draft or submit", desc: "'Save Draft' to save without submitting. 'Submit for Approval' to enter the HOD → Accounts → CEO chain. EXP-YYYY-MM-NNN number assigned on creation." },
      { step: "Print the expense voucher", desc: "Click 'Print' on any submitted report. Printout includes itemised table, totals, net payable, approval history and signature blocks. Attach original hard-copy bills to this printout before handing to Accounts." },
    ],
    tips: ["Upload all bills to Drive before submitting — attachments cannot be added after submission.", "Items without bills are accepted but flagged — Accounts may query them."],
    warning: "Always print the expense voucher, attach original hard-copy bills, and physically submit to Accounts — even after digital approval. Required for audit compliance." },
  { num: "17", title: "Three-Tier Approval Workflow",
    intro: `Expense reports go through a mandatory three-stage approval before reimbursement. The chain is: HOD (Recommend) → Accounts (Verify) → CEO (Approve). Each stage can Approve, Hold, or Reject with a mandatory reason.`,
    steps: [
      { step: "HOD stage — Recommend", desc: "After submission, the report lands with the HOD (Business Manager / AVP / MD). Options: Recommend (moves to Accounts), Hold (with reason — submitter notified), Reject (with reason — claim declined)." },
      { step: "Accounts stage — Verify", desc: "Once recommended, Accounts verifies bill amounts, GST claims, advance deductions, policy compliance. Options: Verify (moves to CEO), Hold, Reject." },
      { step: "CEO stage — Approve", desc: "After Accounts verification, MD/CEO gives the final decision. Options: Approve (reimbursement authorised), Hold, Reject." },
      { step: "Email notifications", desc: "Submitter and HOD receive an email at every stage action — recommended, held, or rejected — with the reason." },
      { step: "Approval dashboard (Approvers)", desc: "Sidebar → FIELD SALES → Approvals. Approvers see expenses pending their action with a coloured 'Action Required' badge and the HOD → Accounts → CEO step indicator." },
      { step: "View attachment links", desc: "Expand any expense card → 'Attached Documents' → click any Drive link to open the bill/receipt in a new tab for verification." },
    ],
    tips: ["Hold means 'pause and clarify' — the submitter can clarify and resubmit if required.", "Approvers can view full approval history (who acted, when, reason) inside each expense card."],
    warning: "Reasons are mandatory for Hold and Reject actions. The system will not allow an action without a reason." },
  { num: "18", title: "Admin & Settings", intro: "User management, company settings and complete audit trail. MD and IT Admin only. Privilege settings allow fine-grained control over which roles access which modules.",
    steps: [
      { step: "Add new user", desc: "Admin → User Management → 'Add User'. Enter Full Name, Email, Role, Branch, Phone. User receives a Welcome Email. Status starts as PENDING." },
      { step: "Approve user", desc: "Find the PENDING user → click Approve. Status becomes ACTIVE." },
      { step: "Update role or branch", desc: "Click a user row → Edit → change Role, Branch or Status → Save. Changes take effect on next login." },
      { step: "Company Settings", desc: "Admin → Company Settings. Configure Company Name, Address, GSTIN, PAN, Bank Details, Logo URL, UPI QR URL and Default Terms." },
      { step: "Audit Trail", desc: "Admin → Audit Trail. See every action: who did it, on which record, when, and what changed (before/after)." },
    ],
    warning: "Audit log entries are permanent and cannot be deleted or edited — even by the MD or IT Admin." },
  { num: "19", title: "Batch Data Import & Export", intro: "Bulk-load and download data for Customers, Leads, Inventory and Employees using Excel.", screenKey: "BATCH",
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
  roles: ["MD", "AVP", "BM", "Sales", "CRE", "Designer", "Prodn", "Accts", "HR", "IT"],
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
    { name: "Approvals — HOD",    access: [1,1,1,0,0,0,0,0,0,0] },
    { name: "Approvals — Accts",  access: [1,0,0,0,0,0,0,1,0,0] },
    { name: "Approvals — CEO",    access: [1,0,0,0,0,0,0,0,0,0] },
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
  { q: "Can I attach receipts to my expense report?", a: "Yes. In the expense form, choose files, then click 'Upload to Drive'. Files saved to Google Drive and linked to your report. Approvers can view them from the approval screen." },
  { q: "My expense was put 'On Hold' — what do I do?", a: "You will receive an email with the HOD's reason. Review the comment, provide the clarification or correction requested, and resubmit if required." },
  { q: "Who can approve expense reports?", a: "Three-stage chain: HOD (Business Manager / AVP / MD) recommends → Accounts verifies → MD/CEO approves. Each sees only items pending their action." },
  { q: "How do I log my daily activities for the DAR?", a: "Sales → Activities → 'Log Activity'. At end of day go to Sales → DAR → 'Generate Today's DAR' to auto-build the report from your logged activities." },
];

export default function ManualContent({ showButtons = true }: { showButtons?: boolean }) {
  const handlePrint = () => {
    window.open("/manual-print", "zag_manual_print",
      "width=1024,height=768,toolbar=0,menubar=0,scrollbars=1,resizable=1");
  };
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = PRINT_STYLE;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div data-manual-content style={{ fontFamily: "Arial, sans-serif", fontSize: "11pt", color: "#000", maxWidth: "210mm", width: "100%", margin: "0 auto", padding: "0", backgroundColor: "white", lineHeight: "1.5" }}>

      {/* ── Print buttons (screen only, hidden on print) ── */}
      {showButtons && (
        <div className="no-print" style={{ position: "fixed", top: "16px", right: "16px", zIndex: 50, display: "flex", gap: "8px" }}>
          <button onClick={() => window.history.back()}
            style={{ background: "#6B7280", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
            ← Back
          </button>
          <button onClick={handlePrint}
            style={{ background: "#10B981", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
            📥 Save as PDF
          </button>
          <button onClick={handlePrint}
            style={{ background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
            🖨 Print
          </button>
        </div>
      )}

      {/* ── COVER PAGE ── */}
      <div style={{ height: "257mm", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", borderBottom: "3px solid #4F46E5", paddingBottom: "12mm", pageBreakAfter: "always" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/zagsigns-logo.png" alt="ZAG SIGNS" style={{ height: "70px", width: "auto", marginBottom: "26px" }} />
        <h1 style={{ fontSize: "26pt", fontWeight: 900, color: "#4F46E5", letterSpacing: "1px", margin: "0 0 8px" }}>ZAG SIGNS ERP</h1>
        <h2 style={{ fontSize: "15pt", fontWeight: 400, color: "#6B7280", margin: "0 0 28px" }}>User Manual — Complete Guide</h2>
        <div style={{ width: "60px", height: "3px", background: "linear-gradient(90deg,#F0563F,#C2298A,#4F46E5)", margin: "0 auto 28px" }} />
        <p style={{ fontSize: "11pt", color: "#374151", lineHeight: 1.7, maxWidth: "125mm" }}>
          This manual covers every module of the ZAG SIGNS ERP — from lead capture and quotations to
          work-order tickets, tax invoices, Tally sync, Fixed Journey Plans, expense reports with
          three-tier approvals, and bulk data import.
        </p>
        <div style={{ marginTop: "34px", fontSize: "11pt", color: "#111827", fontWeight: 700 }}>
          VER {VERSION} · {VERSION_DATE}
        </div>
        <div style={{ marginTop: "6px", fontSize: "10pt", color: "#9CA3AF" }}>
          <p style={{ margin: "2px 0" }}>bprozagcrm.xyz</p>
          <p style={{ margin: "2px 0" }}>Confidential — Internal Use Only</p>
        </div>
        <div style={{ marginTop: "22px" }}>
          <PoweredByBpro variant="light" logoHeight={32} />
        </div>
      </div>

      {/* ── TABLE OF CONTENTS ── */}
      <div style={{ paddingTop: "20px", pageBreakAfter: "always" }}>
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
          <div key={section.num} style={{ paddingTop: "20px", pageBreakBefore: "always", pageBreakInside: "avoid" }}>
            <h2 style={{ fontSize: "15pt", fontWeight: 800, color: "#4F46E5", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px", marginBottom: "14px" }}>
              {section.num}. {section.title}
            </h2>
            <p style={{ fontSize: "10.5pt", color: "#374151", lineHeight: 1.7, marginBottom: "14px", whiteSpace: "pre-line" }}>
              {section.intro}
            </p>
            {screen && (
              <div style={{ margin: "0 0 16px", pageBreakInside: "avoid" }}>
                {screen.node}
                <Caption>{screen.caption}</Caption>
              </div>
            )}
            {section.warning && (
              <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", pageBreakInside: "avoid" }}>
                <strong style={{ color: "#92400E", fontSize: "10pt" }}>⚠ Important: </strong>
                <span style={{ color: "#78350F", fontSize: "10pt" }}>{section.warning}</span>
              </div>
            )}
            {section.steps && section.steps.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: "11pt", fontWeight: 700, color: "#374151", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Step-by-Step Guide</h3>
                {section.steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px", pageBreakInside: "avoid" }}>
                    <div style={{ width: "26px", height: "26px", background: "#4F46E5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                      <span style={{ color: "#fff", fontSize: "10pt", fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "10.5pt", color: "#1a1a1a" }}>{s.step}</strong>
                      <p style={{ fontSize: "10pt", color: "#374151", lineHeight: 1.65, margin: "3px 0 0" }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      <div style={{ paddingTop: "20px", pageBreakBefore: "always" }}>
        <h2 style={{ fontSize: "15pt", fontWeight: 800, color: "#4F46E5", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px", marginBottom: "14px" }}>20. Role Permission Matrix</h2>
        <p style={{ fontSize: "10pt", color: "#374151", marginBottom: "14px" }}>
          BM = Business Manager, Sales = Sales Executive, CRE = Customer Relations, Prodn = Production, Accts = Accounts, IT = IT Admin.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
          <thead>
            <tr style={{ background: "#4F46E5", color: "#fff" }}>
              <th style={{ padding: "6px 7px", textAlign: "left", fontWeight: 700 }}>Module</th>
              {ROLE_MATRIX.roles.map(r => <th key={r} style={{ padding: "6px 3px", textAlign: "center", fontWeight: 700, whiteSpace: "nowrap" }}>{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROLE_MATRIX.modules.map((m, i) => (
              <tr key={m.name} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <td style={{ padding: "5px 7px", fontWeight: 500, color: "#374151", whiteSpace: "nowrap" }}>{m.name}</td>
                {m.access.map((a, j) => (
                  <td key={j} style={{ padding: "5px 3px", textAlign: "center", color: a ? "#16A34A" : "#D1D5DB", fontWeight: a ? 700 : 400 }}>{a ? "✓" : "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── FAQ ── */}
      <div style={{ paddingTop: "20px", pageBreakBefore: "always" }}>
        <h2 style={{ fontSize: "15pt", fontWeight: 800, color: "#4F46E5", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px", marginBottom: "14px" }}>21. Frequently Asked Questions</h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid #F3F4F6", pageBreakInside: "avoid" }}>
            <p style={{ fontWeight: 700, fontSize: "10.5pt", color: "#1a1a1a", margin: "0 0 5px" }}>Q{i+1}. {faq.q}</p>
            <p style={{ fontSize: "10pt", color: "#374151", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
          </div>
        ))}
      </div>

      {/* ── SHORTCUTS & BACK COVER ── */}
      <div style={{ paddingTop: "20px", pageBreakBefore: "always" }}>
        <h2 style={{ fontSize: "15pt", fontWeight: 800, color: "#4F46E5", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px", marginBottom: "14px" }}>22. Keyboard Shortcuts & Tips</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead><tr style={{ background: "#F3F4F6" }}>
            <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "10pt", fontWeight: 700, color: "#374151" }}>Shortcut</th>
            <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "10pt", fontWeight: 700, color: "#374151" }}>Action</th>
          </tr></thead>
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
          <li>Always update lead status and follow-up date after every customer interaction.</li>
          <li>Create invoices from quotations (using the Invoice button) — never manually.</li>
          <li>Submit FJP by the 27th of the previous month without fail.</li>
          <li>Upload all bills to Drive before submitting expense reports.</li>
          <li>Raise work-order tickets the moment a job is confirmed, and assign a designer before printing the slip.</li>
          <li>Export Tally XML on the same day as the invoice for clean day-book entries.</li>
          <li>Mark invoices Paid/Partial immediately when payment is received.</li>
          <li>Never share your login credentials. Contact IT Admin if you suspect unauthorised access.</li>
          <li>Install the app on your phone (Add to Home Screen) for on-the-go access during field visits.</li>
        </ul>
        <div style={{ marginTop: "40px", textAlign: "center", borderTop: "2px solid #4F46E5", paddingTop: "20px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zagsigns-logo.png" alt="ZAG SIGNS" style={{ height: "34px", width: "auto", marginBottom: "10px" }} />
          <p style={{ fontSize: "9pt", color: "#9CA3AF", margin: "2px 0" }}>VER {VERSION} · {VERSION_DATE} · bprozagcrm.xyz</p>
          <p style={{ fontSize: "9pt", color: "#9CA3AF", margin: "2px 0" }}>Confidential — Internal Use Only · For technical support, contact your IT Admin.</p>
          <div style={{ marginTop: "12px" }}>
            <PoweredByBpro variant="light" logoHeight={28} />
          </div>
        </div>
      </div>

    </div>
  );
}
