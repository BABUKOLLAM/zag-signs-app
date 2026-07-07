"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import PoweredByBpro from "@/components/PoweredByBpro";
import {
  BookOpen, Search, ChevronDown, ChevronRight,
  LayoutDashboard, Users, UserCheck, FileText, ShoppingCart,
  Wrench, Package, Wallet, AlertCircle, UserCircle,
  MapPin, ClipboardList, Shield, Smartphone, Keyboard,
  HelpCircle, Star, ArrowRight, CheckCircle, Info,
  TrendingUp, Receipt, Download, Play, AlertTriangle,
  BadgeCheck, FileDown, Printer, RefreshCw, GitBranch,
  Target, BarChart3, Sparkles, FolderOpen, Palette,
  Database, ScrollText, Trophy, DollarSign, ShoppingBag,
  Truck, FolderKanban, Hammer, ShieldCheck, ClipboardCheck,
  Grid3x3, Globe,
  ChevronRight as Arrow,
} from "lucide-react";

interface Step  { step: string; desc: string; note?: string; }
interface Section {
  id: string; icon: React.ReactNode; title: string; color: string;
  intro: string; steps: Step[]; tips?: string[]; warning?: string;
}
interface FaqItem { q: string; a: string; category: string; }

// ─── WORKFLOW DIAGRAM ─────────────────────────────────────────────────────────
function WorkflowDiagram() {
  const nodes = [
    { label: "Lead",        sub: "CRM module",           color: "#6366F1" },
    { label: "Opportunity", sub: "Track & qualify",      color: "#8B5CF6" },
    { label: "Customer",    sub: "Convert & onboard",    color: "#06B6D4" },
    { label: "Quotation",   sub: "Price & propose",      color: "#F59E0B" },
    { label: "Sales Order", sub: "Confirm & produce",    color: "#F97316" },
    { label: "Invoice",     sub: "Bill & collect",       color: "#10B981" },
    { label: "Tally",       sub: "Auto sync XML",        color: "#3B82F6" },
  ];
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center gap-1 min-w-max">
        {nodes.map((n, i) => (
          <div key={n.label} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div className="w-20 h-14 rounded-xl flex flex-col items-center justify-center text-white text-center shadow-sm"
                style={{ background: n.color }}>
                <span className="text-xs font-bold leading-tight">{n.label}</span>
                <span className="text-[9px] opacity-80 mt-0.5 leading-tight px-1">{n.sub}</span>
              </div>
            </div>
            {i < nodes.length - 1 && (
              <Arrow size={14} className="text-gray-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROLE MATRIX ─────────────────────────────────────────────────────────────
// Cross-checked against ROLE_PATHS in lib/permissions.ts (source of truth).
// AVP / IT Admin / Consultant are FULL_ACCESS roles ("*") — always 1.
function RoleMatrix() {
  const roles = ["MD", "AVP", "BM", "Sales Exec", "CRES", "Production", "Designer", "Accounts", "HR", "IT Admin", "Consultant"];
  const modules = [
    { name: "Dashboard",           access: [1,1,1,1,1,1,1,1,1,1,1] },
    { name: "KPI Monitor",         access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "Leads & CRM",         access: [0,1,1,1,1,0,0,0,0,1,1] },
    { name: "Opportunities",       access: [0,1,1,1,0,0,0,0,0,1,1] },
    { name: "Customers",           access: [0,1,1,1,1,0,0,1,0,1,1] },
    { name: "Quotations",          access: [0,1,1,1,0,0,0,0,0,1,1] },
    { name: "Sales Orders",        access: [0,1,1,1,0,0,0,0,0,1,1] },
    { name: "Work Order Tickets",  access: [0,1,1,1,1,0,0,0,0,1,1] },
    { name: "My Work (Designer)",  access: [0,1,0,0,0,0,1,0,0,1,1] },
    { name: "Work Orders/Prodn",   access: [0,1,1,0,0,1,0,0,0,1,1] },
    { name: "Inventory",           access: [0,1,1,0,0,1,0,0,0,1,1] },
    { name: "Accounts / Invoices", access: [0,1,1,0,0,0,0,1,0,1,1] },
    { name: "Collections",         access: [0,1,1,0,0,0,0,1,0,1,1] },
    { name: "Complaints",          access: [0,1,1,1,1,0,0,0,0,1,1] },
    { name: "Tasks",               access: [0,1,1,1,1,1,1,1,1,1,1] },
    { name: "HR & Attendance",     access: [0,1,1,0,0,0,0,0,1,1,1] },
    { name: "Field Visits",        access: [0,1,1,1,1,0,0,0,0,1,1] },
    { name: "Team Reports",        access: [1,1,1,1,1,1,1,1,1,1,1] },
    { name: "Reports & MIS",       access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "GST Tax Report",      access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "AI Insights",         access: [1,1,1,0,0,0,0,0,0,1,1] },
    { name: "Documents",           access: [1,1,1,1,1,1,1,1,1,1,1] },
    { name: "Tender Management",   access: [1,1,1,1,0,0,0,0,0,1,1] },
    { name: "Job Costing",         access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "Procurement",         access: [1,1,1,0,0,1,0,0,0,1,1] },
    { name: "Fleet Management",    access: [1,1,1,0,0,1,0,0,0,1,1] },
    { name: "Project Management",  access: [1,1,1,0,0,1,0,0,0,1,1] },
    { name: "Installation",        access: [1,1,1,0,0,1,0,0,0,1,1] },
    { name: "AMC & Warranty",      access: [1,1,1,0,0,0,0,1,0,1,1] },
    { name: "Digital Approvals",   access: [1,1,1,0,0,0,0,0,0,1,1] },
    { name: "Field Sales (FJP…)",  access: [1,1,1,1,0,0,0,1,0,1,1] },
    { name: "User Management",     access: [0,1,0,0,0,0,0,0,0,1,1] },
    { name: "Company Settings",    access: [1,1,0,0,0,0,0,0,0,1,1] },
    { name: "Privilege Mgmt",      access: [1,1,0,0,0,0,0,0,0,1,1] },
    { name: "Database Studio",     access: [1,1,0,0,0,0,0,0,0,1,1] },
    { name: "Audit Logs",          access: [1,1,0,0,0,0,0,0,0,1,1] },
  ];
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-indigo-600 text-white">
            <th className="text-left px-3 py-2 font-semibold">Module</th>
            {roles.map(r => <th key={r} className="px-2 py-2 text-center font-semibold whitespace-nowrap">{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {modules.map((m, i) => (
            <tr key={m.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-3 py-1.5 font-medium text-gray-700">{m.name}</td>
              {m.access.map((a, j) => (
                <td key={j} className="px-2 py-1.5 text-center">
                  {a ? <CheckCircle size={12} className="text-green-500 mx-auto" />
                     : <span className="text-gray-300 text-xs">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 p-2">
        BM = Business Manager · CRES = Customer Relations Executive · AVP / IT Admin / Consultant have full access to every module by default.
        MD sees Reports &amp; Dashboard-level modules by default — IT Admin can unlock more per-user via Privilege Management.
      </p>
    </div>
  );
}

// ─── SECTIONS DATA ────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: "quickstart", icon: <Star size={18} />, title: "Quick Start", color: "indigo",
    intro: "Get up and running in minutes. ZAG SIGNS ERP is a cloud-based platform — no installation required. Works on desktop, tablet and mobile.",
    steps: [
      { step: "Open the app", desc: "Visit bprozagcrm.xyz in any browser (Chrome recommended). Bookmark it for quick access. On mobile, add it to your Home Screen for an app-like experience." },
      { step: "Sign in", desc: "Enter your email and password assigned by IT Admin. First-time users receive a Welcome Email with login credentials after account approval." },
      { step: "Explore the Dashboard", desc: "The Dashboard is your home screen. It shows live KPIs: Total Revenue, Active Orders, Leads in pipeline, Open Complaints and Pending Collections. All numbers update in real time." },
      { step: "Navigate using the sidebar", desc: "On desktop: click any module in the left sidebar. On mobile: tap the ☰ hamburger icon (top-left) to open the full menu. Modules you don't have access to are automatically hidden." },
      { step: "Use global search", desc: "Press Cmd+K (Mac) or Ctrl+K (Windows/Android) to open the global search box. Search any lead name, customer, quotation number, order or employee across all modules instantly." },
    ],
    tips: [
      "Install the app on your phone: Chrome (Android) → 3-dot menu → Add to Home Screen. Safari (iPhone) → Share button → Add to Home Screen.",
      "Your session stays active for 24 hours. If you see the login screen, your session has expired — just sign in again.",
      "Dark mode: Click the moon icon 🌙 in the top-right. Preference is saved across sessions.",
    ],
  },
  {
    id: "kpi", icon: <Target size={18} />, title: "KPI Monitor", color: "violet",
    intro: "A scorecard view of individual and team performance against target, built for CRES, Sales Executives, Business Managers and AVPs. Data is pulled from submitted team reports.",
    steps: [
      { step: "Choose your role tab", desc: "At the top of the KPI Dashboard, pick a role tab: CRES / Sales Executive / Business Manager / AVP. Each role tracks different KPIs relevant to that job." },
      { step: "Select the period", desc: "Use the period dropdown to switch between months (e.g. June 2026, May 2026) or a quarter (Q2 2026). KPI cards refresh to show that period's figures." },
      { step: "Filter to one employee", desc: "Use the 'All Employees' dropdown to narrow the view to a single team member, or leave it on All to see everyone in that role for the period." },
      { step: "Read the scorecards", desc: "Each KPI shows Target vs Actual, a percentage achieved, and a status pill: On Track (green), At Risk (yellow) or Behind (red). A progress bar under each KPI visualises the same percentage." },
      { step: "Check the summary strip", desc: "Above the cards, four summary tiles show Avg Achievement, On Track count, At Risk count and Behind Target count across everyone currently shown." },
    ],
    tips: [
      "CRES KPIs track Calls per Day, Appointments Fixed, Lead Conversion % and New Leads Added.",
      "Sales Executive KPIs track Customer Visits, Revenue Target, Collection % and New Customers Acquired.",
      "Business Manager and AVP views roll up team-wide numbers — Team Revenue, Pipeline Value, Productivity Score and Regional Revenue.",
    ],
  },
  {
    id: "crm", icon: <Users size={18} />, title: "Leads & CRM", color: "emerald",
    intro: "The CRM tracks every prospect from first contact to deal closure. The complete workflow is: Lead → Opportunity → Customer → Quotation → Invoice.",
    steps: [
      { step: "Add a new lead", desc: "Go to Leads & CRM → click 'New Lead'. Required fields: Name, Company (optional), Phone, Branch, Source (Cold Call / Referral / Walk-in / Exhibition / Social Media / Website / Other), Estimated Value. Assign to a Sales Executive using the Assigned To dropdown." },
      { step: "Update lead status", desc: "Click any lead row to open the edit panel. Update Status as the conversation progresses: New → Contacted → Qualified → Proposal Sent → Negotiation → Won / Lost. Always set a Follow-up Date so the lead appears in today's action list." },
      { step: "Convert lead to Opportunity", desc: "On the lead row, click the blue 'Opp' button. This creates an Opportunity linked to the lead and moves the lead to QUALIFIED status. Fill in the opportunity title, stage, expected close date and probability." },
      { step: "Convert lead to Customer", desc: "Click the green 'Customer' button on the lead row (available when status is Qualified or above). This creates a Customer record auto-filled from the lead data. Review and confirm the details.", note: "A lead that becomes a customer is marked WON automatically." },
      { step: "Create Quotation from Lead or Customer", desc: "Click the amber 'Quote' button on any lead or customer row. This opens the Quotation creation form pre-filled with the customer/company name. Add your line items and submit." },
      { step: "Attach documents", desc: "Click the paperclip 📎 icon on any lead row to open the Documents panel. Upload PO copies, site photos, approval letters or any related file. Files are stored in Google Drive." },
    ],
    tips: [
      "Filter leads by Status, Branch, or Assigned Executive using the filter bar at the top.",
      "Export leads to Excel using the Export button. The exported file contains all visible columns.",
      "Leads with a follow-up date of today are automatically highlighted at the top of the list.",
    ],
  },
  {
    id: "opportunities", icon: <TrendingUp size={18} />, title: "Opportunities", color: "violet",
    intro: "Opportunities let you track the probability and expected value of each deal in your pipeline with a visual funnel.",
    steps: [
      { step: "View the funnel", desc: "Go to Opportunities. The top section shows clickable stage buttons with deal counts. Click any stage to filter the table. Stages: Qualification → Proposal Sent → Negotiation → Verbal Commitment → Closed Won / Closed Lost." },
      { step: "Update opportunity stage", desc: "In the table, use the Stage dropdown to move an opportunity forward. Probability auto-updates (Qualification=20%, Proposal Sent=40%, Negotiation=65%, Verbal Commitment=85%, Won=100%)." },
      { step: "Convert to Customer", desc: "Click the green 'Customer' button on an opportunity to create a customer from the linked lead data." },
      { step: "Create Quotation", desc: "Click the amber 'Quote' button to open the Quotation form pre-filled with the opportunity's company name." },
    ],
    tips: [
      "The pipeline value shown in the funnel header is the sum of all open opportunity values at each stage.",
      "Closed Lost opportunities are hidden by default. Click 'Lost' stage filter to see them.",
    ],
  },
  {
    id: "customers", icon: <UserCheck size={18} />, title: "Customers", color: "cyan",
    intro: "Customer master: full profile, transaction history, and outstanding balance in one place.",
    steps: [
      { step: "Add a customer manually", desc: "Customers → 'Add Customer'. Required: Name, Company, Phone, Branch. Optional: Email, GST No, Address, Credit Limit. Customer No is auto-generated (CUST-001, CUST-002…)." },
      { step: "Create a Quotation from customer list", desc: "Click the amber 'Quote' button on any customer row. The quotation form opens with this customer pre-selected and the customer dropdown locked." },
      { step: "View customer history", desc: "Click any customer row → all their Quotations, Sales Orders, Invoices, Complaints and Collections appear in one panel." },
      { step: "Manage outstanding balance", desc: "The Outstanding Balance on the customer card updates automatically every time a new Invoice is created or a Collection is recorded." },
      { step: "Export customer list", desc: "Click 'Excel' to download all customers with their order count, total value and outstanding balance." },
    ],
    tips: [
      "Search customers by name, company name, or customer number using the search bar.",
      "Customers created from leads are already linked — all their quotation history is preserved.",
    ],
  },
  {
    id: "quotations", icon: <FileText size={18} />, title: "Quotations", color: "yellow",
    intro: "Create professional, branded quotations with line items, GST, discounts and revision tracking.",
    steps: [
      { step: "Create a new quotation", desc: "Quotations → 'New Quotation'. Select a customer (or leave blank if coming from a lead — the customer field pre-fills). Add line items: Description, Qty, Unit (Nos/Sqft/Rft/Mtr/Job/Set), Unit Rate. GST % and Discount are optional at the bottom." },
      { step: "Quotation number format", desc: "Numbers are auto-generated as ZAG/Q/BRANCH/001. For example: ZAG/Q/HO/007 for HO branch quotation 7, ZAG/Q/TVM/003 for Thiruvananthapuram branch." },
      { step: "Change quotation status", desc: "Use the status dropdown: DRAFT (working) → SENT (emailed) → SUBMITTED (formally submitted) → APPROVED (customer confirmed) → REJECTED. You can also set EMAIL or WHATSAPP to record how it was shared." },
      { step: "Print / Download PDF", desc: "Click 'PDF' on any quotation row. The print dialog opens with the file name pre-set (e.g. ZAG-Q-HO-007-BMH.pdf). Select 'Save as PDF' in the print dialog to download." },
      { step: "Revise a quotation", desc: "Click 'Revise' on any quotation. A new quotation is created with suffix -R2 (e.g. ZAG/Q/HO/007-R2) pre-filled with the original items. Edit what changed, add a revision note, and submit. The revision history shows on the PDF." },
      { step: "Create Invoice from Quotation", desc: "On an APPROVED or SUBMITTED quotation, click the indigo 'Invoice' button. A Tax Invoice is created instantly with all line items, amounts and customer details copied from the quotation. You are redirected to the Invoices page.", note: "This is the recommended way to create invoices — always link from a quotation." },
    ],
    tips: [
      "Line item totals, GST, discount and grand total are all calculated automatically. You cannot enter wrong totals.",
      "The 'Valid Until' date automatically expires the quotation after that date (status becomes EXPIRED).",
      "Attachments: use the 📎 Documents button to attach PO copies or customer approvals to the quotation.",
    ],
    warning: "Do not create multiple active quotations for the same customer for the same job — use the Revise feature instead to keep a clean revision history.",
  },
  {
    id: "invoices", icon: <Receipt size={18} />, title: "Invoices", color: "green",
    intro: "Generate Tax Invoices from approved quotations, track payment status, and export to Tally with one click.",
    steps: [
      { step: "Create an invoice", desc: "Best way: On an APPROVED quotation, click 'Invoice'. All line items, customer details, GST and amounts are copied automatically. Invoice No is auto-generated as ZAG/INV/BRANCH/001." },
      { step: "Invoice number format", desc: "ZAG/INV/HO/001 for HO branch, ZAG/INV/TVM/001 for TVM branch, etc. Numbers are sequential per branch and never reset." },
      { step: "Print the Tax Invoice", desc: "Click the Printer 🖨 icon on any invoice row. The print preview opens. Choose 'Save as PDF' in the print dialog. The PDF contains your company letterhead, GSTIN, line items, CGST/SGST breakdown, bank details and signature blocks." },
      { step: "Export to Tally", desc: "Click 'Tally XML' on any invoice row. A .xml file downloads automatically. In Tally: Gateway of Tally → Import Data → Vouchers → select the file. The invoice imports as a Sales Voucher with correct ledger entries." },
      { step: "Mark payment received", desc: "Click 'Mark Paid' on an invoice to mark it as fully paid. Click 'Partial' to mark partial payment received. Status updates instantly." },
      { step: "Filter by status", desc: "Use the status filter buttons: All / Pending / Partial / Paid / Overdue. Summary cards at the top show total outstanding, partial and collected amounts." },
    ],
    tips: [
      "After Tally XML export, the invoice shows a green 'Tally synced' badge — so you know what's already been imported.",
      "The Tally XML creates: Party Ledger (debit), Sales Account (credit), Output CGST (credit), Output SGST (credit). These match standard Tally ledger names — rename in Tally if your company uses different names.",
      "Overdue invoices (due date passed, not paid) are highlighted in red in the status column.",
    ],
  },
  {
    id: "tally", icon: <FileDown size={18} />, title: "Tally Integration", color: "blue",
    intro: "ZAG SIGNS ERP integrates with Tally via XML import. Each invoice can be exported as a Tally Sales Voucher XML file.",
    steps: [
      { step: "Step 1 — Export from ERP", desc: "Go to Invoices → find the invoice → click 'Tally XML'. The file downloads as ZAG-INV-HO-001.xml (hyphens replace slashes in the filename)." },
      { step: "Step 2 — Open Tally", desc: "Open TallyPrime on your computer. Select your company." },
      { step: "Step 3 — Import the file", desc: "In Tally: Gateway of Tally → Import Data → Vouchers. Press Enter. In the 'File Name' field, enter the full path to the downloaded XML file (or browse to it). Press Enter to import." },
      { step: "Step 4 — Verify in Tally", desc: "Go to Display → Day Book in Tally. The Sales Voucher should appear with the correct date, party name, amount and GST entries." },
      { step: "Ledger mapping", desc: "The XML uses these standard Tally ledger names: Party (customer name), Sales Account, Output CGST, Output SGST, Discount Allowed. If your Tally uses different names, update them in the XML or contact IT Admin to configure custom ledger names." },
    ],
    tips: [
      "Always export Tally XML on the same day as the invoice date for clean accounts.",
      "Batch export: you can export each invoice one by one. There is no bulk export currently.",
      "The green 'Tally synced' badge on an invoice means it has been exported at least once.",
    ],
    warning: "Do not import the same XML file twice in Tally — it will create a duplicate voucher. Check the Day Book in Tally before re-importing.",
  },
  {
    id: "collections", icon: <Wallet size={18} />, title: "Collections", color: "emerald",
    intro: "Record every payment received against an invoice or sales order — cash, cheque, NEFT or UPI — and track collections month by month.",
    steps: [
      { step: "Select the month", desc: "Collections → use the month picker at the top. Summary cards show Total Collected for that month plus a breakdown by the top payment modes used." },
      { step: "Record a payment", desc: "Click 'Record Payment'. Select Customer, then optionally an Invoice and/or Sales Order to apply the payment against. Enter Amount, Date, Payment Mode (Cash / Cheque / NEFT / UPI / Bank Transfer) and Reference." },
      { step: "Link to an invoice", desc: "Selecting an invoice from the dropdown ties the collection to that specific bill so the invoice's paid/outstanding status updates automatically." },
      { step: "Review the collections table", desc: "The table lists Date, Customer, linked Order/Invoice, Amount, Mode and Reference for every payment recorded in the selected month." },
    ],
    tips: [
      "Always enter the UTR or cheque number in Reference for NEFT/UPI/Cheque payments — it's essential for reconciliation.",
      "A collection doesn't have to be tied to an invoice — you can record an advance payment against just the customer.",
    ],
  },
  {
    id: "orders", icon: <ShoppingCart size={18} />, title: "Sales Orders", color: "orange",
    intro: "Track confirmed orders from production through delivery and invoicing.",
    steps: [
      { step: "Create a sales order", desc: "Sales Orders → 'New Order'. Link to a Customer and optionally a Quotation. Enter Delivery Date and Total Amount. Order No is auto-generated (SO-2026-001)." },
      { step: "Update order status", desc: "Status flow: Draft → Confirmed → In Production → Ready for Delivery → Installed → Invoiced → Collected. Update as each stage completes." },
      { step: "Link to work order", desc: "When order is Confirmed, go to Work Orders → 'New Work Order' → link to this Sales Order. Production team tracks the job there." },
      { step: "Track payments", desc: "Paid Amount on the order card updates automatically each time a Collection is recorded against this order." },
    ],
    tips: ["Outstanding balance in the customer record updates automatically as sales orders and collections are linked."],
  },
  {
    id: "tickets", icon: <ClipboardList size={18} />, title: "Work Order Tickets", color: "orange",
    intro: "The front office raises a ticket for every customer job — walk-in, phone, WhatsApp or from an approved quotation. Tickets pass through the Designer queue before moving to production and billing.",
    steps: [
      { step: "Raise a new ticket", desc: "Work Order Tickets → 'New Ticket'. Choose Source: Walk-in / Phone / WhatsApp / From Quotation. Enter Customer Name, Nature of Work, ETA and Priority (High / Medium / Low)." },
      { step: "Raise from an approved quotation", desc: "On any APPROVED or SUBMITTED quotation, click 'Ticket'. Customer name, items and amounts are auto-filled from the quotation — zero re-entry." },
      { step: "Assign a designer", desc: "Select a designer from the 'Assign Designer' dropdown before printing. The ticket is pushed directly to that designer's My Work queue." },
      { step: "Print the work-order slip", desc: "Click 'Print'. An A4 job slip prints with: customer name, nature of work, costing, ETA, and signature blocks for designer and manager." },
      { step: "Designer picks it up (My Work)", desc: "Designer → My Work → sees own ticket queue sorted by priority → clicks 'Pick' then 'Start'. Status: NEW → ASSIGNED → IN PROGRESS." },
      { step: "Close the ticket", desc: "Designer marks 'Done' (remarks required) or 'Half-Done' (reason required). Completed tickets move to the billing queue." },
    ],
    tips: [
      "High-priority tickets automatically sort to the top of every designer's queue.",
      "Every status change is timestamped — use this to measure designer turnaround time.",
    ],
    warning: "Closing a ticket as Done requires mandatory remarks. Half-Done requires a reason. No ticket can be closed without a note.",
  },
  {
    id: "mywork", icon: <Palette size={18} />, title: "Designer: My Work", color: "pink",
    intro: "The Designer role's dedicated queue — every ticket assigned to a designer lands here, ready to pick up, work and close, without seeing the rest of the ERP.",
    steps: [
      { step: "Check the stats strip", desc: "Four tiles at the top show To Pick, In Progress, Half Done and Done Today counts, so a designer can see their workload at a glance." },
      { step: "Filter your queue", desc: "Use the filter tabs: All Mine / To Pick / In Progress / Half Done / Completed. Tickets are sorted with High priority first and overdue jobs (past their Expected date) flagged in red." },
      { step: "Start a ticket", desc: "On a ticket marked ASSIGNED, click 'Start Work'. Status moves to IN PROGRESS and the change is timestamped." },
      { step: "Mark Half Done", desc: "Click 'Half Done' if the job can't be finished yet. A reason is required (e.g. customer pending approval, material delay, design clarity needed) before it saves." },
      { step: "Mark Done", desc: "Click 'Mark Done' when finished. Remarks for billing / next step are required — this note is visible to the front office and production team when the job moves to billing." },
    ],
    tips: [
      "Each ticket card shows the customer's phone as a tap-to-call link, plus the nature of work, reference and description in full.",
      "A previous Half-Done reason stays visible on the ticket card so the designer remembers what was pending.",
    ],
  },
  {
    id: "operations", icon: <Wrench size={18} />, title: "Work Orders & Production", color: "red",
    intro: "Full production suite — job execution, machine scheduling, material consumption tracking and quality control.",
    steps: [
      { step: "Create a work order", desc: "Work Orders → 'New Work Order'. Link to a Sales Order. Enter: Description, Assigned Team, Start Date, Due Date, Priority (High / Medium / Low)." },
      { step: "Update progress", desc: "Status flow: Pending → In Progress → Quality Check → Dispatch Ready → Completed. Progress notes are visible to the linked sales executive in real time." },
      { step: "Machine scheduling", desc: "Production → Machines → Schedule Board. Assign jobs to specific machines. The system detects double-booking conflicts automatically." },
      { step: "Material consumption", desc: "Production → Materials → 'Add Materials'. Select Work Order, material and planned quantity. Inventory stock is auto-deducted on save." },
      { step: "Quality checkpoints", desc: "Production → Quality → 'New Checkpoint'. Select stage (Pre-Production / Mid-Production / Pre-Delivery). Mark PASS, FAIL or CONDITIONAL PASS. Log defects if failed." },
    ],
    tips: [
      "Work orders are visible to the linked sales executive — they see real-time production status without calling the factory.",
      "Low-stock alerts appear when a material falls below its minimum quantity threshold.",
    ],
  },
  {
    id: "inventory", icon: <Package size={18} />, title: "Inventory", color: "emerald",
    intro: "Track all raw materials and supplies across all branches. Monitor stock levels, record in/out movements and get low-stock alerts.",
    steps: [
      { step: "Add a material", desc: "Inventory → 'Add Material'. Required: Name, Category, Branch, Unit (Sqft/Rft/Nos/Kg/Ltr/Roll/Box), Current Stock, Minimum Qty. Minimum Qty is the low-stock alert threshold." },
      { step: "Record a stock movement", desc: "Click 'Stock Movement' on any material row. Choose: IN (received new stock), OUT (consumed/issued), ADJUST (stock count correction). Enter quantity and reason." },
      { step: "Monitor low-stock items", desc: "Materials below their Minimum Qty are highlighted in red. The count of low-stock materials appears as an alert on the Dashboard." },
      { step: "Filter by branch", desc: "Use the branch tabs (ALL / TVM / KTYM / EKM / CLT) at the top of the page to view stock for a specific location." },
      { step: "Bulk import", desc: "Click 'Import' to upload a materials list from Excel. Download the template first and fill it — see Batch Import section." },
    ],
    tips: [
      "Set Minimum Qty carefully — too low means late alerts, too high means unnecessary orders.",
      "OUT movements are recorded automatically when material consumption is logged in Production → Materials.",
    ],
  },
  {
    id: "complaints", icon: <AlertCircle size={18} />, title: "Complaints", color: "red",
    intro: "Log, assign and track every customer complaint to resolution. All complaints are visible to the MD on the Dashboard.",
    steps: [
      { step: "Log a complaint", desc: "Complaints → 'New Complaint'. Required: Customer, Complaint Type, Description, Priority (Low / Medium / High / Critical). Optional: link to a Sales Order or Work Order." },
      { step: "Assign and track", desc: "Assign the complaint to a responsible person. Set an Expected Resolution Date. Update status: OPEN → IN PROGRESS → RESOLVED → CLOSED." },
      { step: "Add resolution notes", desc: "When resolving, enter a Resolution Note explaining what was done. This note appears in the customer's complaint history and on reports." },
      { step: "Escalate urgent complaints", desc: "Set Priority to HIGH or CRITICAL. These appear highlighted on the Dashboard for MD/AVP review and cannot be missed." },
    ],
    tips: [
      "Resolved complaints stay in the customer history — review them to spot recurring issues.",
      "Filter by Branch, Priority or Status to manage the complaints queue efficiently.",
    ],
  },
  {
    id: "tasks", icon: <CheckCircle size={18} />, title: "Tasks & To-Dos", color: "cyan",
    intro: "Assign and track follow-up tasks across the team. Tasks can be linked to leads, customers or orders, or created as stand-alone reminders.",
    steps: [
      { step: "Create a task", desc: "Tasks → 'New Task'. Enter: Title, Description, Assign To, Due Date, Priority (Low / Medium / High / Critical). Optionally link to a Lead, Customer or Sales Order." },
      { step: "Update task status", desc: "Status flow: TODO → IN PROGRESS → DONE → CANCELLED. Click any task to update progress and add notes." },
      { step: "View my tasks", desc: "The Tasks page defaults to 'My Tasks' — tasks assigned to you. Use 'All Tasks' to see the full team list (Managers and above only)." },
      { step: "Priority alert on Dashboard", desc: "HIGH and CRITICAL tasks with today's or past due dates appear as alerts on your Dashboard." },
    ],
    tips: [
      "Link tasks to leads for follow-up reminders — the task appears in the lead's activity history.",
      "Use CRITICAL priority for same-day urgent tasks that must not slip.",
    ],
  },
  {
    id: "hr", icon: <UserCircle size={18} />, title: "HR & Attendance", color: "pink",
    intro: "Employee records, daily attendance and leave management.",
    steps: [
      { step: "Add an employee", desc: "HR & Attendance → Employees tab → 'Add Employee'. Enter: Name, Designation, Department, Branch, Phone, Date of Joining, Monthly Salary." },
      { step: "Mark attendance", desc: "Attendance tab → 'Mark Attendance'. Select Employee + Date + Status (Present / Absent / Half Day / On Leave / Holiday). Add check-in time and check-out time. You can update attendance later if needed." },
      { step: "Submit leave request", desc: "Leave Requests tab → 'New Request'. Select: Leave Type (Casual / Sick / Privilege / Compensatory / Unpaid), From Date, To Date, Reason." },
      { step: "Approve or reject leave", desc: "PENDING leave requests show Approve and Reject buttons for HR/MD. Click to update. Employee sees the status change immediately." },
    ],
    tips: ["Attendance can be marked once per employee per day. To correct a mistake, open the attendance record and update it — do not create a duplicate."],
  },
  {
    id: "field", icon: <MapPin size={18} />, title: "Field Visits", color: "teal",
    intro: "Log customer visits, site surveys, installations and service calls for full management visibility.",
    steps: [
      { step: "Log a field visit", desc: "Field Visits → 'New Visit'. Required: Visit Type (Sales Call / Site Survey / Installation / Service / Collection / Follow-up), Customer Name, Location, Start Time, End Time, Outcome." },
      { step: "Enable GPS tagging", desc: "Toggle 'Geo-tagged'. The browser requests location permission. Accept it to record your current GPS coordinates automatically." },
      { step: "Set next action", desc: "Fill 'Next Action' field to describe what happens next. This creates a visible reminder in team reports." },
    ],
    tips: ["Field visits auto-appear in the Daily Activity Report (DAR) for that day."],
  },
  {
    id: "fjp", icon: <MapPin size={18} />, title: "Fixed Journey Plan (FJP)", color: "teal",
    intro: "A mandatory monthly travel plan submitted by each sales executive before the 27th of the previous month. Lists planned customer visits day-by-day with route, mode and estimated km. Serves as the reference document for expense claims.",
    steps: [
      { step: "Open FJP", desc: "Sidebar → FIELD SALES → Journey Plan (FJP). A banner shows the submission window: green if open (with days remaining), red if the 27th deadline has passed." },
      { step: "Add journey rows", desc: "Click 'Add Row'. Fill: Date, From Place, To Place, Customer/Prospect Name, Purpose, Mode of Travel (Two Wheeler / Four Wheeler / Bus / Train / Flight / Auto), Estimated KM." },
      { step: "Save as draft", desc: "Click 'Save Draft' to save progress without submitting. Return and edit your draft at any time before the 27th." },
      { step: "Submit FJP", desc: "Click 'Submit FJP'. The system assigns a FJP-YYYY-MM-NNN number. Submission is blocked after the 27th deadline." },
      { step: "Print the FJP", desc: "In FJP History, click 'Print'. The printout shows the full route table, total KM, estimated travel cost (₹6/km) and signature blocks." },
      { step: "Link to Expense Report", desc: "When submitting an expense report, select the relevant FJP from the dropdown to link your actual travel to the plan." },
    ],
    tips: [
      "Submit at least 2–3 days before the 27th to allow time for corrections.",
      "Estimated travel cost is auto-calculated at ₹6 per km (minimum reimbursement rate).",
    ],
    warning: "FJP submission is automatically blocked after the 27th. The system does not allow late submissions — plan ahead.",
  },
  {
    id: "expenses", icon: <Wallet size={18} />, title: "Expense Reports", color: "yellow",
    intro: "Submit itemised expense reports for reimbursement — travel, accommodation, food, client entertainment, communication. Every claim references an FJP and goes through a three-tier approval before payment.",
    steps: [
      { step: "Open Expense Reports", desc: "Sidebar → FIELD SALES → Expense Reports → 'New Expense'." },
      { step: "Select type and link FJP", desc: "Choose Expense Type: TRAVEL / ACCOMMODATION / FOOD / CLIENT ENTERTAINMENT / COMMUNICATION / OTHER. For travel, select the related FJP from the dropdown." },
      { step: "Enter line items", desc: "Add one row per expense: Date, Category, Description, From/To Place, KM (for travel), Amount (₹), Bill available (tick). Net Payable = Total – Advance is auto-calculated." },
      { step: "Upload bills to Google Drive", desc: "Click 'Choose Files' → select scanned bills/receipts → 'Upload to Drive'. Files are saved to Google Drive and linked to your report. Approvers can view them." },
      { step: "Submit for approval", desc: "'Save Draft' to save without submitting. 'Submit for Approval' to start the HOD → Accounts → CEO chain. EXP-YYYY-MM-NNN number is assigned on creation." },
      { step: "Print the expense voucher", desc: "Click 'Print' on any submitted report. The printout shows itemised table, totals, net payable and approval history. Attach original hard-copy bills before handing to Accounts." },
    ],
    tips: [
      "Upload all bills before submitting — attachments cannot be added after submission.",
      "Items without bills are flagged and may be queried by Accounts during verification.",
    ],
    warning: "Always print the expense voucher and physically submit it with original bills to Accounts — this is required for audit compliance even after digital approval.",
  },
  {
    id: "approvals", icon: <BadgeCheck size={18} />, title: "Three-Tier Approvals", color: "violet",
    intro: "Expense reports go through a mandatory three-stage approval chain before reimbursement: HOD (Recommend) → Accounts (Verify) → CEO (Approve). Each stage can approve, hold or reject with a mandatory reason.",
    steps: [
      { step: "HOD — Recommend stage", desc: "After submission, the report lands with the HOD (Business Manager / AVP / MD). Options: Recommend (moves to Accounts), Hold (submitter notified with reason), Reject (claim declined with reason)." },
      { step: "Accounts — Verify stage", desc: "Accounts verifies bill amounts, GST claims, advance deductions and policy compliance. Options: Verify (moves to CEO), Hold, Reject." },
      { step: "CEO — Final Approve stage", desc: "MD/CEO gives the final decision. Options: Approve (reimbursement authorised), Hold, Reject. Email notification sent to submitter at every stage." },
      { step: "View pending approvals", desc: "Sidebar → FIELD SALES → Approvals. Approvers see expenses pending their action with a coloured 'Action Required' badge and the step indicator (HOD → Accounts → CEO)." },
    ],
    tips: [
      "Held claims can be resubmitted after addressing the HOD's or Accounts' query.",
      "Email notifications are sent automatically at every stage — no need to follow up manually.",
    ],
  },
  {
    id: "sales", icon: <TrendingUp size={18} />, title: "Field Sales Suite", color: "cyan",
    intro: "The Field Sales section (sidebar → FIELD SALES) is a mini sales-ops dashboard for on-the-road executives, bundling today's activity, pipeline and claims in one screen — Journey Plan, Expense Reports and Approvals above are all part of this suite.",
    steps: [
      { step: "Open the Sales Dashboard", desc: "Sidebar → FIELD SALES → Sales Dashboard. Shows Today's Calls, Today's Visits, Pipeline Value and Won This Month at a glance." },
      { step: "Log Activity", desc: "Click 'Log Activity' to record a call, visit, demo, email or WhatsApp touchpoint against a lead or customer. Logged activities feed straight into the Daily Activity Report." },
      { step: "Check the Claims Window", desc: "The Claims Window card shows whether the reimbursement submission window is currently open, plus counts of Pending and Under Review claims." },
      { step: "Jump to Journey Plan / Expenses / Approvals", desc: "Quick links on the dashboard take you straight to the FJP, Expense Reports and Approvals screens documented above." },
    ],
    tips: ["The Sales Dashboard is a convenience hub — every number on it links back to the underlying Leads, Opportunities, Sales Orders or Claims record."],
  },
  {
    id: "reports", icon: <ClipboardList size={18} />, title: "Team Reports (DAR/WWR/MWR)", color: "indigo",
    intro: "Daily, weekly and monthly activity reports for all team members. MD reviews and approves.",
    steps: [
      { step: "Daily Activity Report (DAR)", desc: "Team Reports → DAR tab → 'New DAR'. Fill: Customer Visits, Calls Made, Orders Booked, Collections Amount, Travel Distance, Production Output. Submit by end of each working day." },
      { step: "Weekly Work Report (WWR)", desc: "WWR tab → 'New WWR'. Enter the week period. Fill: Target vs Achievement, Challenges, Action Plan. Submit by Monday morning for the previous week." },
      { step: "Monthly Work Report (MWR)", desc: "MWR tab → 'New MWR'. Enter monthly KPIs: Sales Target/Achievement, Conversion %, Collection %, Production Efficiency, Rejection Count." },
      { step: "Approval workflow", desc: "Reports flow through approval stages: Submitted → Manager Approved → AVP Approved → MD Approved. Approvers see a list of pending items on their Dashboard." },
    ],
    tips: ["Managers can filter team reports by date range, branch and employee name. Use the date picker to view any historical period."],
  },
  {
    id: "reports-mis", icon: <BarChart3 size={18} />, title: "Reports & MIS", color: "blue",
    intro: "The management dashboard for business-wide analytics — revenue, pipeline, work orders and inventory alerts in one page, live from the database.",
    steps: [
      { step: "Read the KPI row", desc: "Top row shows YTD Revenue (6 months) vs target, total Pipeline Value, Collection This Month vs target, and Open Complaints requiring action." },
      { step: "Monthly Revenue vs Target", desc: "Bar chart comparing actual monthly revenue against target for each of the last 6 months." },
      { step: "Lead Conversion pie", desc: "Shows the split of all leads into Won / Lost / Active so you can see conversion health at a glance." },
      { step: "Lead Pipeline Funnel", desc: "Horizontal bar chart of open leads grouped by stage — spot where deals are getting stuck." },
      { step: "Work Orders by Status", desc: "Pie chart of all work orders by status (Pending, In Progress, Quality Check, Dispatch Ready, Completed, On Hold)." },
      { step: "Branch Performance table", desc: "Every branch's Orders, Revenue and % of total revenue, with a visual share bar — sort mentally by scanning the % column." },
      { step: "Inventory Alerts", desc: "Any material that is Low, Critical or Out of stock across branches is listed here with current vs minimum quantity, so nothing gets missed." },
    ],
    tips: ["This page has no filters — it always shows live, current-month figures. Use GST Tax Report or AI Insights for a narrower or predictive view."],
  },
  {
    id: "tax-report", icon: <ScrollText size={18} />, title: "GST Tax Report", color: "amber",
    intro: "A GST-focused breakdown of every quotation, grouped by tax rate (Exempt, 5%, 12%, 18%), for filing and reconciliation.",
    steps: [
      { step: "Set the date range", desc: "Use the From and To date pickers, then the report refreshes automatically (or click Refresh)." },
      { step: "Filter by GST rate", desc: "Click any of the four rate cards (Exempt / 5% / 12% / 18%) to filter the transaction table to just that rate. Click again to clear the filter." },
      { step: "Check the grand totals bar", desc: "The indigo summary bar shows Total Quotations, Total Taxable Value, Total GST Collected and Grand Total for the selected period and filter." },
      { step: "Review the detail table", desc: "Lists every quotation with Quote No, Customer, Date, GST Rate, Taxable Value, CGST, SGST and Total — with subtotals in the footer row." },
      { step: "Export", desc: "Use the Drive export button (top-right) to save the filtered rows as a spreadsheet for your accountant or GST filing." },
    ],
    tips: ["CGST and SGST are always shown as exactly half the GST rate each, matching standard intra-state GST splitting."],
  },
  {
    id: "ai-insights", icon: <Sparkles size={18} />, title: "AI Insights", color: "violet",
    intro: "Live, database-driven analysis — no manual entry required. Surfaces which leads to chase first, which customers are at risk of churning, and branch-wise performance trends.",
    steps: [
      { step: "Check the summary KPIs", desc: "Active Leads, Open Orders, Complaints and WO Tickets — a quick pulse of open work across the company." },
      { step: "Lead Priority Score", desc: "Leads are ranked by an AI-computed score (0–100) that factors in stage, value and recency. Work the list top-down for the highest-priority follow-ups." },
      { step: "Churn Risk Customers", desc: "Flags customers with no order in 90+ days as Low / Medium / High risk with a percentage — a proactive nudge to re-engage before they go quiet." },
      { step: "Branch Revenue chart", desc: "Bar chart of this month's revenue by branch." },
      { step: "Revenue Trend (30 days)", desc: "Weekly revenue bars for the last 30 days — spot momentum or slowdown early." },
      { step: "Refresh", desc: "Click the refresh icon in the header to re-run the analysis against the latest data at any time." },
    ],
    tips: ["This page requires no configuration — every insight is computed automatically from your existing leads, orders and invoices."],
  },
  {
    id: "documents", icon: <FolderOpen size={18} />, title: "Documents", color: "slate",
    intro: "A central, searchable index of every file linked into the ERP — quotations, contracts, artwork, HR paperwork — all stored in Google Drive and just linked here.",
    steps: [
      { step: "Browse by category", desc: "Category chips at the top (Quotations, Sales Orders, Invoices, Contracts, Artwork, Photos, Reports, HR Documents, Marketing, Other) filter the grid instantly with a live count on each chip." },
      { step: "Search and filter by record type", desc: "Use the search box for name/record/tag matches, and the Record Type dropdown to narrow to LEAD, CUSTOMER, ORDER, QUOTATION or FIELD_VISIT." },
      { step: "Open a document", desc: "Click 'Open in Drive' on any card to view the file in Google Drive in a new tab." },
      { step: "Link a new document", desc: "Click 'Link Document' → enter a Name and the Google Drive URL, optionally set a Category and link it to a specific record type and ID. Click 'Save Link'." },
      { step: "Remove a document link", desc: "Click the trash icon on a card to remove the document record. This only removes the link from the ERP — it does not delete the file from Drive." },
    ],
    tips: ["Most documents get here automatically — when you attach a file from Leads, Customers, Sales Orders or Quotations, it shows up in this index too."],
  },
  {
    id: "extended-ops", icon: <Grid3x3 size={18} />, title: "Extended Operations Overview", color: "cyan",
    intro: "Nine additional modules extend the ERP beyond core sales and production — tenders, job costing, procurement, fleet, projects, installation, AMC/warranty, digital approvals and the field sales suite. Each is documented in its own section below.",
    steps: [
      { step: "Tender Management", desc: "Track bids from RFP through win/loss with a running win rate and active pipeline value. See the Tender Management section below." },
      { step: "Job Costing", desc: "Compare quoted vs actual revenue against itemised material/labour/overhead costs per sales order to see true gross margin. See the Job Costing section below." },
      { step: "Procurement", desc: "Manage Vendors, Purchase Orders and Goods Received Notes (GRN) in one tabbed screen. See the Procurement section below." },
      { step: "Fleet Management", desc: "Track company vehicles, trip logs and fuel consumption. See the Fleet Management section below." },
      { step: "Project Management", desc: "Manage larger jobs with milestones and a status pipeline (Planning → Production → Dispatch → Installation → Completed). See the Project Management section below." },
      { step: "Installation Tracking", desc: "A field-focused pipeline view of orders moving through Dispatched → Installation → Installed → Delivered. See the Installation Tracking section below." },
      { step: "AMC & Warranty", desc: "Manage annual maintenance contracts and the service tickets raised against them. See the AMC & Warranty section below." },
      { step: "Digital Approvals", desc: "Collect customer sign-off on artwork, production, site or handover milestones. See the Digital Approvals section below." },
    ],
    tips: ["These modules were added on 06 Jul 2026 — if your account doesn't show them yet, ask IT Admin to check Privilege Management for a stale-override warning."],
  },
  {
    id: "tender", icon: <Trophy size={18} />, title: "Tender Management", color: "amber",
    intro: "Track competitive bids from RFP through submission to win or loss, with running pipeline value and win-rate KPIs.",
    steps: [
      { step: "Log a new tender", desc: "Click 'New Tender'. Enter Title, Client / Organisation, Branch, Bid Value, RFP Date, Submit Deadline and Opening/Result Date." },
      { step: "Track competitor info", desc: "Use the Competitor Info field to note known competitors and their bid values for post-mortem analysis." },
      { step: "Move status forward", desc: "On an OPEN tender, click 'Submit' to mark it SUBMITTED. On a SUBMITTED tender, click 'Won' or 'Lost' to close it out — enter the Awarded Value if won." },
      { step: "Read the KPI cards", desc: "Active Pipeline (open bid value), Tenders Won (with total awarded value), Win Rate % and Overdue count (past deadline, still OPEN)." },
      { step: "Filter and search", desc: "Use the search box and status dropdown (OPEN / SUBMITTED / WON / LOST / CANCELLED) to narrow the tender list." },
    ],
    tips: ["Click any row to reopen and edit it — the same modal is used for both creating and editing a tender."],
  },
  {
    id: "job-costing", icon: <DollarSign size={18} />, title: "Job Costing", color: "orange",
    intro: "Attach a detailed cost sheet to any Sales Order and see gross profit and margin % in real time as you enter line items.",
    steps: [
      { step: "Select a sales order", desc: "Choose the order from the dropdown. If a cost sheet already exists for it, click 'Load saved cost sheet' to bring in the saved figures." },
      { step: "Enter revenue", desc: "Fill Quoted Revenue, and optionally Actual Revenue if it differs from the quote (e.g. after a revision)." },
      { step: "Add cost line items", desc: "Click 'Add Line' for each cost — choose a Category (Material / Labour / Printing / Vinyl / Fabrication / Electrical / Transport / Subcontract / Overhead / Other), enter Description, Qty, Unit, and Unit Cost. Total per line calculates automatically." },
      { step: "Read the margin KPIs", desc: "Four live tiles show Quoted Revenue, Total Cost, Gross Profit and Margin % — colour-coded red/amber/green based on how healthy the margin is." },
      { step: "Save the cost sheet", desc: "Add any notes, then click 'Save Cost Sheet'. You can return anytime and reload it to update actuals once the job is billed." },
    ],
    tips: ["Margin % turns green at 20%+, amber between 10–20%, and red below 10% — use this as a quick health check before finalising a quote."],
  },
  {
    id: "procurement", icon: <ShoppingBag size={18} />, title: "Procurement — Vendors, POs & GRN", color: "amber",
    intro: "Manage the full purchasing cycle in one tabbed screen: vendor master, Purchase Orders, and Goods Received Notes (GRN) when materials arrive.",
    steps: [
      { step: "Add a vendor", desc: "Vendors tab → 'Add Vendor'. Enter Name, Company, Phone, Email, GSTIN, Address, Category (Material/Service/Printing/Subcontract/Transport/Other), Branch and Credit Days." },
      { step: "Create a Purchase Order", desc: "Purchase Orders tab → 'New PO'. Select a Vendor and Branch, set a Delivery Date, then add line items (Description, Qty, Unit, Rate) — totals calculate automatically." },
      { step: "Send the PO", desc: "On a DRAFT PO, click 'Send' to move it to SENT status, signalling it has gone to the vendor." },
      { step: "Record goods received (GRN)", desc: "On a SENT PO, click 'Receive' — this jumps to the GRN tab pre-filled with that PO. Enter Ordered / Received / Rejected quantities per item and the Received Date, then click 'Record GRN'." },
      { step: "Track PO status", desc: "Status flow: DRAFT → SENT → PARTIAL → RECEIVED → COMPLETED (or CANCELLED). Filter the PO list by status." },
    ],
    tips: ["Recording a GRN against a PO also refreshes the PO list, so partial receipts are reflected immediately."],
  },
  {
    id: "fleet", icon: <Truck size={18} />, title: "Fleet Management", color: "blue",
    intro: "Track company vehicles, log trips with odometer readings, and record fuel purchases — all in one tabbed page.",
    steps: [
      { step: "Add a vehicle", desc: "Vehicles tab → 'Add Vehicle'. Enter Vehicle No, Make, Model, Type (Van/Truck/Car/Bike/Auto/Other), Branch, Insurance Expiry, PUC Expiry and Next Service Due." },
      { step: "Log a trip", desc: "Trips tab → 'Log Trip'. Select the Vehicle, enter From/To place, Start KM (End KM filled in later on return), Purpose and Start Time." },
      { step: "Log fuel", desc: "Fuel Logs tab → 'Log Fuel'. Select Vehicle, Date, Litres, Cost per Litre, Odometer reading and Fuel Station." },
      { step: "Read the KPI row", desc: "Total Vehicles, Active vehicles, Total KM across all logged trips, and total Fuel Spend." },
    ],
    tips: ["Insurance and PUC expiry dates show as coloured chips on each vehicle card — check these regularly to avoid lapses."],
  },
  {
    id: "projects", icon: <FolderKanban size={18} />, title: "Project Management", color: "indigo",
    intro: "For larger jobs that need milestone tracking beyond a simple Sales Order — a status pipeline plus a checklist of dated milestones.",
    steps: [
      { step: "Create a project", desc: "Click 'New Project'. Enter Name, Customer, Branch, Budget, Start Date and End Date." },
      { step: "Add milestones", desc: "In the same form, click 'Add' under Milestones to add rows — each with a Title and Due Date. Add as many as the job needs." },
      { step: "Update project status", desc: "Select a project from the list, then click any status pill in the detail panel: PLANNING → PRODUCTION → DISPATCH → INSTALLATION → COMPLETED (or ON_HOLD)." },
      { step: "Track milestone progress", desc: "Each milestone in the detail panel shows an icon and status — Pending (clock), Completed (green check) or Delayed (red warning)." },
    ],
    tips: ["The milestone progress bar on each project card in the list gives an instant visual — green segments are done, red are delayed, grey are pending."],
  },
  {
    id: "installation", icon: <Hammer size={18} />, title: "Installation Tracking", color: "orange",
    intro: "A focused field-operations view of orders once they leave production — from Dispatched through Installation to Installed and Delivered.",
    steps: [
      { step: "Filter by stage", desc: "Use the stage tabs (All Field / Dispatched / Installing / Installed) to see orders at a specific point in the field pipeline." },
      { step: "Search an order", desc: "Use the search box to find by order number or customer name." },
      { step: "Advance a stage", desc: "Click the action button on an order card — '→ Start Installation', '→ Mark Installed' or '→ Mark Delivered' — to move it to the next stage. The same button appears in the detail panel." },
      { step: "View site details", desc: "Click any order to open the detail panel — shows Customer, Company, Phone, Branch, Amount, Order Date, Site Address and any Notes, plus a visual pipeline stage tracker." },
    ],
    tips: ["Only orders already in DISPATCHED, INSTALLATION, INSTALLED or DELIVERED status appear here — earlier-stage orders stay in Sales Orders until dispatch."],
  },
  {
    id: "amc", icon: <ShieldCheck size={18} />, title: "AMC & Warranty", color: "emerald",
    intro: "Manage Annual Maintenance Contracts and the service tickets raised against them (or ad-hoc/warranty tickets with no contract).",
    steps: [
      { step: "Create an AMC contract", desc: "AMC Contracts tab → 'New Contract'. Select the Customer, enter a Description, Start/End Date, Annual Value and Visit Frequency (Monthly / Quarterly / Half-Yearly / Annually)." },
      { step: "Raise a service ticket", desc: "Service Tickets tab → 'Raise Ticket'. Select Customer, optionally link an active AMC Contract, choose Type (Warranty / AMC / Adhoc), Priority (Low/Medium/High/Critical), Description, Assign To and SLA hours." },
      { step: "Progress a ticket", desc: "Status flow: OPEN → click 'Start' → IN PROGRESS → click 'Resolve' → RESOLVED → click 'Close' → CLOSED." },
      { step: "Filter tickets", desc: "Use the Status and Priority dropdowns above the ticket table to narrow the list." },
      { step: "Read the KPI row", desc: "Active Contracts (with total annual value), Open Tickets, Critical/Urgent tickets needing immediate action, and Total Contracts all-time." },
    ],
    tips: ["A ticket doesn't need an AMC contract — leave 'Linked AMC Contract' as None/Ad-hoc for a one-off warranty call."],
  },
  {
    id: "digital-approvals", icon: <ClipboardCheck size={18} />, title: "Digital Approvals", color: "violet",
    intro: "Collect and track customer sign-off on artwork, production, site readiness or handover — without needing a physical signature.",
    steps: [
      { step: "Create an approval request", desc: "Click 'New Approval'. Choose Approval Type (Artwork / Production / Site / Handover), what it's Related To (Sales Order / Work Order / Quotation) and its reference, then the Customer Name, Email, Phone and a Document URL (Drive link to the artwork/document)." },
      { step: "Share for review", desc: "Send the customer the document link. When they respond, open the request and record their decision." },
      { step: "Record the decision", desc: "In the detail panel, click Approve, Reject, or Request Revision — each updates the status immediately and is timestamped." },
      { step: "Filter the queue", desc: "Use the Type and Status dropdowns, or search by customer name / approval number, to find a specific request." },
    ],
    tips: ["'Revision Requested' is a distinct status from Rejected — use it when the customer wants changes rather than declining outright."],
  },
  {
    id: "admin", icon: <Shield size={18} />, title: "Admin & Settings", color: "slate",
    intro: "User management, role and branch assignment, and company settings. Available to MD and IT Admin only.",
    steps: [
      { step: "Add a new user", desc: "Admin → User Management → 'Add User'. Enter: Full Name, Email, Role, Branch, Phone. The user receives a Welcome Email with a temporary password. Status starts as PENDING until approved." },
      { step: "Approve a new user", desc: "In User Management, find the PENDING user → click the Approve button. Status changes to ACTIVE. The user can now log in." },
      { step: "Change user role or branch", desc: "Click any user row → Edit. Update Role, Branch or Status. Click Save. Changes take effect on the user's next login." },
      { step: "Company Settings", desc: "Admin → Company Settings. Set your company name, address, GSTIN, bank details, logo URL and UPI QR code URL. These appear on all printed quotations and invoices." },
    ],
    tips: [
      "If a user forgets their password, go to User Management → find the user → Reset Password. A new password email is sent.",
    ],
    warning: "Never share your login credentials. If you suspect your account has been accessed without your permission, contact IT Admin immediately to deactivate and reset.",
  },
  {
    id: "privileges", icon: <Shield size={18} />, title: "Privilege Management", color: "violet",
    intro: "Per-user overrides on top of role defaults — grant or restrict individual users' access to specific modules without changing their role. MD and IT Admin only.",
    steps: [
      { step: "Select a user", desc: "The left panel lists every user with their role. Users with a saved custom override show a 'custom' tag; the count of customised users is shown at the bottom of the list." },
      { step: "Understand the two modes", desc: "'Role defaults' means the user's access simply follows their role (see the Role Permission Matrix). 'Custom permissions' means an explicit per-user override is saved in the database and takes priority over the role default." },
      { step: "Toggle individual modules", desc: "Click any module checkbox to grant or revoke it. Toggling any checkbox automatically switches the user into Custom mode." },
      { step: "Use group actions", desc: "'Select all' / 'Deselect all' on a module group (e.g. Finance, Extended Operations) toggles every item in that group at once. The 'All' and 'None' buttons in the header grant or revoke everything." },
      { step: "Reset to role defaults", desc: "Click 'Reset to role defaults' to discard the custom override and fall back to whatever the user's role normally grants." },
      { step: "Save", desc: "Click 'Save'. If the user is in Custom mode, their exact module list is saved as an override. If reset to role defaults, the override is deleted so future new modules for that role are picked up automatically." },
    ],
    tips: [
      "A custom override is a hard whitelist — it does NOT automatically pick up new modules added to the app later. Role-default users always get new modules automatically; custom-override users do not.",
      "Watch for the amber 'stale override' banner (see warning below) — it tells you exactly which new modules a custom user is missing.",
    ],
    warning: "When a module is added to the ERP after a user's custom override was last saved, an amber warning banner appears: 'N modules were added to the app after this override was last saved, so [user] currently can't access them.' Click 'Add these' to instantly add the missing modules to their override, then Save. This prevents a user from silently losing access to new features just because they have a custom permission set.",
  },
  {
    id: "database", icon: <Database size={18} />, title: "Database Studio", color: "red",
    intro: "A direct, table-by-table view into the underlying database — for MD and IT Admin to inspect or correct records that can't be fixed through the normal UI. Use with caution.",
    steps: [
      { step: "Pick a table", desc: "The left sidebar lists every database table with its record count. Click one to load its data." },
      { step: "Browse and filter", desc: "Use the 'Filter rows…' search box to find matching records across all visible columns on the current page." },
      { step: "Page through records", desc: "Data loads 50 rows at a time — use the Previous/Next arrows at the bottom to page through a large table." },
      { step: "Edit a record", desc: "Click the pencil icon on any row to open the Edit Record modal. Every column becomes an editable field except id, createdAt and updatedAt, which are read-only. Click 'Save Changes'." },
    ],
    tips: ["Values are shown read-only for dates/booleans/JSON for clarity, but are edited as plain text — take care with formats (dates, JSON) when editing directly."],
    warning: "This is a low-level tool that writes directly to the database, bypassing normal validation. Only IT Admin or MD should use it, and only when a fix genuinely can't be made through the regular module screens.",
  },
  {
    id: "audit", icon: <ScrollText size={18} />, title: "Audit Logs", color: "slate",
    intro: "A permanent, tamper-proof record of every create, update and delete action across the ERP — who did it, on what record, and when.",
    steps: [
      { step: "Open the audit log", desc: "Admin → Audit Trail. The table lists the most recent 100 entries per page: Timestamp, User (name + email), Action, Table, Record ID and IP address." },
      { step: "Filter by table", desc: "Use the 'All Tables' dropdown to narrow the log to one entity — User, Lead, Customer, SalesOrder, Quotation, Employee, Invoice, WorkOrder or Inventory." },
      { step: "Read the action badges", desc: "CREATE (green), UPDATE (amber), DELETE (red), LOGIN (indigo), APPROVE (blue) and REJECT (rose) are colour-coded so you can scan quickly for the action type you're looking for." },
      { step: "Page through history", desc: "Use Previous / Next at the bottom to move through older or newer entries, 100 at a time." },
    ],
    tips: ["Audit log entries are permanent — they cannot be edited or deleted, even by the MD or IT Admin. This makes the log reliable for compliance and dispute resolution."],
  },
  {
    id: "modules-launcher", icon: <Grid3x3 size={18} />, title: "All Modules Launcher", color: "indigo",
    intro: "A single visual grid of every module you have access to, grouped by section (Overview, Sales & CRM, Operations, Procurement & Fleet, Finance, Field Sales, People & Field, AMC & Service, Reports & AI, Admin, Support) — a faster alternative to the sidebar for jumping straight to a module.",
    steps: [
      { step: "Open All Modules", desc: "Click 'All Modules' from the sidebar, or navigate to /modules directly." },
      { step: "Scan the hero banner", desc: "Shows your name, branch and role, plus the total number of active modules and sections visible to you." },
      { step: "Click any tile", desc: "Each module is a coloured icon tile with a one-line description underneath — click it to jump straight to that module." },
    ],
    tips: ["The grid only ever shows modules you have permission to see — it respects the same role/privilege rules as the sidebar."],
  },
  {
    id: "portal", icon: <Globe size={18} />, title: "Customer Portal", color: "teal",
    intro: "A lightweight, public-facing self-service page customers can use to check their own quotations, orders and invoices — no login required, accessed via a shareable link.",
    steps: [
      { step: "Share the portal link", desc: "Send the customer a link in the form /portal?customer=<customerNo> — using their Customer No from the Customers module. They can bookmark this link for repeat use." },
      { step: "What the customer sees", desc: "A header with their name and customer number, summary tiles (Quotations count, Orders count, Outstanding amount), and three tabs: Orders, Quotations and Invoices." },
      { step: "Status visibility", desc: "Each row shows the same status badges used internally (e.g. APPROVED, PENDING, PAID) so customers always see current, live status without calling in." },
      { step: "No customer found", desc: "If the customer number is invalid or missing, the portal shows a friendly error with your company's phone number so they can call for help instead." },
    ],
    tips: ["The portal is read-only — customers cannot edit anything, only view their own records.", "There is no password; treat the portal link itself as the access credential and only share it with the correct customer."],
  },
];

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────
const FAQ: FaqItem[] = [
  // Login & Access
  { category: "Login & Access", q: "How do I log in for the first time?", a: "After IT Admin creates your account, you receive a Welcome Email with your email address and a temporary password. Go to bprozagcrm.xyz and sign in. Change your password immediately after first login." },
  { category: "Login & Access", q: "I forgot my password. What do I do?", a: "Contact your IT Admin. Go to Admin → User Management → find the user → click Reset Password. A new password email is sent. The user must change it on first login." },
  { category: "Login & Access", q: "Why can't I see certain modules in the menu?", a: "Modules are hidden based on your role. For example, a Sales Executive cannot see HR & Attendance or Admin. If you need access to a module, contact IT Admin to update your role." },
  { category: "Login & Access", q: "How do I install the app on my phone?", a: "Android (Chrome): open bprozagcrm.xyz → tap ⋮ (3-dot menu) → Add to Home Screen. iPhone (Safari): open the URL → tap Share button (box with upward arrow) → Add to Home Screen. The app icon appears on your screen and opens in full-screen like a native app." },
  { category: "Login & Access", q: "Can I use the app offline?", a: "Previously loaded pages are accessible offline. Any action that reads or writes data (creating leads, recording payments) requires an internet connection. A 'Connection lost' notice appears when you go offline." },
  // CRM & Leads
  { category: "CRM & Leads", q: "How do I convert a lead to a customer?", a: "On the Leads page, click the green 'Customer' button on the lead row. A customer is created auto-filled from the lead. Review the details (company name, phone, branch) and confirm. The lead status is automatically set to WON." },
  { category: "CRM & Leads", q: "Can I create a quotation without a customer record?", a: "Yes. When creating a quotation from a lead, the customer field is replaced with a blue label showing the lead's company name. The quotation links to the lead directly. A customer record is created when you formally convert the lead." },
  { category: "CRM & Leads", q: "How do I add a follow-up reminder for a lead?", a: "Open the lead → Edit → set the Follow-up Date field. Leads with today's follow-up date appear highlighted at the top of the Leads list. There are no push notifications yet — the sales executive must check the Leads list daily." },
  // Quotations
  { category: "Quotations", q: "How do I create a revised quotation?", a: "On the quotation row, click 'Revise'. A new quotation is created with the same items pre-filled and a suffix of -R2 (or -R3 for a second revision). Edit the items that changed, add a Revision Note explaining why it was revised, and submit. The original and all revisions appear in the Revision History section of the printed PDF." },
  { category: "Quotations", q: "The quotation PDF has the wrong logo. How do I fix it?", a: "Go to Admin → Company Settings → Logo URL. Enter the direct URL to your company logo image (must be a public HTTPS URL). The logo updates on all future printed quotations immediately. The current logo is loaded from /zagsigns-logo.png on the server." },
  { category: "Quotations", q: "How do I add GST to a quotation?", a: "In the quotation form, scroll to the Tax/GST field below the line items. Enter the GST percentage (e.g. 5, 12, or 18). CGST and SGST are each set to half the total rate automatically. Both appear as separate line items on the printed quotation (for GST compliance)." },
  // Invoices & Tally
  { category: "Invoices & Tally", q: "How do I create an invoice?", a: "The recommended way: go to Quotations → find an APPROVED or SUBMITTED quotation → click the indigo 'Invoice' button. All items, amounts, customer details and GST are copied automatically. Invoice No is auto-generated as ZAG/INV/BRANCH/001." },
  { category: "Invoices & Tally", q: "How do I import an invoice into Tally?", a: "On the Invoices page, click 'Tally XML' on the invoice. A .xml file downloads to your computer. In Tally: Gateway of Tally → Import Data → Vouchers → enter the file path → press Enter. The invoice appears in Tally as a Sales Voucher with party ledger, sales ledger, CGST and SGST entries." },
  { category: "Invoices & Tally", q: "The Tally import shows an error about ledgers not found. What do I do?", a: "Tally cannot find the ledger name. The XML uses standard names: 'Sales Account', 'Output CGST', 'Output SGST'. Make sure these ledger names exist in Tally under the correct account groups. If your company uses different names (e.g. 'Sales - Signage' instead of 'Sales Account'), contact IT Admin to configure custom ledger names for your company." },
  { category: "Invoices & Tally", q: "I accidentally imported a Tally XML twice. What do I do?", a: "Open Tally → Display → Day Book → find the duplicate voucher → press Delete to remove it. Do not re-import. Check the 'Tally synced' badge on the invoice in ERP before exporting again." },
  // Finance
  { category: "Finance & Payments", q: "How do I record a partial payment?", a: "Go to Invoices → click 'Partial' on the invoice. Then go to Collections → 'Record Payment' → enter the amount actually received and the payment mode (Cash/Cheque/NEFT/UPI). The invoice status updates to PARTIAL. Record another collection when the balance arrives — the invoice then moves to PAID automatically." },
  { category: "Finance & Payments", q: "Why is an invoice showing as OVERDUE?", a: "The invoice Due Date has passed and the status is still PENDING or PARTIAL. Contact the customer for payment. The status changes to PAID automatically only when collections equal the total invoice amount." },
  // Admin
  { category: "Admin", q: "What are the user roles and what can each access?", a: "MD: full access to everything. AVP: all modules except Admin. Business Manager: all modules for their branch. Sales Executive: Leads, Customers, Quotations, Sales Orders, Field Visits, Tasks. CRE: Leads, Customers, Complaints, Tasks, Field Visits. Production: Work Orders, Production, Inventory, Tasks. Accounts: Customers, Invoices, Collections, Reports. HR: HR & Attendance, Tasks. IT Admin: everything including Admin." },
  { category: "Admin", q: "How do I see what a user has done in the system?", a: "Admin → Audit Trail. Filter by the user's email address. Every create, update and delete action is logged with the exact timestamp, old values and new values. This log is permanent and cannot be tampered with." },
  { category: "Admin", q: "How do I export data to Excel?", a: "Every list page (Leads, Customers, Quotations, Invoices, etc.) has an 'Excel' or 'Export' button in the filter bar. Click it to download the current filtered view as a .xlsx file. The file opens in Excel or Google Sheets." },
  // Work Order Tickets
  { category: "Work Order Tickets", q: "What is the difference between a Work Order Ticket and a Work Order?", a: "A Work Order Ticket is raised by the front office as soon as a customer brings a job — it's a lightweight slip that goes to the Designer queue first. A Work Order (Production module) is the full production job card linked to a Sales Order, created after the design phase. Ticket → Design → Work Order → Production." },
  { category: "Work Order Tickets", q: "How does a designer see their assigned tickets?", a: "The designer logs in and goes to 'My Work' (sidebar or bottom nav on mobile). The queue shows all tickets assigned to them, sorted by priority (High first). They click 'Pick' to accept and 'Start' to begin. Status updates automatically." },
  { category: "Work Order Tickets", q: "Can I raise a ticket directly from a quotation?", a: "Yes. On any APPROVED or SUBMITTED quotation, click the 'Ticket' button. The customer name, nature of work and amount are auto-filled from the quotation. This avoids re-entering data." },
  // Inventory
  { category: "Inventory", q: "How do I get a low-stock alert?", a: "When adding a material, set the 'Minimum Qty' field. When current stock falls below this number, the item turns red in the Inventory list and the count of low-stock items appears as an alert on the Dashboard. Each branch has its own stock levels." },
  { category: "Inventory", q: "How do I correct a wrong stock count?", a: "Go to Inventory → click 'Stock Movement' on the material → choose ADJUST → enter the correct quantity and a reason (e.g. 'Physical count correction'). The system records the adjustment with a timestamp so it's traceable in the movement history." },
  // Complaints
  { category: "Complaints", q: "Can I link a complaint to a specific sales order or job?", a: "Yes. When creating a complaint, the form has optional dropdowns to link it to a Sales Order or Work Order. This lets you trace which job caused the issue and appears in the linked order's history." },
  { category: "Complaints", q: "Who can see complaints on the Dashboard?", a: "MD, AVP and Branch Managers see all open complaints on the Dashboard. CRITICAL priority complaints are highlighted separately. Sales Executives and CRE can only see complaints they raised or are assigned to." },
  // Tasks
  { category: "Tasks", q: "How do I assign a task to someone else?", a: "Tasks → 'New Task' → use the 'Assign To' dropdown to select any team member. They will see the task in their 'My Tasks' list. You can also assign tasks to yourself as personal reminders." },
  { category: "Tasks", q: "Can tasks be linked to leads?", a: "Yes. When creating a task, use the 'Link To' dropdown to connect it to a Lead, Customer, Sales Order or Work Order. The task then appears in that record's activity timeline." },
  // FJP
  { category: "FJP & Expenses", q: "What happens if I miss the FJP deadline on the 27th?", a: "The system automatically blocks FJP submission after the 27th. There is no override — you cannot submit a late FJP. If you have an emergency, contact your HOD who can contact IT Admin to manually backdate a submission in exceptional circumstances." },
  { category: "FJP & Expenses", q: "Do I need an FJP to submit an expense claim?", a: "For travel expenses, yes — you must link an FJP to the expense report. For non-travel expenses (accommodation, food, communication), the FJP link is optional. Always submit your monthly FJP before making any travel expense claims." },
  { category: "FJP & Expenses", q: "My expense was rejected. Can I resubmit?", a: "Yes. If an approver Holds or Rejects your expense, you receive an email with the reason. Address the issue (add missing bills, correct amounts), then go to Expense Reports → find the held/rejected report → click 'Resubmit' to send it back for approval." },
  { category: "FJP & Expenses", q: "How do I upload bills to an expense report?", a: "In the expense form, scroll to 'Supporting Documents'. Click 'Choose Files', select your scanned bills or photos of receipts, then click 'Upload to Drive'. The files are saved to Google Drive and linked to your report. Approvers can view them online. Upload all bills before submitting — they cannot be added after submission." },
  // Technical
  { category: "Technical", q: "The page is not loading or showing an error. What do I do?", a: "1. Hard-refresh: press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows). 2. Clear browser cache. 3. Try an incognito/private window. 4. Check your internet connection. 5. If the problem persists, contact IT Admin with a screenshot of the error." },
  { category: "Technical", q: "Can multiple users be logged in at the same time?", a: "Yes. Each user has their own secure session. All changes are written to the database in real time and visible to all logged-in users without refreshing the page." },
  { category: "Technical", q: "My data shows the wrong time or date. Why?", a: "The app uses your device's local time. Make sure your device date, time and time zone are set correctly (IST — UTC+5:30 for India). Incorrect device time will cause wrong timestamps on records." },
  // Extended Operations
  { category: "Extended Operations", q: "What's the difference between Job Costing and Invoices?", a: "Invoices bill the customer for the agreed amount — they're about what you charge. Job Costing is internal: it tracks your actual material, labour and overhead costs against a Sales Order so you can see the real gross profit and margin % on that job, regardless of what was invoiced." },
  { category: "Extended Operations", q: "How do I request an AMC service visit?", a: "Go to AMC & Warranty → Service Tickets tab → 'Raise Ticket'. Select the customer, optionally link their active AMC contract, set Type (Warranty/AMC/Adhoc) and Priority, and describe the issue. The ticket then moves OPEN → IN PROGRESS → RESOLVED → CLOSED as it's actioned." },
  { category: "Extended Operations", q: "Do I need a Purchase Order before recording a GRN?", a: "Yes. A Goods Received Note (GRN) is always recorded against an existing Purchase Order that is in SENT or PARTIAL status. Go to Procurement → Purchase Orders → click 'Receive' on the relevant PO to jump straight into a pre-filled GRN form." },
  { category: "Extended Operations", q: "What happens if my saved privilege override doesn't include a brand-new module?", a: "The Privilege Management page shows an amber warning banner listing exactly which new modules a custom-override user is missing, with an 'Add these' button to fix it in one click. This only affects users with a custom override — users on role defaults automatically get access to new modules that their role covers." },
];

// ─── COLORS ───────────────────────────────────────────────────────────────────
const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  indigo:  { bg: "rgba(99,102,241,0.08)",  text: "#6366F1", border: "rgba(99,102,241,0.2)"  },
  blue:    { bg: "rgba(59,130,246,0.08)",  text: "#3B82F6", border: "rgba(59,130,246,0.2)"  },
  emerald: { bg: "rgba(16,185,129,0.08)",  text: "#10B981", border: "rgba(16,185,129,0.2)"  },
  cyan:    { bg: "rgba(6,182,212,0.08)",   text: "#06B6D4", border: "rgba(6,182,212,0.2)"   },
  yellow:  { bg: "rgba(245,158,11,0.08)",  text: "#D97706", border: "rgba(245,158,11,0.2)"  },
  amber:   { bg: "rgba(217,119,6,0.08)",   text: "#B45309", border: "rgba(217,119,6,0.2)"   },
  orange:  { bg: "rgba(249,115,22,0.08)",  text: "#F97316", border: "rgba(249,115,22,0.2)"  },
  red:     { bg: "rgba(239,68,68,0.08)",   text: "#EF4444", border: "rgba(239,68,68,0.2)"   },
  green:   { bg: "rgba(34,197,94,0.08)",   text: "#16A34A", border: "rgba(34,197,94,0.2)"   },
  pink:    { bg: "rgba(236,72,153,0.08)",  text: "#EC4899", border: "rgba(236,72,153,0.2)"  },
  teal:    { bg: "rgba(20,184,166,0.08)",  text: "#14B8A6", border: "rgba(20,184,166,0.2)"  },
  violet:  { bg: "rgba(139,92,246,0.08)",  text: "#8B5CF6", border: "rgba(139,92,246,0.2)"  },
  slate:   { bg: "rgba(100,116,139,0.08)", text: "#64748B", border: "rgba(100,116,139,0.2)" },
};

const FAQ_CATEGORIES = [...new Set(FAQ.map(f => f.category))];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HelpPage() {
  const router = useRouter();
  const [search, setSearch]         = useState("");
  const [openSection, setOpenSection] = useState<string | null>("quickstart");
  const [openFaq, setOpenFaq]         = useState<number | null>(null);
  const [faqCat, setFaqCat]           = useState("All");

  const lc = search.toLowerCase();

  const filteredSections = SECTIONS.filter(s =>
    !lc ||
    s.title.toLowerCase().includes(lc) ||
    s.intro.toLowerCase().includes(lc) ||
    s.steps.some(st => st.step.toLowerCase().includes(lc) || st.desc.toLowerCase().includes(lc)) ||
    (s.tips ?? []).some(t => t.toLowerCase().includes(lc))
  );

  const filteredFaq = FAQ.filter(f => {
    const matchCat = faqCat === "All" || f.category === faqCat;
    const matchSearch = !lc || f.q.toLowerCase().includes(lc) || f.a.toLowerCase().includes(lc);
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <TopBar title="Help & User Manual" subtitle="Support" />

      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6">

        {/* ── HERO ── */}
        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen size={24} />
                <h2 className="text-xl font-bold">ZAG SIGNS ERP — User Manual v2.0</h2>
              </div>
              <p className="text-indigo-100 text-sm mb-4">
                Complete guide for all modules. Search below or browse by module. For urgent help, contact IT Admin.
              </p>
            </div>
            <button
              onClick={() => window.open("/api/manual/pdf", "_blank")}
              className="flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors flex-shrink-0"
            >
              <Download size={15} /> Download PDF Manual
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
            <input
              type="text" placeholder="Search topics, steps, FAQs…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
            />
          </div>
        </div>

        {/* ── WORKFLOW OVERVIEW ── */}
        {!search && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Play size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-gray-900">End-to-End Business Workflow</h3>
            </div>
            <WorkflowDiagram />
            <p className="text-xs text-gray-500 mt-3">
              Every deal starts as a Lead. Use the action buttons on each row to move it forward through the pipeline.
              The final step creates a Tally-ready Tax Invoice automatically.
            </p>
          </div>
        )}

        {/* ── QUICK CARDS ── */}
        {!search && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Quick Start Guide",   icon: <Star size={16} />,         color: "indigo",  target: "quickstart" },
              { label: "Create Quotation",    icon: <FileText size={16} />,      color: "yellow",  target: "quotations" },
              { label: "Export to Tally",     icon: <FileDown size={16} />,      color: "blue",    target: "tally" },
              { label: "View Role Matrix",    icon: <Shield size={16} />,        color: "slate",   target: "role-matrix" },
            ].map(({ label, icon, color, target }) => {
              const c = COLORS[color];
              return (
                <button key={label}
                  onClick={() => {
                    if (target === "role-matrix") document.getElementById("role-matrix")?.scrollIntoView({ behavior: "smooth" });
                    else { setOpenSection(target); document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }); }
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium text-left transition-all hover:scale-[1.02]"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                  {icon}
                  <span className="flex-1 leading-tight">{label}</span>
                  <ArrowRight size={12} className="opacity-60 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {/* ── MODULE SECTIONS ── */}
        <div className="space-y-2">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <HelpCircle size={40} className="mx-auto mb-2 opacity-30" />
              <p>No results for &ldquo;{search}&rdquo;</p>
            </div>
          ) : filteredSections.map(section => {
            const c = COLORS[section.color];
            const isOpen = openSection === section.id || !!search;
            return (
              <div key={section.id} id={section.id} className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${isOpen ? c.border : "var(--card-border)"}`, background: "var(--card-bg)" }}>
                <button className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setOpenSection(isOpen && !search ? null : section.id)}>
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: c.bg, color: c.text }}>
                    {section.icon}
                  </span>
                  <span className="flex-1 font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {section.title}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
                    {section.steps.length} steps
                  </span>
                  {!search && (isOpen
                    ? <ChevronDown size={16} style={{ color: c.text }} />
                    : <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 space-y-4">
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{section.intro}</p>

                    {/* Warning */}
                    {section.warning && (
                      <div className="flex gap-2 p-3 rounded-xl text-sm bg-amber-50 border border-amber-200">
                        <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-amber-800">{section.warning}</span>
                      </div>
                    )}

                    {/* Steps */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.text }}>
                        Step-by-step guide
                      </p>
                      {section.steps.map((s, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: "var(--background)" }}>
                          <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: c.bg, color: c.text }}>
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>{s.step}</p>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                            {s.note && (
                              <div className="mt-2 flex gap-1.5 text-xs" style={{ color: c.text }}>
                                <Info size={12} className="flex-shrink-0 mt-0.5" />
                                <span>{s.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tips */}
                    {section.tips && section.tips.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Pro Tips</p>
                        {section.tips.map((tip, i) => (
                          <div key={i} className="flex gap-2 p-3 rounded-xl text-sm"
                            style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
                            <BadgeCheck size={14} className="flex-shrink-0 mt-0.5 text-indigo-500" />
                            <span style={{ color: "var(--text-secondary)" }}>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── ROLE MATRIX ── */}
        {!search && (
          <div id="role-matrix" className="rounded-2xl overflow-hidden"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: "var(--card-border)" }}>
              <Shield size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Role Permission Matrix</h3>
              <span className="text-xs text-gray-500 ml-auto">Access by role</span>
            </div>
            <div className="p-4">
              <RoleMatrix />
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        <div id="faq-section" className="space-y-4">
          <div className="flex items-center gap-2 pt-2">
            <HelpCircle size={18} className="text-indigo-500" />
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Frequently Asked Questions</h2>
            <span className="text-xs text-gray-500 ml-auto">{filteredFaq.length} questions</span>
          </div>

          {/* Category filter */}
          {!search && (
            <div className="flex gap-2 flex-wrap">
              {["All", ...FAQ_CATEGORIES].map(cat => (
                <button key={cat}
                  onClick={() => setFaqCat(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    faqCat === cat ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filteredFaq.length === 0 ? (
            <p className="text-sm text-center py-6 text-gray-400">No FAQs match &ldquo;{search}&rdquo;</p>
          ) : filteredFaq.map((faq, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--card-border)", background: "var(--card-bg)" }}>
              <button className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium flex-shrink-0 hidden md:block">
                  {faq.category}
                </span>
                <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{faq.q}</span>
                {openFaq === i
                  ? <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
                  : <ChevronRight size={15} style={{ color: "var(--text-muted)" }} />
                }
              </button>
              {(openFaq === i || !!search) && (
                <div className="px-4 pb-4">
                  <p className="text-sm leading-relaxed pl-0 md:pl-24" style={{ color: "var(--text-secondary)" }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── KEYBOARD SHORTCUTS ── */}
        {!search && (
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Keyboard size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Keyboard Shortcuts</h3>
            </div>
            {[
              { keys: "Cmd+K / Ctrl+K", action: "Open global search" },
              { keys: "Escape",          action: "Close any open modal or search" },
              { keys: "Cmd+P",           action: "Print / save PDF (when on quotation or invoice page)" },
              { keys: "Cmd+Shift+R",     action: "Hard refresh (force reload latest data)" },
            ].map(({ keys, action }) => (
              <div key={keys} className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>{action}</span>
                <code className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold"
                  style={{ background: "var(--background)", color: "var(--text-primary)", border: "1px solid var(--card-border)" }}>
                  {keys}
                </code>
              </div>
            ))}
          </div>
        )}

        {/* ── MOBILE INSTALL ── */}
        {!search && (
          <div className="rounded-2xl p-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Install on Mobile</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div>
                <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Android (Chrome)</p>
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Open <strong>bprozagcrm.xyz</strong> in Chrome</li>
                  <li>Tap the 3-dot menu <strong>⋮</strong> top-right</li>
                  <li>Tap <strong>&ldquo;Add to Home Screen&rdquo;</strong></li>
                  <li>Tap <strong>&ldquo;Add&rdquo;</strong> to confirm</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>iPhone / iPad (Safari)</p>
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Open <strong>bprozagcrm.xyz</strong> in Safari</li>
                  <li>Tap the <strong>Share</strong> button (box with ↑ arrow)</li>
                  <li>Scroll to <strong>&ldquo;Add to Home Screen&rdquo;</strong></li>
                  <li>Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right</li>
                </ol>
              </div>
            </div>
            <div className="mt-4 flex gap-2 p-3 rounded-xl text-xs"
              style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
              <Info size={13} className="flex-shrink-0 mt-0.5 text-indigo-500" />
              <span style={{ color: "var(--text-secondary)" }}>
                After installation, the app opens full-screen without browser bars, works faster on repeat visits, and
                is indistinguishable from a native app.
              </span>
            </div>
          </div>
        )}

        {/* ── DOWNLOAD MANUAL BANNER ── */}
        {!search && (
          <div className="rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <div className="text-white">
              <p className="font-bold text-sm">Download the Complete User Manual</p>
              <p className="text-indigo-200 text-xs mt-0.5">
                VER 2.0 · 07/07/2026 — adds KPI Monitor, Reports & MIS, GST Tax Report, AI Insights, Documents, Collections, Designer My Work, Privilege Management, Database Studio, Audit Logs, Tender, Job Costing, Procurement, Fleet, Projects, Installation, AMC, Digital Approvals, All Modules launcher and Customer Portal. Complete guide for all 42 modules with step-by-step guidance, FAQ and role matrix.
              </p>
            </div>
            <button
              onClick={() => window.open("/api/manual/pdf", "_blank")}
              className="flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors flex-shrink-0">
              <Download size={15} /> Download PDF
            </button>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="flex flex-col items-center gap-2 pb-4">
          <PoweredByBpro variant="light" logoHeight={28} />
          <div className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            ZAG SIGNS ERP · VER 2.0 · 07/07/2026 · bprozagcrm.xyz · For technical support contact IT Admin
          </div>
        </div>
      </div>
    </div>
  );
}
