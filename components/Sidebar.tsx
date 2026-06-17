"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, FileText, ShoppingCart,
  Wrench, Package, Wallet, AlertCircle, BarChart3, UserCircle,
  Building2, ClipboardList, Target, CheckSquare, TrendingUp,
} from "lucide-react";

const navItems = [
  // Strategy
  { href: "/dashboard",     label: "Dashboard",        icon: LayoutDashboard },
  { href: "/kpi",           label: "KPI Dashboard",    icon: Target },
  // Sales pipeline
  { href: "/leads",         label: "Leads & CRM",      icon: Users },
  { href: "/opportunities", label: "Opportunities",    icon: TrendingUp },
  { href: "/customers",     label: "Customers",        icon: UserCheck },
  { href: "/quotations",    label: "Quotations",       icon: FileText },
  { href: "/sales-orders",  label: "Sales Orders",     icon: ShoppingCart },
  // Operations
  { href: "/work-orders",   label: "Work Orders",      icon: Wrench },
  { href: "/production",    label: "Production",       icon: Package },
  { href: "/inventory",     label: "Inventory",        icon: Package },
  // Finance
  { href: "/accounts",      label: "Accounts & Billing", icon: Wallet },
  { href: "/collections",   label: "Collections",      icon: Wallet },
  // Support & People
  { href: "/complaints",    label: "Complaints",       icon: AlertCircle },
  { href: "/tasks",         label: "Tasks",            icon: CheckSquare },
  { href: "/hr",            label: "HR & Attendance",  icon: UserCircle },
  // Reporting
  { href: "/team-reports",  label: "Team Reports",     icon: ClipboardList },
  { href: "/reports",       label: "Reports & MIS",    icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">ZAG SIGNS</p>
            <p className="text-xs text-gray-500">Enterprise ERP</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCircle size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">All Branches</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
