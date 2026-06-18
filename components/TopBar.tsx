"use client";
import { ChevronRight, Menu } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import NotificationBell from "@/components/NotificationBell";
import GlobalSearch from "@/components/GlobalSearch";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-16 flex items-center px-6 gap-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

      {/* Hamburger — mobile only */}
      <button
        onClick={toggle}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors -ml-1 mr-1 flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu size={18} className="text-slate-600" />
      </button>

      {/* Title + breadcrumb */}
      <div className="flex-1 min-w-0">
        {subtitle ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <span>{subtitle}</span>
            <ChevronRight size={11} />
            <span className="text-indigo-600 font-medium">{title}</span>
          </div>
        ) : null}
        <h1 className="text-base font-semibold text-slate-900 truncate">{title}</h1>
      </div>

      {/* Global search */}
      <GlobalSearch />

      {/* Custom actions slot */}
      {actions}

      {/* Notification bell — live from DB */}
      <NotificationBell />

      {/* Date */}
      <div className="hidden md:block text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
      </div>
    </header>
  );
}
