"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import {
  BookOpen, Search, ChevronDown, ChevronRight,
  LayoutDashboard, Users, UserCheck, FileText, ShoppingCart,
  Wrench, Package, Wallet, AlertCircle, UserCircle,
  MapPin, ClipboardList, Shield, Smartphone, Keyboard,
  HelpCircle, Star, ArrowRight, CheckCircle, Info,
  TrendingUp, BarChart3, FolderOpen, Target,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Step { step: string; desc: string; }
interface Section { id: string; icon: React.ReactNode; title: string; color: string; intro: string; steps: Step[]; tips?: string[]; }
interface FaqItem { q: string; a: string; }

// ─── Section data ───────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: "quickstart", icon: <Star size={18} />, title: "Quick Start", color: "indigo",
    intro: "Get up and running in 3 steps. ZAG SIGNS ERP runs entirely in the browser — no installation needed on desktop.",
    steps: [
      { step: "Login", desc: "Go to bprozagcrm.xyz and sign in with your email and password. Use md@zagsigns.com / MD@2026 for first login." },
      { step: "Explore the Dashboard", desc: "The Dashboard shows revenue, active orders, lead pipeline and pending tasks at a glance. All numbers are live from the database." },
      { step: "Navigate modules", desc: "Use the sidebar on the left (desktop) or the bottom nav bar (mobile). Tap the hamburger ☰ icon to open the full menu on any screen size." },
    ],
    tips: [
      "Press Cmd+K (Mac) or Ctrl+K (Windows) to open the global search — find any lead, customer, order or employee instantly.",
      "Click the 🌙 moon icon in the top bar to switch to dark mode. Your preference is saved.",
      "Install the app on your phone — open bprozagcrm.xyz in Chrome, tap 'Add to Home Screen'. It works like a native app.",
    ],
  },
  {
    id: "dashboard", icon: <LayoutDashboard size={18} />, title: "Dashboard & KPI", color: "blue",
    intro: "The Dashboard is your command centre. It shows real-time KPIs, charts and pending actions.",
    steps: [
      { step: "Dashboard (/dashboard)", desc: "Shows 6 metric cards: Total Revenue, Active Orders, Leads, Customers, Overdue Payments and Open Complaints. Charts below show monthly revenue and lead funnel." },
      { step: "KPI Dashboard (/kpi)", desc: "Detailed performance analytics with branch-wise breakdown, collection rates, sales targets vs achievement, and production efficiency." },
      { step: "Refresh data", desc: "All data is live. Refresh the page at any time for the latest numbers. No manual sync needed." },
    ],
    tips: ["MD and AVP see company-wide data. Branch roles see only their branch data."],
  },
  {
    id: "crm", icon: <Users size={18} />, title: "Leads & CRM", color: "emerald",
    intro: "Leads are potential customers. Track every prospect from first contact to deal close.",
    steps: [
      { step: "Add a new lead", desc: "Go to Leads & CRM → click 'New Lead'. Fill in: Name, Company, Phone, Branch, Source (Cold Call / Referral / Walk-in etc.), and Estimated Value. Assign to a Sales Executive." },
      { step: "Update lead status", desc: "Click any lead row → 'Edit'. Move status through: New → Contacted → Qualified → Proposal → Negotiation → Won / Lost. Set follow-up date to get reminders." },
      { step: "Convert lead to customer", desc: "When status is WON → go to Customers → 'New Customer'. Fill in company details. The customer is now linked to the won deal for order tracking." },
      { step: "Opportunities", desc: "Go to Opportunities (/opportunities) to track specific deal stages with probability and expected close date. Each opportunity links back to a lead." },
    ],
    tips: [
      "Leads with a follow-up date today appear highlighted in the list.",
      "Filter leads by status, branch or assigned executive using the filter bar.",
      "Export leads to Excel using the Export button.",
    ],
  },
  {
    id: "customers", icon: <UserCheck size={18} />, title: "Customers", color: "cyan",
    intro: "Customer master data with full transaction history.",
    steps: [
      { step: "Add a customer", desc: "Go to Customers → 'New Customer'. Enter: Name, Company, Phone, Branch, GST No, Credit Limit. Customer No is auto-generated (CUST-001, CUST-002…)." },
      { step: "View customer history", desc: "Click any customer to see all their Quotations, Sales Orders, Invoices, Complaints and Collections on one screen." },
      { step: "Credit limit management", desc: "Set credit limit when creating the customer. Outstanding balance updates automatically as invoices and collections are recorded." },
    ],
    tips: ["You can search customers by name, company or customer number using the search bar."],
  },
  {
    id: "quotations", icon: <FileText size={18} />, title: "Quotations", color: "yellow",
    intro: "Create professional quotations, send to customers and convert to sales orders.",
    steps: [
      { step: "Create a quotation", desc: "Go to Quotations → 'New Quotation'. Select a Customer (or Lead). Add line items: Description, Quantity, Unit, Unit Price. Tax % and Discount are optional. Quotation No is auto-generated (QT-2026-001)." },
      { step: "Send quotation", desc: "Change status to 'SENT'. Use the Print/Download button to generate a PDF version to email or WhatsApp to the customer." },
      { step: "Approve / Reject", desc: "When customer confirms: change status to 'APPROVED'. When rejected: set to 'REJECTED' with a note." },
      { step: "Convert to Sales Order", desc: "On an Approved quotation, click 'Create Order'. This auto-fills the Sales Order with all quotation line items and links them together." },
    ],
    tips: [
      "Valid Until date automatically marks the quotation as EXPIRED if the customer doesn't respond.",
      "Line item totals, tax and discount are all calculated automatically.",
    ],
  },
  {
    id: "orders", icon: <ShoppingCart size={18} />, title: "Sales Orders", color: "orange",
    intro: "Track every confirmed order from production to delivery and payment.",
    steps: [
      { step: "Create a sales order", desc: "Sales Orders → 'New Order'. Link to a Customer and optionally a Quotation. Set Delivery Date and Total Amount. Order No is auto-generated (SO-2026-001)." },
      { step: "Track order status", desc: "Move orders through: Draft → Confirmed → In Production → Ready → Installed → Invoiced → Collected. Update status as work progresses." },
      { step: "Create work order from sales order", desc: "When an order is Confirmed, go to Work Orders → 'New Work Order' and link to this Sales Order. Production team tracks progress there." },
      { step: "Create invoice", desc: "When order is Installed, go to Accounts & Billing → 'New Invoice', link to this Sales Order. Invoice is sent to the customer for payment." },
    ],
    tips: ["Paid Amount updates automatically as Collections are recorded against this order."],
  },
  {
    id: "operations", icon: <Wrench size={18} />, title: "Work Orders & Production", color: "red",
    intro: "Track production jobs from creation to completion.",
    steps: [
      { step: "Create a work order", desc: "Work Orders → 'New Work Order'. Link to a Sales Order. Set description, start date, due date and priority (High/Medium/Low)." },
      { step: "Update progress", desc: "Change status: Pending → In Progress → Completed. Add notes at each stage for production team communication." },
      { step: "Production logs", desc: "Go to Production (/production) to log daily output: quantity produced, downtime hours, downtime reason, dispatches made." },
      { step: "Inventory", desc: "Go to Inventory (/inventory) to manage materials. Record stock-in when materials arrive, stock-out when consumed. Low stock alerts show automatically." },
    ],
    tips: ["Work orders link to sales orders so the sales team can see real-time production status."],
  },
  {
    id: "finance", icon: <Wallet size={18} />, title: "Accounts & Collections", color: "green",
    intro: "Manage invoices and record all payments received.",
    steps: [
      { step: "Create an invoice", desc: "Accounts & Billing → 'New Invoice'. Link to a Sales Order. Set Invoice Date, Due Date and Amount. Invoice No is auto-generated (INV-001)." },
      { step: "Invoice status", desc: "Invoice automatically moves: PENDING → PARTIAL → PAID as collections are recorded. OVERDUE when the due date passes without full payment." },
      { step: "Record a collection (payment)", desc: "Collections → 'Record Payment'. Select Customer, link the Invoice and Sales Order, enter Amount, Payment Mode (Cash/Cheque/NEFT/UPI/Bank Transfer) and Reference No." },
      { step: "Mark invoice as paid manually", desc: "In Accounts, click any invoice row → 'Mark Paid'. Use this for full payment received outside the Collections module." },
    ],
    tips: [
      "Filter by month in Collections to see total cash received and mode-wise breakdown.",
      "Outstanding balance on the Customer record updates automatically when collections are recorded.",
    ],
  },
  {
    id: "hr", icon: <UserCircle size={18} />, title: "HR & Attendance", color: "pink",
    intro: "Manage employees, attendance and leave requests.",
    steps: [
      { step: "Add an employee", desc: "HR & Attendance → Employees tab → 'Add Employee'. Enter: Name, Designation, Department, Branch, Phone, Date of Joining and Salary." },
      { step: "Mark attendance", desc: "Go to Attendance tab → 'Mark Attendance'. Select Employee, Date and Status (Present / Absent / Half Day / On Leave / Holiday). Add check-in/check-out times." },
      { step: "Leave requests", desc: "Employees submit leave via Leave Requests tab → 'New Request'. Select leave type, from/to dates and reason. HR/MD can Approve or Reject." },
      { step: "Approve/Reject leave", desc: "In Leave Requests tab, PENDING requests show Approve and Reject buttons. Click to update status. Employee sees the updated status instantly." },
    ],
    tips: ["Attendance can only be marked once per employee per day (the system prevents duplicates and allows updates)."],
  },
  {
    id: "field", icon: <MapPin size={18} />, title: "Field Visits", color: "teal",
    intro: "Log every customer visit, site survey or service call for management visibility.",
    steps: [
      { step: "Log a field visit", desc: "Field Visits → 'New Visit'. Select: Visit Type (Sales Call / Site Survey / Installation / Service / Collection / Follow-up), Outcome, Customer Name, Location, Start and End Time." },
      { step: "GPS tagging", desc: "Enable 'Geo-tagged' toggle to record latitude/longitude. On mobile, the browser will ask permission to access your location." },
      { step: "Outcome and next action", desc: "Set Outcome (Positive / Order Expected / Follow-Up Needed / Not Interested / Completed) and fill 'Next Action' to auto-create a follow-up task." },
    ],
    tips: ["Field visits appear in the Daily Activity Report (DAR) automatically."],
  },
  {
    id: "reports", icon: <ClipboardList size={18} />, title: "Team Reports", color: "violet",
    intro: "File daily, weekly and monthly activity reports. MD can approve them.",
    steps: [
      { step: "Daily Activity Report (DAR)", desc: "Team Reports → DAR tab → 'New DAR'. Fill in: customer visits count, calls made, orders booked, collections amount, travel details, production output." },
      { step: "Weekly Work Report (WWR)", desc: "WWR tab → 'New WWR'. Select the week period, enter weekly target vs achievement, challenges faced and action plan. Submit for manager approval." },
      { step: "Monthly Work Report (MWR)", desc: "MWR tab → 'New MWR'. Enter monthly KPIs: sales target/achievement, conversion %, collection %, production efficiency, rejection count." },
      { step: "Approval workflow", desc: "DARs/WWRs/MWRs flow through: Submitted → Manager Approved → AVP Approved → MD Approved. Each approver sees pending items on their dashboard." },
    ],
    tips: ["Managers can see all team members' reports filtered by date and branch."],
  },
  {
    id: "admin", icon: <Shield size={18} />, title: "Admin & Settings", color: "slate",
    intro: "User management, role access, and system audit. Available to MD and IT Admin only.",
    steps: [
      { step: "Add a new user", desc: "Admin → User Management → 'Add User'. Enter name, email, role, branch and phone. The user will receive an approval email to set their password. Status starts as PENDING." },
      { step: "Approve / deactivate users", desc: "Click any user row → Edit. Change Status to ACTIVE to grant access or INACTIVE to revoke. You can also update role and branch at any time." },
      { step: "Roles and access", desc: "MD = full access. AVP = full except Admin. Business Manager = branch-level full. Sales Executive = CRM and sales only. See the full role matrix in the FAQ below." },
      { step: "Audit Trail", desc: "Admin → Audit Trail shows every CREATE / UPDATE / DELETE action in the system, who did it, when, and what changed. Filter by table name or user." },
    ],
    tips: [
      "Never share your password. Contact IT Admin for a password reset.",
      "All actions in the system are logged in the Audit Trail and cannot be deleted.",
    ],
  },
];

