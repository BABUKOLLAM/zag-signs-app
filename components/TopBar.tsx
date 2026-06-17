"use client";
import { Bell, Search, ChevronRight, Menu } from "lucide-react";
import { useState } from "react";
import { useSidebar } from "@/lib/sidebar-context";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { toggle } = useSidebar();

  const notifications = [
    { id: 1, text: "Follow-up due: Lulu Mall quotation", time: "10 min ago", type: "warning" },
    { id: 2, text: "New lead assigned: Muthoot Finance CLT", time: "1 hr ago", type: "info" },
    { id: 3, text: "Collection overdue: Rasheed Motors ₹85K", time: "2 hrs ago", type: "danger" },
    { id: 4, text: "WWR submitted by Vijay CRE — pending approval", time: "3 hrs ago", type: "info" },
  ];

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

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-52 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 font-medium hidden lg:block">⌘K</span>
      </div>

      {/* Custom actions slot */}
      {actions}

      {/* Notification bell */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Bell size={16} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full pulse-dot" />
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                  <div className="flex gap-2.5 items-start">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      n.type === "warning" ? "bg-amber-400" : n.type === "danger" ? "bg-red-500" : "bg-indigo-400"
                    }`} />
                    <div>
                      <p className="text-xs text-slate-800 leading-relaxed">{n.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100">
              <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">View all notifications →</button>
            </div>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="hidden md:block text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
      </div>
    </header>
  );
}
