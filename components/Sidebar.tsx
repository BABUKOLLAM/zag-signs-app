"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, FileText, ShoppingCart,
  Wrench, Package, Wallet, AlertCircle, BarChart3, UserCircle,
  Building2, ClipboardList, Target, CheckSquare, TrendingUp,
  MapPin, FolderOpen, Sparkles, ChevronRight, X, LogOut,
  Shield, Database,
} from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import { useSession, signOut } from "next-auth/react";
import { canAccess } from "@/lib/permissions";

const sections = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/dashboard",     label: "Dashboard",        icon: LayoutDashboard },
      { href: "/kpi",           label: "KPI Dashboard",    icon: Target },
    ],
  },
  {
    label: "SALES",
    items: [
      { href: "/leads",         label: "Leads & CRM",      icon: Users },
      { href: "/opportunities", label: "Opportunities",    icon: TrendingUp },
      { href: "/customers",     label: "Customers",        icon: UserCheck },
      { href: "/quotations",    label: "Quotations",       icon: FileText },
      { href: "/sales-orders",  label: "Sales Orders",     icon: ShoppingCart },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { href: "/work-orders",   label: "Work Orders",      icon: Wrench },
      { href: "/production",    label: "Production",       icon: Package },
      { href: "/inventory",     label: "Inventory",        icon: Package },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { href: "/accounts",      label: "Accounts & Billing", icon: Wallet },
      { href: "/collections",   label: "Collections",      icon: Wallet },
    ],
  },
  {
    label: "PEOPLE & FIELD",
    items: [
      { href: "/complaints",    label: "Complaints",       icon: AlertCircle },
      { href: "/tasks",         label: "Tasks",            icon: CheckSquare },
      { href: "/hr",            label: "HR & Attendance",  icon: UserCircle },
      { href: "/field-visits",  label: "Field Visits",     icon: MapPin },
    ],
  },
  {
    label: "REPORTS & AI",
    items: [
      { href: "/team-reports",  label: "Team Reports",     icon: ClipboardList },
      { href: "/reports",       label: "Reports & MIS",    icon: BarChart3 },
      { href: "/ai-insights",   label: "AI Insights",      icon: Sparkles },
      { href: "/documents",     label: "Documents",        icon: FolderOpen },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { href: "/admin/users",    label: "User Management",  icon: Shield },
      { href: "/admin/database", label: "Database Admin",   icon: Database },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { open, close } = useSidebar();
  const { data: session } = useSession();
  const user = session?.user;

  // Filter nav by the signed-in role; drop sections that end up empty.
  const role = user?.role;
  const visibleSections = sections
    .map((s) => ({ ...s, items: s.items.filter((i) => canAccess(role, i.href)) }))
    .filter((s) => s.items.length > 0);

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
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 sidebar-nav">
        {visibleSections.map(({ label, items }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-slate-500 px-3 mb-1.5 tracking-wider">{label}</p>
            <div className="space-y-0.5">
              {items.map(({ href, label: itemLabel, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                      active
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                    style={active
                      ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)" }
                      : {}}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = ""; }}
                  >
                    <Icon size={15} className={active ? "text-white" : "text-slate-500 group-hover:text-slate-300"} />
                    <span className="flex-1">{itemLabel}</span>
                    {active && <ChevronRight size={12} className="text-indigo-300 opacity-70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
      </div>
    </aside>
  );
}
