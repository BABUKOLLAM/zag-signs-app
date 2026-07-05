"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, UserCheck, FileText, ShoppingCart,
  Wrench, Package, Wallet, AlertCircle, BarChart3, UserCircle,
  Building2, ClipboardList, Target, CheckSquare, TrendingUp,
  MapPin, FolderOpen, Sparkles, ChevronRight, ChevronDown, X, LogOut,
  Shield, Database, ScrollText, BookOpen, Settings, Receipt,
  Ticket, Palette, Trophy, Truck, ShoppingBag, FolderKanban,
  ClipboardCheck, ShieldCheck, DollarSign, LayoutGrid, Hammer, GitCompare,
} from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import { useSession, signOut } from "next-auth/react";
import { usePermissions } from "@/lib/permission-context";
import PoweredByBpro from "@/components/PoweredByBpro";

// Top-level links always visible (no drill-down)
const pinned = [
  { href: "/modules",   label: "All Modules",   icon: LayoutGrid },
  { href: "/dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { href: "/kpi",       label: "KPI Dashboard", icon: Target },
];

// Collapsible groups — icon shown on the group header
const groups = [
  {
    label: "Sales", icon: ShoppingCart,
    items: [
      { href: "/leads",         label: "Leads & CRM",        icon: Users },
      { href: "/opportunities", label: "Opportunities",      icon: TrendingUp },
      { href: "/tender",        label: "Tender Management",  icon: Trophy },
      { href: "/customers",     label: "Customers",          icon: UserCheck },
      { href: "/quotations",    label: "Quotations",         icon: FileText },
      { href: "/sales-orders",  label: "Sales Orders",       icon: ShoppingCart },
    ],
  },
  {
    label: "Operations", icon: Wrench,
    items: [
      { href: "/work-order-tickets", label: "Work Order Tickets",    icon: Ticket },
      { href: "/my-work",            label: "My Work",               icon: Palette },
      { href: "/work-orders",        label: "Work Orders",           icon: Wrench },
      { href: "/production",         label: "Production",            icon: Package },
      { href: "/inventory",          label: "Inventory",             icon: Package },
      { href: "/installation",       label: "Installation Tracking", icon: Hammer },
      { href: "/digital-approvals",  label: "Digital Approvals",     icon: ClipboardCheck },
      { href: "/projects",           label: "Project Management",    icon: FolderKanban },
    ],
  },
  {
    label: "Procurement & Fleet", icon: Truck,
    items: [
      { href: "/procurement", label: "Procurement",      icon: ShoppingBag },
      { href: "/fleet",       label: "Fleet Management", icon: Truck },
    ],
  },
  {
    label: "Finance", icon: Wallet,
    items: [
      { href: "/invoices",    label: "Invoices",           icon: Receipt },
      { href: "/accounts",    label: "Accounts & Billing", icon: Wallet },
      { href: "/collections", label: "Collections",        icon: Wallet },
      { href: "/job-costing", label: "Job Costing",        icon: DollarSign },
    ],
  },
  {
    label: "AMC & Service", icon: ShieldCheck,
    items: [
      { href: "/amc", label: "AMC & Warranty", icon: ShieldCheck },
    ],
  },
  {
    label: "Field Sales", icon: MapPin,
    items: [
      { href: "/sales/fjp",       label: "Journey Plan (FJP)", icon: MapPin },
      { href: "/sales/expenses",  label: "Expense Reports",    icon: Receipt },
      { href: "/sales/approvals", label: "Approvals",          icon: CheckSquare },
    ],
  },
  {
    label: "People & Field", icon: UserCircle,
    items: [
      { href: "/complaints",   label: "Complaints",      icon: AlertCircle },
      { href: "/tasks",        label: "Tasks",           icon: CheckSquare },
      { href: "/hr",           label: "HR & Attendance", icon: UserCircle },
      { href: "/field-visits", label: "Field Visits",    icon: MapPin },
    ],
  },
  {
    label: "Reports & AI", icon: BarChart3,
    items: [
      { href: "/team-reports",              label: "Team Reports",      icon: ClipboardList },
      { href: "/reports",                   label: "Reports & MIS",     icon: BarChart3 },
      { href: "/reports/tax",               label: "GST Tax Report",    icon: ScrollText },
      { href: "/reports/profitability",     label: "Profitability",     icon: TrendingUp },
      { href: "/reports/branch-comparison", label: "Branch Comparison", icon: GitCompare },
      { href: "/ai-insights",               label: "AI Insights",       icon: Sparkles },
      { href: "/documents",                 label: "Documents",         icon: FolderOpen },
    ],
  },
  {
    label: "Admin", icon: Shield,
    items: [
      { href: "/admin/settings",   label: "Company Settings",   icon: Settings },
      { href: "/admin/users",      label: "User Management",    icon: Shield },
      { href: "/admin/privileges", label: "Privilege Settings", icon: Shield },
      { href: "/admin/database",   label: "Database Admin",     icon: Database },
      { href: "/admin/audit",      label: "Audit Trail",        icon: ScrollText },
    ],
  },
  {
    label: "Support", icon: BookOpen,
    items: [
      { href: "/help", label: "Help & Manual", icon: BookOpen },
    ],
  },
];

const STORAGE_KEY = "zag-sidebar-open-groups";

export default function Sidebar() {
  const pathname = usePathname();
  const { open, close } = useSidebar();
  const { data: session } = useSession();
  const user = session?.user;
  const { canUse } = usePermissions();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Filter nav using DB-overridden permissions (falls back to role defaults).
  const visiblePinned = pinned.filter((i) => canUse(i.href));
  const visibleGroups = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => canUse(i.href)) }))
    .filter((g) => g.items.length > 0);

  // Open-group state — restored from localStorage, active group always opened
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let saved: string[] = [];
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { /* ignore */ }
    const active = groups.find(g => g.items.some(i => isActive(i.href)))?.label;
    setOpenGroups(new Set(active ? [...saved, active] : saved));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-expand the group that contains the page being navigated to
  useEffect(() => {
    if (!hydrated) return;
    const active = groups.find(g => g.items.some(i => isActive(i.href)))?.label;
    if (active && !openGroups.has(active)) {
      setOpenGroups(prev => new Set(prev).add(active));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hydrated]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-30 transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
      style={{ background: "linear-gradient(180deg, #0F1629 0%, #111827 100%)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            <Building2 size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight tracking-wide">ZAG SIGNS</p>
            <p className="text-xs text-slate-400 font-medium">Enterprise ERP</p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={close}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 sidebar-nav">

        {/* Pinned top-level links */}
        <div className="space-y-0.5 mb-3">
          {visiblePinned.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  active ? "text-white" : "text-slate-400 hover:text-white"
                }`}
                style={active ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" } : {}}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
              >
                <Icon size={15} className={active ? "text-white" : "text-slate-500 group-hover:text-slate-300"} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={12} className="text-indigo-300 opacity-70" />}
              </Link>
            );
          })}
        </div>

        {/* Drill-down groups */}
        <div className="space-y-1">
          {visibleGroups.map(({ label, icon: GroupIcon, items }) => {
            const expanded = openGroups.has(label);
            const containsActive = items.some(i => isActive(i.href));
            return (
              <div key={label}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(label)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all group ${
                    containsActive && !expanded ? "text-indigo-300" : "text-slate-300 hover:text-white"
                  }`}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                  aria-expanded={expanded}
                >
                  <GroupIcon size={15} className={containsActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} />
                  <span className="flex-1 text-left">{label}</span>
                  {containsActive && !expanded && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  )}
                  <ChevronDown
                    size={13}
                    className={`text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Sub-items */}
                <div
                  className="overflow-hidden transition-all duration-200 ease-in-out"
                  style={{ maxHeight: expanded ? `${items.length * 40}px` : "0px" }}
                >
                  <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5 py-0.5">
                    {items.map(({ href, label: itemLabel, icon: Icon }) => {
                      const active = isActive(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all group ${
                            active ? "text-white" : "text-slate-400 hover:text-white"
                          }`}
                          style={active ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" } : {}}
                          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; }}
                          onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
                        >
                          <Icon size={14} className={active ? "text-white" : "text-slate-500 group-hover:text-slate-300"} />
                          <span className="flex-1">{itemLabel}</span>
                          {active && <ChevronRight size={11} className="text-indigo-300 opacity-70" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer — shows logged-in user + sign-out */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? "Loading…"}</p>
            <p className="text-xs text-slate-500 truncate">
              {user?.role ?? "—"} · {user?.branch ?? "—"}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10">
          <PoweredByBpro variant="dark" logoHeight={24} />
        </div>
      </div>
    </aside>
  );
}
