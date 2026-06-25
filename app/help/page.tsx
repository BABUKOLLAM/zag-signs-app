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
function RoleMatrix() {
  const roles = ["MD", "AVP", "BM", "Sales Exec", "CRE", "Production", "Accounts", "HR", "IT Admin"];
  const modules = [
    { name: "Dashboard",      access: [1,1,1,1,1,1,1,1,1] },
    { name: "Leads & CRM",    access: [1,1,1,1,1,0,0,0,1] },
    { name: "Opportunities",  access: [1,1,1,1,0,0,0,0,1] },
    { name: "Customers",      access: [1,1,1,1,1,0,1,0,1] },
    { name: "Quotations",     access: [1,1,1,1,0,0,0,0,1] },
    { name: "Sales Orders",   access: [1,1,1,1,0,1,1,0,1] },
    { name: "Work Orders",    access: [1,1,1,0,0,1,0,0,1] },
    { name: "Production",     access: [1,1,0,0,0,1,0,0,1] },
    { name: "Inventory",      access: [1,1,0,0,0,1,0,0,1] },
    { name: "Invoices",       access: [1,1,1,0,0,0,1,0,1] },
    { name: "Collections",    access: [1,1,1,0,0,0,1,0,1] },
    { name: "HR & Attendance",access: [1,1,0,0,0,0,0,1,1] },
    { name: "Field Visits",   access: [1,1,1,1,1,0,0,0,1] },
    { name: "Reports",        access: [1,1,1,1,1,1,1,1,1] },
    { name: "Admin",          access: [1,0,0,0,0,0,0,0,1] },
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
      <p className="text-xs text-gray-500 p-2">BM = Business Manager</p>
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
    id: "operations", icon: <Wrench size={18} />, title: "Work Orders & Production", color: "red",
    intro: "Production module for managing job execution, daily output logging and material usage.",
    steps: [
      { step: "Create a work order", desc: "Work Orders → 'New Work Order'. Link to a Sales Order. Enter: Description, Assigned Team, Start Date, Due Date, Priority (High / Medium / Low)." },
      { step: "Update progress", desc: "Change status through: Pending → In Progress → Completed. Add progress notes that are visible to the linked sales executive." },
      { step: "Log daily production", desc: "Production (/production) → 'New Log'. Select Work Order, enter: Units Produced, Downtime Hours, Downtime Reason, Units Dispatched." },
      { step: "Inventory", desc: "Inventory → 'Record Movement' to log materials in or out. Stock levels update instantly. Low-stock items are highlighted in red." },
    ],
    tips: ["Low stock alerts appear in the Inventory module when a material falls below its minimum quantity threshold."],
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
    id: "reports", icon: <ClipboardList size={18} />, title: "Team Reports", color: "violet",
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
    id: "admin", icon: <Shield size={18} />, title: "Admin & Settings", color: "slate",
    intro: "User management, role and branch assignment, company settings and audit trail. Available to MD and IT Admin only.",
    steps: [
      { step: "Add a new user", desc: "Admin → User Management → 'Add User'. Enter: Full Name, Email, Role, Branch, Phone. The user receives a Welcome Email with a temporary password. Status starts as PENDING until approved." },
      { step: "Approve a new user", desc: "In User Management, find the PENDING user → click the Approve button. Status changes to ACTIVE. The user can now log in." },
      { step: "Change user role or branch", desc: "Click any user row → Edit. Update Role, Branch or Status. Click Save. Changes take effect on the user's next login." },
      { step: "Company Settings", desc: "Admin → Company Settings. Set your company name, address, GSTIN, bank details, logo URL and UPI QR code URL. These appear on all printed quotations and invoices." },
      { step: "Audit Trail", desc: "Admin → Audit Trail shows every CREATE / UPDATE / DELETE action: who did it, on which record, and what values changed. Filter by table, action type or user." },
    ],
    tips: [
      "All audit log entries are permanent — they cannot be edited or deleted, even by the MD.",
      "If a user forgets their password, go to User Management → find the user → Reset Password. A new password email is sent.",
    ],
    warning: "Never share your login credentials. If you suspect your account has been accessed without your permission, contact IT Admin immediately to deactivate and reset.",
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
  // Technical
  { category: "Technical", q: "The page is not loading or showing an error. What do I do?", a: "1. Hard-refresh: press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows). 2. Clear browser cache. 3. Try an incognito/private window. 4. Check your internet connection. 5. If the problem persists, contact IT Admin with a screenshot of the error." },
  { category: "Technical", q: "Can multiple users be logged in at the same time?", a: "Yes. Each user has their own secure session. All changes are written to the database in real time and visible to all logged-in users without refreshing the page." },
  { category: "Technical", q: "My data shows the wrong time or date. Why?", a: "The app uses your device's local time. Make sure your device date, time and time zone are set correctly (IST — UTC+5:30 for India). Incorrect device time will cause wrong timestamps on records." },
];

// ─── COLORS ───────────────────────────────────────────────────────────────────
const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  indigo:  { bg: "rgba(99,102,241,0.08)",  text: "#6366F1", border: "rgba(99,102,241,0.2)"  },
  blue:    { bg: "rgba(59,130,246,0.08)",  text: "#3B82F6", border: "rgba(59,130,246,0.2)"  },
  emerald: { bg: "rgba(16,185,129,0.08)",  text: "#10B981", border: "rgba(16,185,129,0.2)"  },
  cyan:    { bg: "rgba(6,182,212,0.08)",   text: "#06B6D4", border: "rgba(6,182,212,0.2)"   },
  yellow:  { bg: "rgba(245,158,11,0.08)",  text: "#D97706", border: "rgba(245,158,11,0.2)"  },
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
                <h2 className="text-xl font-bold">ZAG SIGNS ERP — User Manual v1.3</h2>
              </div>
              <p className="text-indigo-100 text-sm mb-4">
                Complete guide for all modules. Search below or browse by module. For urgent help, contact IT Admin.
              </p>
            </div>
            <button
              onClick={() => router.push("/help/manual")}
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
                VER 1.3 · 25/06/2026 — includes FJP, Expense Reports & 3-Tier Approvals. Printable PDF with
                logo, step-by-step guidance, screen illustrations, FAQ and role guide.
              </p>
            </div>
            <button
              onClick={() => router.push("/manual-print")}
              className="flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors flex-shrink-0">
              <Printer size={15} /> Download / Save as PDF
            </button>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="flex flex-col items-center gap-2 pb-4">
          <PoweredByBpro variant="light" logoHeight={28} />
          <div className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            ZAG SIGNS ERP · VER 1.3 · 25/06/2026 · bprozagcrm.xyz · For technical support contact IT Admin
          </div>
        </div>
      </div>
    </div>
  );
}
