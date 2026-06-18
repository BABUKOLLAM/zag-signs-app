"use client";
import { ChevronRight, Menu, Sun, Moon } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import { useTheme } from "@/lib/theme-context";
import NotificationBell from "@/components/NotificationBell";
import GlobalSearch from "@/components/GlobalSearch";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { toggle } = useSidebar();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-20 h-16 flex items-center px-4 md:px-6 gap-3 border-b"
      style={{
        background: "var(--topbar-bg, #fff)",
        borderColor: "var(--card-border, #E2E8F0)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={toggle}
        className="lg:hidden p-2 rounded-xl transition-colors -ml-1 flex-shrink-0"
        style={{ color: "var(--text-secondary)" }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {subtitle ? (
          <div className="flex items-center gap-1 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
            <span>{subtitle}</span>
            <ChevronRight size={10} />
            <span className="text-indigo-500 font-medium">{title}</span>
          </div>
        ) : null}
        <h1 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{title}</h1>
      </div>

      {/* Global search */}
      <GlobalSearch />

      {/* Custom actions */}
      {actions}

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-xl transition-colors flex-shrink-0"
        style={{ color: "var(--text-secondary)" }}
        aria-label="Toggle dark mode"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark"
          ? <Sun size={16} className="text-amber-400" />
          : <Moon size={16} />
        }
      </button>

      {/* Notifications */}
      <NotificationBell />

      {/* Date — desktop only */}
      <div
        className="hidden md:block text-xs font-medium rounded-xl px-3 py-2 flex-shrink-0"
        style={{
          color: "var(--text-secondary)",
          background: "var(--background)",
          border: "1px solid var(--card-border)",
        }}
      >
        {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
      </div>
    </header>
  );
}
