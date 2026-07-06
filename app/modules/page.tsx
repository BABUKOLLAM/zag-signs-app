"use client";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { useSession } from "next-auth/react";
import { useApi } from "@/lib/use-api";
import {
  LayoutDashboard, Target, Users, TrendingUp, Trophy, UserCheck,
  FileText, ShoppingCart, Ticket, Palette, Wrench, Package,
  ClipboardCheck, FolderKanban, ShoppingBag, Truck, Receipt,
  Wallet, DollarSign, MapPin, CheckSquare, AlertCircle,
  UserCircle, ShieldCheck, ClipboardList, BarChart3, ScrollText,
  Sparkles, FolderOpen, Settings, Shield, Database, BookOpen,
  Building2, Hammer, GitCompare,
} from "lucide-react";

const SECTIONS = [
  {
    label: "Overview",
    color: "from-indigo-500 to-violet-600",
    modules: [
      { href: "/dashboard",   label: "Dashboard",       sub: "Live KPIs & charts",        icon: LayoutDashboard, grad: "from-indigo-500 to-indigo-700" },
      { href: "/kpi",         label: "KPI Dashboard",   sub: "Targets & scorecards",      icon: Target,          grad: "from-violet-500 to-violet-700" },
    ],
  },
  {
    label: "Sales & CRM",
    color: "from-blue-500 to-cyan-600",
    modules: [
      { href: "/leads",         label: "Leads & CRM",       sub: "Pipeline management",    icon: Users,        grad: "from-blue-500 to-blue-700" },
      { href: "/opportunities", label: "Opportunities",      sub: "Deal tracking",          icon: TrendingUp,   grad: "from-cyan-500 to-cyan-700" },
      { href: "/tender",        label: "Tender Management",  sub: "Bids & win rate",        icon: Trophy,       grad: "from-amber-500 to-amber-700" },
      { href: "/customers",     label: "Customers",          sub: "Client database",        icon: UserCheck,    grad: "from-emerald-500 to-emerald-700" },
      { href: "/quotations",    label: "Quotations",         sub: "Proposals & estimates",  icon: FileText,     grad: "from-slate-500 to-slate-700" },
      { href: "/sales-orders",  label: "Sales Orders",       sub: "Confirmed orders",       icon: ShoppingCart, grad: "from-indigo-500 to-purple-600" },
    ],
  },
  {
    label: "Operations",
    color: "from-orange-500 to-red-600",
    modules: [
      { href: "/work-order-tickets", label: "Work Order Tickets", sub: "Front-office tickets",    icon: Ticket,         grad: "from-orange-500 to-orange-700" },
      { href: "/my-work",            label: "My Work",            sub: "Designer queue",          icon: Palette,        grad: "from-pink-500 to-pink-700" },
      { href: "/work-orders",        label: "Work Orders",        sub: "Production jobs",         icon: Wrench,         grad: "from-slate-500 to-slate-700" },
      { href: "/production",         label: "Production",         sub: "Schedule & output",       icon: Package,        grad: "from-blue-500 to-blue-700" },
      { href: "/inventory",          label: "Inventory",          sub: "Stock & materials",       icon: Package,        grad: "from-emerald-500 to-teal-700" },
      { href: "/installation",        label: "Installation",       sub: "Dispatch to delivery",    icon: Hammer,         grad: "from-orange-500 to-red-600" },
      { href: "/digital-approvals",  label: "Digital Approvals",  sub: "Artwork sign-offs",       icon: ClipboardCheck, grad: "from-violet-500 to-violet-700" },
      { href: "/projects",           label: "Projects",           sub: "Milestones & tracking",   icon: FolderKanban,   grad: "from-indigo-500 to-indigo-700" },
    ],
  },
  {
    label: "Procurement & Fleet",
    color: "from-amber-500 to-orange-600",
    modules: [
      { href: "/procurement", label: "Procurement",      sub: "Vendors / POs / GRN",   icon: ShoppingBag, grad: "from-amber-500 to-amber-700" },
      { href: "/fleet",       label: "Fleet Management", sub: "Vehicles, trips, fuel",  icon: Truck,       grad: "from-sky-500 to-sky-700" },
    ],
  },
  {
    label: "Finance",
    color: "from-emerald-500 to-green-700",
    modules: [
      { href: "/invoices",     label: "Invoices",         sub: "Billing & GST",         icon: Receipt,   grad: "from-emerald-500 to-emerald-700" },
      { href: "/accounts",     label: "Accounts",         sub: "P&L & ledger",          icon: Wallet,    grad: "from-indigo-500 to-indigo-700" },
      { href: "/collections",  label: "Collections",      sub: "Receipts & outstanding", icon: Wallet,    grad: "from-teal-500 to-teal-700" },
      { href: "/job-costing",  label: "Job Costing",      sub: "Cost vs margin",         icon: DollarSign, grad: "from-amber-500 to-amber-600" },
    ],
  },
  {
    label: "Field Sales",
    color: "from-rose-500 to-pink-600",
    modules: [
      { href: "/sales/fjp",       label: "Journey Plan",      sub: "FJP scheduling",       icon: MapPin,      grad: "from-rose-500 to-rose-700" },
      { href: "/sales/expenses",  label: "Expense Reports",   sub: "Claims & approval",    icon: Receipt,     grad: "from-orange-500 to-orange-700" },
      { href: "/sales/approvals", label: "Approvals",         sub: "3-tier chain",         icon: CheckSquare, grad: "from-violet-500 to-violet-700" },
    ],
  },
  {
    label: "People & Field",
    color: "from-teal-500 to-cyan-600",
    modules: [
      { href: "/complaints",   label: "Complaints",       sub: "Log & resolve",          icon: AlertCircle, grad: "from-red-500 to-red-700" },
      { href: "/tasks",        label: "Tasks",            sub: "To-dos & reminders",     icon: CheckSquare, grad: "from-blue-500 to-blue-700" },
      { href: "/hr",           label: "HR & Attendance",  sub: "GPS check-in/out",       icon: UserCircle,  grad: "from-teal-500 to-teal-700" },
      { href: "/field-visits", label: "Field Visits",     sub: "Site visit tracking",    icon: MapPin,      grad: "from-green-500 to-green-700" },
    ],
  },
  {
    label: "AMC & Service",
    color: "from-emerald-600 to-teal-700",
    modules: [
      { href: "/amc", label: "AMC & Warranty", sub: "Contracts & service tickets", icon: ShieldCheck, grad: "from-emerald-500 to-emerald-700" },
    ],
  },
  {
    label: "Reports & AI",
    color: "from-violet-500 to-purple-700",
    modules: [
      { href: "/team-reports",          label: "Team Reports",    sub: "DAR / WWR / MWR",   icon: ClipboardList, grad: "from-blue-500 to-blue-700" },
      { href: "/reports",               label: "Reports & MIS",   sub: "Business analytics", icon: BarChart3,     grad: "from-indigo-500 to-indigo-700" },
      { href: "/reports/tax",           label: "GST Tax Report",  sub: "GSTR export",        icon: ScrollText,    grad: "from-amber-500 to-amber-700" },
      { href: "/reports/profitability",    label: "Profitability",       sub: "Margin & job cost",   icon: TrendingUp,  grad: "from-emerald-500 to-emerald-700" },
      { href: "/reports/branch-comparison", label: "Branch Comparison", sub: "4-branch analytics",  icon: GitCompare,  grad: "from-blue-500 to-indigo-600" },
      { href: "/ai-insights",              label: "AI Insights",        sub: "Live DB insights",    icon: Sparkles,    grad: "from-violet-500 to-purple-600" },
      { href: "/documents",             label: "Documents",       sub: "Drive & files",      icon: FolderOpen,    grad: "from-slate-500 to-slate-700" },
    ],
  },
  {
    label: "Admin",
    color: "from-slate-600 to-slate-800",
    modules: [
      { href: "/admin/settings",   label: "Company Settings",   sub: "Branches & config",   icon: Settings,  grad: "from-slate-500 to-slate-700" },
      { href: "/admin/users",      label: "User Management",    sub: "Roles & access",      icon: Shield,    grad: "from-indigo-500 to-indigo-700" },
      { href: "/admin/privileges", label: "Privileges",         sub: "Module permissions",  icon: Shield,    grad: "from-violet-500 to-violet-700" },
      { href: "/admin/database",   label: "Database Admin",     sub: "Tables & migrations", icon: Database,  grad: "from-red-500 to-red-700" },
      { href: "/admin/audit",      label: "Audit Trail",        sub: "All system actions",  icon: ScrollText, grad: "from-amber-500 to-amber-700" },
    ],
  },
  {
    label: "Support",
    color: "from-sky-500 to-blue-600",
    modules: [
      { href: "/help", label: "Help & Manual", sub: "User guide v1.4", icon: BookOpen, grad: "from-sky-500 to-sky-700" },
    ],
  },
];

