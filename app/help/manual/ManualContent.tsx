"use client";
import { useEffect } from "react";
import { SCREENS, Caption } from "./Screens";
import PoweredByBpro from "@/components/PoweredByBpro";

const VERSION = "2.0";
const VERSION_DATE = "07/07/2026";

const PRINT_STYLE = `
  * { box-sizing: border-box; }
  body, html { margin: 0; padding: 0; width: 100%; background: white !important; }
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
  { num: "10", title: "Designer: My Work" },
  { num: "11", title: "Sales Orders" },
  { num: "12", title: "Work Orders & Production" },
  { num: "13", title: "Finance — Collections & Payments" },
  { num: "14", title: "HR & Attendance" },
  { num: "15", title: "Field Visits, Activity Tracker & Team Reports" },
  { num: "16", title: "Fixed Journey Plan (FJP)" },
  { num: "17", title: "Expense Reports" },
  { num: "18", title: "Three-Tier Approval Workflow" },
  { num: "19", title: "KPI Monitor" },
  { num: "20", title: "Reports & MIS" },
  { num: "21", title: "GST Tax Report" },
  { num: "22", title: "AI Insights" },
  { num: "23", title: "Documents" },
  { num: "24", title: "Tender Management" },
  { num: "25", title: "Job Costing" },
  { num: "26", title: "Procurement — Vendors, POs & GRN" },
  { num: "27", title: "Fleet Management" },
  { num: "28", title: "Project Management" },
  { num: "29", title: "Installation Tracking" },
  { num: "30", title: "AMC & Warranty" },
  { num: "31", title: "Digital Approvals" },
  { num: "32", title: "Customer Portal" },
  { num: "33", title: "Admin & Settings" },
  { num: "34", title: "Privilege Management" },
  { num: "35", title: "Database Studio" },
  { num: "36", title: "Audit Logs" },
  { num: "37", title: "Batch Data Import & Export" },
  { num: "38", title: "Role Permission Matrix" },
  { num: "39", title: "Frequently Asked Questions" },
  { num: "40", title: "Keyboard Shortcuts & Tips" },
];

interface ManualStep { step: string; desc: string; note?: string; }
interface ManualSection { num: string; title: string; intro: string; steps?: ManualStep[]; tips?: string[]; warning?: string; screenKey?: string; }

const SECTIONS: ManualSection[] = [
  { num: "1", title: "Introduction & System Overview",
    intro: `ZAG SIGNS ERP is a cloud-based Enterprise Resource Planning system built exclusively for ZAG SIGNS and its branches. It manages the complete business lifecycle — from capturing a sales lead to issuing a Tax Invoice and syncing with Tally — in one integrated platform.\n\nThe system is accessible at bprozagcrm.xyz from any browser (desktop, mobile, tablet). No installation is required.\n\nModules covered: CRM (Leads & Opportunities), Customers, Quotations, Invoices (with Tally XML export), Work Order Tickets & Designer workflow (My Work), Sales Orders, Production, Inventory, Finance (Collections), HR & Attendance, Field Visits, Activity Tracker, Fixed Journey Plans (FJP), Expense Reports, Three-Tier Approval Workflow, KPI Monitor, Reports & MIS, GST Tax Report, AI Insights, Documents, Tender Management, Job Costing, Procurement, Fleet Management, Project Management, Installation Tracking, AMC & Warranty, Digital Approvals, Customer Portal, Team Reports (DAR/WWR/MWR), Batch Data Import/Export, Admin & User Management, Privilege Management, Database Studio, and Audit Logs.` },
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
  { num: "10", title: "Designer: My Work", intro: "The Designer role's dedicated queue — every ticket assigned to a designer lands here, ready to pick up, work and close, without needing access to the rest of the ERP.",
    steps: [
      { step: "Check the stats strip", desc: "Four tiles show To Pick, In Progress, Half Done and Done Today counts, giving an at-a-glance workload summary." },
      { step: "Filter your queue", desc: "Filter tabs: All Mine / To Pick / In Progress / Half Done / Completed. High-priority and overdue tickets (past their Expected date) are flagged." },
      { step: "Start a ticket", desc: "On an ASSIGNED ticket, click 'Start Work' to move it to IN PROGRESS." },
      { step: "Mark Half Done", desc: "Click 'Half Done' and enter a reason (e.g. customer pending approval, material delay) — mandatory before saving." },
      { step: "Mark Done", desc: "Click 'Mark Done' and enter remarks for billing/next step — mandatory before saving. The ticket then moves to the billing queue." },
    ],
    tips: ["Ticket cards show the customer's phone as a tap-to-call link, plus nature of work, reference and full description.", "A previous Half-Done reason stays visible on the card as a reminder of what was pending."] },
  { num: "11", title: "Sales Orders", intro: "Manage confirmed customer orders through production to delivery.",
    steps: [
      { step: "Create order", desc: "Sales Orders → 'New Order'. Link to Customer and optional Quotation. Set Delivery Date and Total Amount." },
      { step: "Track status", desc: "Draft → Confirmed → In Production → Ready → Installed → Invoiced → Collected." },
      { step: "Link work order", desc: "Once Confirmed, create a Work Order linked to this Sales Order for production tracking." },
    ], tips: ["Paid Amount updates automatically as Collections are recorded."] },
  { num: "12", title: "Work Orders & Production", intro: "Job execution tracking, production logs, machine scheduling and inventory management.",
    steps: [
      { step: "Create work order", desc: "Work Orders → 'New Work Order'. Link to Sales Order. Set Description, Start Date, Due Date, Priority." },
      { step: "Update progress", desc: "Pending → In Progress → Quality Check → Dispatch Ready → Completed." },
      { step: "Machine scheduling", desc: "Production → Machines → 'Schedule Board'. Assign jobs to machines. Conflict detection prevents double-booking." },
      { step: "Material consumption", desc: "Production → Materials → 'Add Materials'. Select work order, material, and planned quantity. Stock auto-deducted." },
      { step: "Quality checkpoints", desc: "Production → Quality → 'New Checkpoint'. Select stage (Pre-Production / Mid-Production / Pre-Delivery). Mark PASS, FAIL, or CONDITIONAL PASS. Log defects if failed." },
    ], tips: ["Work orders link to sales orders — sales executive sees real-time production status."] },
  { num: "13", title: "Finance — Collections & Payments", intro: "Record all payments received and track outstanding dues.", screenKey: "COLLECTION",
    steps: [
      { step: "Record a payment (collection)", desc: "Collections → 'Record Payment'. Select: Customer, Invoice, Amount, Payment Mode (Cash / Cheque / NEFT / UPI / Bank Transfer), Reference No, Date." },
      { step: "Invoice payment tracking", desc: "Invoice status: PENDING → PARTIAL → PAID. OVERDUE appears when due date passes with a balance." },
      { step: "View collections summary", desc: "Use the month picker to see total cash received for that month plus a breakdown by the top payment modes used." },
    ],
    tips: ["Always enter UTR/reference number for NEFT and UPI payments.", "Outstanding balance updates automatically with each collection.", "A collection can be recorded against just a customer (advance) without linking an invoice."] },
  { num: "14", title: "HR & Attendance", intro: "Employee profiles, daily attendance and leave management.", screenKey: "HR",
    steps: [
      { step: "Add employee", desc: "HR & Attendance → Employees → 'Add Employee'. Required: Name, Designation, Department, Branch." },
      { step: "Bulk import employees", desc: "Click 'Import' on the Employees tab to upload staff records from Excel — see Section 37." },
      { step: "Mark attendance", desc: "Attendance → 'Mark Attendance'. Select Employee, Date, Status (Present/Absent/Half Day/On Leave/Holiday)." },
      { step: "Leave request & approval", desc: "Leave Requests → 'New Request'. HR/MD see Approve / Reject on PENDING requests." },
    ], tips: ["Attendance can be marked once per employee per day."] },
  { num: "15", title: "Field Visits, Activity Tracker & Team Reports", intro: "Log all customer visits, track daily sales activities, and file DAR/WWR/MWR reports for manager review.",
    steps: [
      { step: "Log a field visit", desc: "Field Visits → 'New Visit'. Required: Visit Type, Customer Name, Location, Start Time, End Time, Outcome." },
      { step: "Daily Activity Log", desc: "Sales → Activities → 'Log Activity'. Choose type: Call / Meeting / Demo / Email / WhatsApp. All activities feed into the DAR automatically." },
      { step: "Auto-generate DAR", desc: "Sales → DAR → 'Generate Today's DAR'. System pre-fills from today's logged activities. Submit by 9 PM. Automated reminder sent at 9 PM daily." },
      { step: "Weekly Work Report (WWR)", desc: "Team Reports → WWR → 'New WWR'. File weekly: target vs achievement, challenges, action plan." },
      { step: "Monthly Work Report (MWR)", desc: "Team Reports → MWR → 'New MWR'. File monthly KPIs: sales achievement %, collection %, efficiency %." },
      { step: "Team Performance Dashboard", desc: "Sales → Team (Manager view). See each executive's activity count, leads, orders, collections vs target." },
    ],
    tips: ["Log every call and visit immediately — the auto-DAR depends on complete activity data.", "Automated reminder email at 9 PM for anyone who has not submitted their DAR.", "Claims window reminder email sent every Saturday and Sunday morning."] },
  { num: "16", title: "Fixed Journey Plan (FJP)",
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
  { num: "17", title: "Expense Reports",
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
  { num: "18", title: "Three-Tier Approval Workflow",
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
  { num: "19", title: "KPI Monitor", intro: "A scorecard view of individual and team performance against target for CRES, Sales Executives, Business Managers and AVPs, built from submitted team reports.",
    steps: [
      { step: "Choose role and period", desc: "Pick a role tab (CRES / Sales Executive / Business Manager / AVP) and a period (month or quarter) from the dropdown." },
      { step: "Filter to one employee", desc: "Use the employee dropdown to narrow to a single team member, or leave on 'All Employees'." },
      { step: "Read the scorecards", desc: "Each KPI shows Target vs Actual, percentage achieved and a status pill: On Track (green), At Risk (yellow), Behind (red), with a progress bar." },
      { step: "Check the summary strip", desc: "Avg Achievement, On Track count, At Risk count and Behind Target count for everyone currently shown." },
    ],
    tips: ["CRES KPIs: Calls per Day, Appointments Fixed, Lead Conversion %, New Leads Added.", "Sales Executive KPIs: Customer Visits, Revenue Target, Collection %, New Customers Acquired."] },
  { num: "20", title: "Reports & MIS", intro: "The management dashboard for business-wide analytics — revenue, pipeline, work orders and inventory alerts, live from the database.",
    steps: [
      { step: "KPI row", desc: "YTD Revenue (6 months) vs target, total Pipeline Value, Collection This Month vs target, and Open Complaints." },
      { step: "Monthly Revenue vs Target", desc: "Bar chart of actual revenue vs target for each of the last 6 months." },
      { step: "Lead Conversion & Pipeline Funnel", desc: "Pie chart of Won/Lost/Active leads, plus a horizontal funnel of open leads by stage." },
      { step: "Work Orders by Status", desc: "Pie chart of all work orders grouped by status." },
      { step: "Branch Performance table", desc: "Every branch's Orders, Revenue and % of total revenue with a visual share bar." },
      { step: "Inventory Alerts", desc: "Materials that are Low, Critical or Out of stock, with current vs minimum quantity." },
    ],
    tips: ["This page always shows live, current-month figures with no date filter — use GST Tax Report or AI Insights for a narrower view."] },
  { num: "21", title: "GST Tax Report", intro: "A GST-focused breakdown of every quotation, grouped by tax rate (Exempt, 5%, 12%, 18%), for filing and reconciliation.",
    steps: [
      { step: "Set the date range", desc: "Use the From/To date pickers — the report refreshes automatically." },
      { step: "Filter by GST rate", desc: "Click any rate card (Exempt / 5% / 12% / 18%) to filter the transaction table to that rate." },
      { step: "Read the grand totals bar", desc: "Total Quotations, Total Taxable Value, Total GST Collected and Grand Total for the selected period/filter." },
      { step: "Review the detail table", desc: "Quote No, Customer, Date, GST Rate, Taxable Value, CGST, SGST and Total, with subtotals in the footer." },
      { step: "Export", desc: "Use the Drive export button to save the filtered rows as a spreadsheet for GST filing." },
    ],
    tips: ["CGST and SGST are always exactly half the GST rate each, matching standard intra-state GST splitting."] },
  { num: "22", title: "AI Insights", intro: "Live, database-driven analysis — no manual entry required. Surfaces which leads to chase first, which customers risk churning, and branch trends.",
    steps: [
      { step: "Summary KPIs", desc: "Active Leads, Open Orders, Complaints and WO Tickets — a quick pulse of open work." },
      { step: "Lead Priority Score", desc: "Leads ranked by an AI-computed score (0–100) based on stage, value and recency." },
      { step: "Churn Risk Customers", desc: "Flags customers with no order in 90+ days as Low/Medium/High risk with a percentage." },
      { step: "Branch Revenue & Trend charts", desc: "This month's revenue by branch, plus weekly revenue bars for the last 30 days." },
      { step: "Refresh", desc: "Click the refresh icon to re-run the analysis against the latest data." },
    ],
    tips: ["No configuration needed — every insight is computed automatically from existing leads, orders and invoices."] },
  { num: "23", title: "Documents", intro: "A central, searchable index of every file linked into the ERP — quotations, contracts, artwork, HR paperwork — stored in Google Drive and linked here.",
    steps: [
      { step: "Browse by category", desc: "Category chips (Quotations, Sales Orders, Invoices, Contracts, Artwork, Photos, Reports, HR Documents, Marketing, Other) filter the grid with a live count." },
      { step: "Search and filter", desc: "Search by name/record/tag; filter by Record Type (LEAD, CUSTOMER, ORDER, QUOTATION, FIELD_VISIT)." },
      { step: "Open a document", desc: "Click 'Open in Drive' on any card to view the file in a new tab." },
      { step: "Link a new document", desc: "Click 'Link Document' → enter Name and Google Drive URL, optionally Category and related record → 'Save Link'." },
      { step: "Remove a link", desc: "Click the trash icon to remove the document record — this only removes the link, not the Drive file itself." },
    ],
    tips: ["Most documents appear here automatically once attached from Leads, Customers, Sales Orders or Quotations."] },
  { num: "24", title: "Tender Management", intro: "Track competitive bids from RFP through submission to win or loss, with running pipeline value and win-rate KPIs.",
    steps: [
      { step: "Log a new tender", desc: "'New Tender' → enter Title, Client, Branch, Bid Value, RFP Date, Submit Deadline and Opening/Result Date." },
      { step: "Track competitor info", desc: "Use the Competitor Info field to note known competitors and their bid values." },
      { step: "Move status forward", desc: "OPEN → click 'Submit' → SUBMITTED → click 'Won' or 'Lost' to close out, entering Awarded Value if won." },
      { step: "Read the KPI cards", desc: "Active Pipeline value, Tenders Won (with awarded value), Win Rate % and Overdue (past deadline, still OPEN)." },
    ],
    tips: ["Click any row to reopen and edit it — the same modal creates and edits a tender."] },
  { num: "25", title: "Job Costing", intro: "Attach a detailed cost sheet to any Sales Order and see gross profit and margin % in real time.",
    steps: [
      { step: "Select a sales order", desc: "Choose from the dropdown; 'Load saved cost sheet' brings in an existing sheet if one exists." },
      { step: "Enter revenue", desc: "Fill Quoted Revenue, and Actual Revenue if it differs (e.g. after a revision)." },
      { step: "Add cost line items", desc: "Category (Material/Labour/Printing/Vinyl/Fabrication/Electrical/Transport/Subcontract/Overhead/Other), Description, Qty, Unit, Unit Cost — total per line auto-calculates." },
      { step: "Read the margin KPIs", desc: "Quoted Revenue, Total Cost, Gross Profit and Margin % — colour-coded by how healthy the margin is." },
      { step: "Save the cost sheet", desc: "Add notes, then 'Save Cost Sheet'. Reload anytime to update actuals once the job is billed." },
    ],
    tips: ["Margin % is green at 20%+, amber 10–20%, red below 10% — a quick health check before finalising a quote."] },
  { num: "26", title: "Procurement — Vendors, POs & GRN", intro: "Manage the full purchasing cycle in one tabbed screen: vendor master, Purchase Orders, and Goods Received Notes (GRN).",
    steps: [
      { step: "Add a vendor", desc: "Vendors tab → 'Add Vendor'. Enter Name, Company, Phone, Email, GSTIN, Address, Category, Branch, Credit Days." },
      { step: "Create a Purchase Order", desc: "Purchase Orders tab → 'New PO'. Select Vendor and Branch, set Delivery Date, add line items (Description, Qty, Unit, Rate)." },
      { step: "Send the PO", desc: "On a DRAFT PO, click 'Send' to move it to SENT." },
      { step: "Record goods received (GRN)", desc: "On a SENT PO, click 'Receive' — jumps to the GRN tab pre-filled. Enter Ordered/Received/Rejected quantities and Received Date, then 'Record GRN'." },
      { step: "Track PO status", desc: "DRAFT → SENT → PARTIAL → RECEIVED → COMPLETED (or CANCELLED)." },
    ],
    tips: ["Recording a GRN against a PO refreshes the PO list immediately, so partial receipts show right away."] },
  { num: "27", title: "Fleet Management", intro: "Track company vehicles, log trips with odometer readings, and record fuel purchases.",
    steps: [
      { step: "Add a vehicle", desc: "Vehicles tab → 'Add Vehicle'. Vehicle No, Make, Model, Type, Branch, Insurance Expiry, PUC Expiry, Next Service Due." },
      { step: "Log a trip", desc: "Trips tab → 'Log Trip'. Vehicle, From/To place, Start KM (End KM on return), Purpose, Start Time." },
      { step: "Log fuel", desc: "Fuel Logs tab → 'Log Fuel'. Vehicle, Date, Litres, Cost per Litre, Odometer, Fuel Station." },
      { step: "Read the KPI row", desc: "Total Vehicles, Active vehicles, Total KM across logged trips, and total Fuel Spend." },
    ],
    tips: ["Insurance and PUC expiry show as coloured chips on each vehicle card — check regularly to avoid lapses."] },
  { num: "28", title: "Project Management", intro: "For larger jobs needing milestone tracking beyond a simple Sales Order — a status pipeline plus a checklist of dated milestones.",
    steps: [
      { step: "Create a project", desc: "'New Project' → Name, Customer, Branch, Budget, Start/End Date." },
      { step: "Add milestones", desc: "In the same form, click 'Add' under Milestones to add Title + Due Date rows." },
      { step: "Update project status", desc: "Select a project, then click a status pill: PLANNING → PRODUCTION → DISPATCH → INSTALLATION → COMPLETED (or ON_HOLD)." },
      { step: "Track milestone progress", desc: "Each milestone shows Pending (clock), Completed (green check) or Delayed (red warning)." },
    ],
    tips: ["The milestone progress bar on each project card gives an instant visual — green done, red delayed, grey pending."] },
  { num: "29", title: "Installation Tracking", intro: "A focused field-operations view of orders once they leave production — Dispatched through Installation to Installed and Delivered.",
    steps: [
      { step: "Filter by stage", desc: "Stage tabs: All Field / Dispatched / Installing / Installed." },
      { step: "Search an order", desc: "Search by order number or customer name." },
      { step: "Advance a stage", desc: "Click the action button — '→ Start Installation', '→ Mark Installed' or '→ Mark Delivered' — to move it forward." },
      { step: "View site details", desc: "Click any order for Customer, Company, Phone, Branch, Amount, Order Date, Site Address, Notes and a pipeline stage tracker." },
    ],
    tips: ["Only orders in DISPATCHED, INSTALLATION, INSTALLED or DELIVERED status appear here."] },
  { num: "30", title: "AMC & Warranty", intro: "Manage Annual Maintenance Contracts and the service tickets raised against them (or ad-hoc/warranty tickets with no contract).",
    steps: [
      { step: "Create an AMC contract", desc: "AMC Contracts tab → 'New Contract'. Customer, Description, Start/End Date, Annual Value, Visit Frequency (Monthly/Quarterly/Half-Yearly/Annually)." },
      { step: "Raise a service ticket", desc: "Service Tickets tab → 'Raise Ticket'. Customer, optional AMC contract link, Type (Warranty/AMC/Adhoc), Priority, Description, Assign To, SLA hours." },
      { step: "Progress a ticket", desc: "OPEN → 'Start' → IN PROGRESS → 'Resolve' → RESOLVED → 'Close' → CLOSED." },
      { step: "Read the KPI row", desc: "Active Contracts (with annual value), Open Tickets, Critical/Urgent tickets, Total Contracts all-time." },
    ],
    tips: ["A ticket doesn't need an AMC contract — leave the link as None/Ad-hoc for a one-off warranty call."] },
  { num: "31", title: "Digital Approvals", intro: "Collect and track customer sign-off on artwork, production, site readiness or handover, without needing a physical signature.",
    steps: [
      { step: "Create an approval request", desc: "'New Approval' → Type (Artwork/Production/Site/Handover), Related To (Sales Order/Work Order/Quotation) + reference, Customer Name/Email/Phone, Document URL (Drive link)." },
      { step: "Share for review", desc: "Send the customer the document link; when they respond, open the request to record the decision." },
      { step: "Record the decision", desc: "Approve, Reject, or Request Revision — each updates status immediately and is timestamped." },
      { step: "Filter the queue", desc: "Filter by Type and Status, or search by customer name / approval number." },
    ],
    tips: ["'Revision Requested' is distinct from Rejected — use it when the customer wants changes, not an outright decline."] },
  { num: "32", title: "Customer Portal", intro: "A lightweight, public-facing self-service page customers use to check their own quotations, orders and invoices — no login required, accessed via a shareable link.",
    steps: [
      { step: "Share the portal link", desc: "Send the customer a link in the form /portal?customer=<customerNo> using their Customer No from the Customers module." },
      { step: "What the customer sees", desc: "Header with name and customer number, summary tiles (Quotations, Orders, Outstanding), and three tabs: Orders, Quotations, Invoices." },
      { step: "Status visibility", desc: "Same status badges used internally, so customers see live status without calling in." },
    ],
    tips: ["The portal is read-only — customers cannot edit anything, only view their own records.", "There is no password; treat the link itself as the access credential."] },
  { num: "33", title: "Admin & Settings", intro: "User management, role and branch assignment, and company settings. Available to MD and IT Admin only.",
    steps: [
      { step: "Add new user", desc: "Admin → User Management → 'Add User'. Enter Full Name, Email, Role, Branch, Phone. User receives a Welcome Email. Status starts as PENDING." },
      { step: "Approve user", desc: "Find the PENDING user → click Approve. Status becomes ACTIVE." },
      { step: "Update role or branch", desc: "Click a user row → Edit → change Role, Branch or Status → Save. Changes take effect on next login." },
      { step: "Company Settings", desc: "Admin → Company Settings. Configure Company Name, Address, GSTIN, PAN, Bank Details, Logo URL, UPI QR URL and Default Terms." },
    ],
    warning: "Never share your login credentials. Contact IT Admin immediately if you suspect unauthorised access to your account." },
  { num: "34", title: "Privilege Management", intro: "Per-user overrides on top of role defaults — grant or restrict individual users' access to specific modules without changing their role. MD and IT Admin only.",
    steps: [
      { step: "Select a user", desc: "The left panel lists every user with their role; users with a saved custom override show a 'custom' tag." },
      { step: "Role defaults vs Custom", desc: "'Role defaults' means access simply follows the user's role. 'Custom permissions' is an explicit per-user override saved in the database that takes priority over the role default." },
      { step: "Toggle modules", desc: "Click any module checkbox to grant/revoke it — this switches the user into Custom mode automatically." },
      { step: "Group actions", desc: "'Select all'/'Deselect all' per module group, or the header's 'All'/'None' buttons for every module." },
      { step: "Reset to role defaults", desc: "Discards the custom override and falls back to the role's normal access." },
      { step: "Save", desc: "Custom mode saves the exact module list as an override; reset-to-defaults deletes the override so new modules for that role are picked up automatically." },
    ],
    tips: ["A custom override is a hard whitelist — it does NOT automatically pick up new modules added later. Role-default users always get new modules automatically; custom-override users do not."],
    warning: "When a module is added after a user's custom override was last saved, an amber banner warns: 'N modules were added after this override was last saved, so [user] can't access them.' Click 'Add these' to fix it instantly, then Save. This prevents a custom-permission user from silently losing access to new features." },
  { num: "35", title: "Database Studio", intro: "A direct, table-by-table view into the underlying database — for MD and IT Admin to inspect or correct records that can't be fixed through the normal UI.",
    steps: [
      { step: "Pick a table", desc: "The left sidebar lists every database table with its record count." },
      { step: "Browse and filter", desc: "Use 'Filter rows…' to find matching records across all visible columns on the current page." },
      { step: "Page through records", desc: "Data loads 50 rows at a time; use Previous/Next to page through a large table." },
      { step: "Edit a record", desc: "Click the pencil icon → every column is editable except id, createdAt and updatedAt (read-only) → 'Save Changes'." },
    ],
    warning: "This is a low-level tool that writes directly to the database, bypassing normal validation. Only IT Admin or MD should use it, and only when a fix genuinely can't be made through the regular module screens." },
  { num: "36", title: "Audit Logs", intro: "A permanent, tamper-proof record of every create, update and delete action across the ERP — who did it, on what record, and when.",
    steps: [
      { step: "Open the audit log", desc: "Admin → Audit Trail. Lists the most recent 100 entries per page: Timestamp, User, Action, Table, Record ID, IP address." },
      { step: "Filter by table", desc: "Use the 'All Tables' dropdown to narrow to one entity — User, Lead, Customer, SalesOrder, Quotation, Employee, Invoice, WorkOrder or Inventory." },
      { step: "Read the action badges", desc: "CREATE (green), UPDATE (amber), DELETE (red), LOGIN (indigo), APPROVE (blue), REJECT (rose)." },
      { step: "Page through history", desc: "Previous/Next at the bottom moves through older or newer entries, 100 at a time." },
    ],
    warning: "Audit log entries are permanent and cannot be deleted or edited — even by the MD or IT Admin." },
  { num: "37", title: "Batch Data Import & Export", intro: "Bulk-load and download data for Customers, Leads, Inventory and Employees using Excel.", screenKey: "BATCH",
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

// Cross-checked against ROLE_PATHS in lib/permissions.ts (source of truth).
// AVP / IT / Consultant are FULL_ACCESS roles ("*") — always 1.
const ROLE_MATRIX = {
  roles: ["MD", "AVP", "BM", "Sales", "CRE", "Designer", "Prodn", "Accts", "HR", "IT", "Consult"],
  modules: [
    { name: "Dashboard",          access: [1,1,1,1,1,1,1,1,1,1,1] },
    { name: "KPI Monitor",        access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "Leads & CRM",        access: [0,1,1,1,1,0,0,0,0,1,1] },
    { name: "Opportunities",      access: [0,1,1,1,0,0,0,0,0,1,1] },
    { name: "Customers",          access: [0,1,1,1,1,0,0,1,0,1,1] },
    { name: "Quotations",         access: [0,1,1,1,0,0,0,0,0,1,1] },
    { name: "Work Order Tickets", access: [0,1,1,1,1,1,0,0,0,1,1] },
    { name: "My Work (Designer)", access: [0,1,0,0,0,1,0,0,0,1,1] },
    { name: "Sales Orders",       access: [0,1,1,1,0,0,1,0,0,1,1] },
    { name: "Production",         access: [0,1,1,0,0,0,1,0,0,1,1] },
    { name: "Inventory",          access: [0,1,1,0,0,0,1,0,0,1,1] },
    { name: "Invoices",           access: [0,1,1,0,0,0,0,1,0,1,1] },
    { name: "Collections",        access: [0,1,1,0,0,0,0,1,0,1,1] },
    { name: "HR & Attendance",    access: [0,1,0,0,0,0,0,0,1,1,1] },
    { name: "Field Visits",       access: [0,1,1,1,1,0,0,0,0,1,1] },
    { name: "Journey Plan (FJP)", access: [1,1,1,1,0,0,0,0,0,1,1] },
    { name: "Expense Reports",    access: [1,1,1,1,0,0,0,0,0,1,1] },
    { name: "Approvals — HOD",    access: [1,1,1,0,0,0,0,0,0,0,0] },
    { name: "Approvals — Accts",  access: [1,0,0,0,0,0,0,1,0,0,0] },
    { name: "Approvals — CEO",    access: [1,0,0,0,0,0,0,0,0,0,0] },
    { name: "Reports & MIS",      access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "GST Tax Report",     access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "AI Insights",        access: [1,1,1,0,0,0,0,0,0,1,1] },
    { name: "Documents",          access: [1,1,1,1,1,1,1,1,1,1,1] },
    { name: "Tender Management",  access: [1,1,1,1,0,0,0,0,0,1,1] },
    { name: "Job Costing",        access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "Procurement",        access: [1,1,1,0,0,0,1,0,0,1,1] },
    { name: "Fleet Management",   access: [1,1,1,0,0,0,1,0,0,1,1] },
    { name: "Project Management", access: [1,1,1,0,0,0,1,0,0,1,1] },
    { name: "Installation",       access: [1,1,1,0,0,0,1,0,0,1,1] },
    { name: "AMC & Warranty",     access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "Digital Approvals",  access: [1,1,1,0,0,0,0,0,0,1,1] },
    { name: "User Management",    access: [0,1,0,0,0,0,0,0,0,1,1] },
    { name: "Privilege Mgmt",     access: [1,1,0,0,0,0,0,0,0,1,1] },
    { name: "Database Studio",    access: [1,1,0,0,0,0,0,0,0,1,1] },
    { name: "Audit Logs",         access: [1,1,0,0,0,0,0,0,0,1,1] },
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