// ─── FAQ data ────────────────────────────────────────────────────────────────
const FAQ: FaqItem[] = [
  { q: "How do I reset my password?", a: "Contact your IT Admin. Go to Admin → User Management → find the user → Edit → Reset Password. The user will receive an email with a reset link." },
  { q: "How do I install the app on my phone?", a: "Open bprozagcrm.xyz in Chrome (Android) or Safari (iPhone). Android: tap the 3-dot menu → 'Add to Home Screen'. iPhone: tap the Share button → 'Add to Home Screen'. The app icon appears on your home screen and runs in full screen." },
  { q: "Can I use the app offline?", a: "You can browse already-loaded pages offline. Actions that read or write data (adding leads, recording payments etc.) require an active internet connection." },
  { q: "How do I convert a lead to a customer?", a: "Mark the lead status as WON. Then go to Customers → New Customer and enter the company details. There is no automatic conversion — this is intentional so you control when someone becomes an active customer." },
  { q: "How do I create a quotation for a walk-in customer?", a: "Go to Quotations → New Quotation. In the Customer field, you can either select an existing customer or leave it blank and type the customer name manually in the Notes field. Create the customer record after the meeting." },
  { q: "What are the different user roles and what can they access?", a: "MD: everything. AVP: everything except Admin. Business Manager: all modules for their branch. Sales Executive: Leads, Customers, Quotations, Sales Orders, Field Visits, Tasks. CRE: Leads, Customers, Complaints, Tasks, Field Visits. Production: Work Orders, Production, Inventory, Tasks. Accounts: Customers, Accounts, Collections, Reports, Tasks. HR: HR & Attendance, Tasks. IT Admin: everything including Admin." },
  { q: "How do I export data to Excel?", a: "Most list pages have an 'Export' or 'Download' button in the top-right area. Click it to download the current filtered view as an Excel (.xlsx) file." },
  { q: "Why am I seeing 'Unauthorized' or 'Forbidden'?", a: "Your role does not have access to that module. Ask your IT Admin to check your user role in Admin → User Management. If the role is correct, the module may be restricted for your role by design." },
  { q: "How do I record a partial payment?", a: "Go to Collections → Record Payment. Enter the amount actually received (even if it is less than the invoice total). The invoice status will automatically update to PARTIAL. Record another collection when the balance is paid — the invoice will move to PAID." },
  { q: "How do I search for anything quickly?", a: "Press Cmd+K (Mac) or Ctrl+K (Windows/Android) to open the global search overlay. Type any name, number or keyword. Results appear from Leads, Customers, Orders, Quotations and Employees simultaneously." },
  { q: "How do I view all activity by a specific employee?", a: "Admin → Audit Trail → filter by user email. You can also go to Team Reports and filter by employee name to see their DARs, WWRs and MWRs." },
  { q: "Can multiple users be logged in at the same time?", a: "Yes. Each user has their own session. All changes are saved to the database in real time and visible to all logged-in users immediately." },
  { q: "How do I change my branch?", a: "Your branch is set by the IT Admin when your account is created. Contact IT Admin to update it via Admin → User Management." },
  { q: "Why is the date on my report wrong?", a: "The app uses your device's local time. Make sure your phone/computer date and time are set correctly and synced to your time zone (IST for India)." },
];