export default function ModulesPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: companySettings } = useApi<{ name?: string }>("/settings");
  const companyName = companySettings?.name || "ZAG SIGNS";

  const totalModules = SECTIONS.reduce((s, sec) => s + sec.modules.length, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="All Modules" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">

        {/* Hero banner */}
        <div className="rounded-3xl p-6 flex items-center gap-6 shadow-lg"
          style={{ background: "linear-gradient(135deg,#0F1629 0%,#1e1b4b 60%,#312e81 100%)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Building2 size={32} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white tracking-tight">{companyName} ERP</h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              Welcome, <span className="font-semibold text-white">{user?.name ?? "—"}</span>
              {user?.branch ? ` · ${user.branch}` : ""} · {user?.role ?? ""}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-right">
            <p className="text-3xl font-black text-white">{totalModules}</p>
            <p className="text-indigo-300 text-xs">Active Modules</p>
            <p className="text-indigo-400 text-xs mt-0.5">{SECTIONS.length} Sections</p>
          </div>
        </div>

        {/* Module sections */}
        {SECTIONS.map((section) => (
          <div key={section.label}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-5 w-1 rounded-full bg-gradient-to-b ${section.color}`} />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{section.label}</h2>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">{section.modules.length} module{section.modules.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Module cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {section.modules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link key={mod.href} href={mod.href}
                    className="group bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-150">
                    {/* Square icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${mod.grad} shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-150`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    {/* Labels */}
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">{mod.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-tight">{mod.sub}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center py-4 border-t border-slate-200">
          <p className="text-xs text-slate-400">{companyName} ERP · {totalModules} modules across {SECTIONS.length} sections · Powered by Team bpro</p>
        </div>
      </div>
    </div>
  );
}
