"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MapPin, ClipboardList, Grid3X3 } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";

const NAV = [
  { href: "/dashboard",    label: "Home",    icon: LayoutDashboard },
  { href: "/leads",        label: "Leads",   icon: Users },
  { href: "/field-visits", label: "Field",   icon: MapPin },
  { href: "/team-reports", label: "Reports", icon: ClipboardList },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { toggle } = useSidebar();

  if (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/portal")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-slate-200"
      style={{ background: "var(--topbar-bg, #fff)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-semibold transition-colors"
              style={{ color: active ? "#4F46E5" : "#94A3B8" }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={toggle}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-semibold transition-colors"
          style={{ color: "#94A3B8" }}
        >
          <Grid3X3 size={20} strokeWidth={1.5} />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