// ─── Colour map ──────────────────────────────────────────────────────────────
const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  indigo:  { bg: "rgba(99,102,241,0.1)",  text: "#6366F1", border: "rgba(99,102,241,0.25)" },
  blue:    { bg: "rgba(59,130,246,0.1)",  text: "#3B82F6", border: "rgba(59,130,246,0.25)" },
  emerald: { bg: "rgba(16,185,129,0.1)",  text: "#10B981", border: "rgba(16,185,129,0.25)" },
  cyan:    { bg: "rgba(6,182,212,0.1)",   text: "#06B6D4", border: "rgba(6,182,212,0.25)" },
  yellow:  { bg: "rgba(245,158,11,0.1)",  text: "#F59E0B", border: "rgba(245,158,11,0.25)" },
  orange:  { bg: "rgba(249,115,22,0.1)",  text: "#F97316", border: "rgba(249,115,22,0.25)" },
  red:     { bg: "rgba(239,68,68,0.1)",   text: "#EF4444", border: "rgba(239,68,68,0.25)" },
  green:   { bg: "rgba(16,185,129,0.1)",  text: "#10B981", border: "rgba(16,185,129,0.25)" },
  pink:    { bg: "rgba(236,72,153,0.1)",  text: "#EC4899", border: "rgba(236,72,153,0.25)" },
  teal:    { bg: "rgba(20,184,166,0.1)",  text: "#14B8A6", border: "rgba(20,184,166,0.25)" },
  violet:  { bg: "rgba(139,92,246,0.1)",  text: "#8B5CF6", border: "rgba(139,92,246,0.25)" },
  slate:   { bg: "rgba(100,116,139,0.1)", text: "#64748B", border: "rgba(100,116,139,0.25)" },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("quickstart");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const lc = search.toLowerCase();
  const filteredSections = SECTIONS.filter(s =>
    !lc ||
    s.title.toLowerCase().includes(lc) ||
    s.steps.some(st => st.step.toLowerCase().includes(lc) || st.desc.toLowerCase().includes(lc)) ||
    (s.tips ?? []).some(t => t.toLowerCase().includes(lc))
  );
  const filteredFaq = FAQ.filter(f =>
    !lc || f.q.toLowerCase().includes(lc) || f.a.toLowerCase().includes(lc)
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <TopBar title="Help & User Manual" subtitle="Support" />

      <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">

        {/* Hero */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={24} />
            <h2 className="text-xl font-bold">ZAG SIGNS ERP — User Manual</h2>
          </div>
          <p className="text-indigo-100 text-sm mb-4">
            Everything you need to use the system effectively. Search below or browse by module.
          </p>
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
            <input
              type="text"
              placeholder="Search topics, steps, FAQs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-900 placeholder-indigo-300"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
            />
          </div>
        </div>

        {/* Quick cards */}
        {!search && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Install App", icon: <Smartphone size={18} />, color: "indigo", target: "quickstart" },
              { label: "Add Lead", icon: <Users size={18} />, color: "emerald", target: "crm" },
              { label: "Record Payment", icon: <Wallet size={18} />, color: "green", target: "finance" },
              { label: "User Roles FAQ", icon: <HelpCircle size={18} />, color: "slate", target: "faq" },
            ].map(({ label, icon, color, target }) => {
              const c = COLORS[color];
              return (
                <button
                  key={label}
                  onClick={() => {
                    if (target === "faq") document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" });
                    else setOpenSection(target);
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] text-left"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
                >
                  {icon}
                  <span>{label}</span>
                  <ArrowRight size={13} className="ml-auto opacity-60" />
                </button>
              );
            })}
          </div>
        )}

        {/* Module sections */}
        <div className="space-y-2">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
              <HelpCircle size={40} className="mx-auto mb-2 opacity-30" />
              <p>No results for &ldquo;{search}&rdquo;</p>
            </div>
          ) : filteredSections.map(section => {
            const c = COLORS[section.color];
            const isOpen = openSection === section.id || !!search;
            return (
              <div
                key={section.id}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${isOpen ? c.border : "var(--card-border)"}`, background: "var(--card-bg)" }}
              >
                <button
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setOpenSection(isOpen && !search ? null : section.id)}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {section.icon}
                  </span>
                  <span className="flex-1 font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {section.title}
                  </span>
                  {!search && (
                    isOpen
                      ? <ChevronDown size={16} style={{ color: c.text }} />
                      : <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-4">
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{section.intro}</p>

                    {/* Screenshot placeholder */}
                    <div
                      className="rounded-xl flex items-center justify-center py-8 text-xs font-medium"
                      style={{ background: c.bg, border: `1px dashed ${c.border}`, color: c.text }}
                    >
                      <span className="opacity-60">[ Screenshot: {section.title} screen ]</span>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                      {section.steps.map((s, i) => (
                        <div key={i} className="flex gap-3">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                            style={{ background: c.bg, color: c.text }}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{s.step}</p>
                            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tips */}
                    {section.tips && section.tips.length > 0 && (
                      <div className="space-y-2">
                        {section.tips.map((tip, i) => (
                          <div
                            key={i}
                            className="flex gap-2 p-3 rounded-xl text-sm"
                            style={{ background: "rgba(99,102,241,0.08)", color: "var(--text-secondary)" }}
                          >
                            <Info size={14} className="flex-shrink-0 mt-0.5 text-indigo-500" />
                            <span>{tip}</span>
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

        {/* FAQ section */}
        <div id="faq-section" className="space-y-3">
          <div className="flex items-center gap-2 pt-2">
            <HelpCircle size={18} className="text-indigo-500" />
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              Frequently Asked Questions
            </h2>
          </div>

          {filteredFaq.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
              No FAQs match &ldquo;{search}&rdquo;
            </p>
          ) : filteredFaq.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--card-border)", background: "var(--card-bg)" }}
            >
              <button
                className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <CheckCircle size={15} className="flex-shrink-0 text-indigo-500" />
                <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{faq.q}</span>
                {openFaq === i
                  ? <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
                  : <ChevronRight size={15} style={{ color: "var(--text-muted)" }} />
                }
              </button>
              {(openFaq === i || !!search) && (
                <div className="px-4 pb-4">
                  <p className="text-sm pl-6" style={{ color: "var(--text-secondary)" }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Keyboard shortcuts */}
        {!search && (
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Keyboard size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Keyboard Shortcuts</h3>
            </div>
            {[
              { keys: "Cmd+K / Ctrl+K", action: "Open global search" },
              { keys: "Esc",            action: "Close any open modal or search" },
              { keys: "Cmd+P",          action: "Print quotation (when on quotation page)" },
            ].map(({ keys, action }) => (
              <div key={keys} className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>{action}</span>
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold"
                  style={{ background: "var(--background)", color: "var(--text-primary)", border: "1px solid var(--card-border)" }}
                >
                  {keys}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Mobile install guide */}
        {!search && (
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Install on Mobile (PWA)</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div>
                <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Android (Chrome)</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Open bprozagcrm.xyz in Chrome</li>
                  <li>Tap the 3-dot menu (⋮) top-right</li>
                  <li>Tap &ldquo;Add to Home Screen&rdquo;</li>
                  <li>Tap &ldquo;Add&rdquo; to confirm</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>iPhone (Safari)</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Open bprozagcrm.xyz in Safari</li>
                  <li>Tap the Share button (box with arrow)</li>
                  <li>Scroll down to &ldquo;Add to Home Screen&rdquo;</li>
                  <li>Tap &ldquo;Add&rdquo; top-right</li>
                </ol>
              </div>
            </div>
            <div
              className="mt-3 p-3 rounded-xl text-xs"
              style={{ background: "rgba(99,102,241,0.08)", color: "var(--text-secondary)" }}
            >
              <Info size={13} className="inline mr-1 text-indigo-500" />
              Once installed, the app opens in full-screen mode (no browser bar), works like a native app, and loads faster on repeat visits.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs pb-4" style={{ color: "var(--text-muted)" }}>
          ZAG SIGNS ERP · Version 1.0 · For support contact IT Admin
        </div>
      </div>
    </div>
  );
}
