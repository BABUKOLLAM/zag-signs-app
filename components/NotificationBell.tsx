"use client";
import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useApi } from "@/lib/use-api";

type Notification = {
  id: string; title: string; message: string; type: string;
  isRead: boolean; link: string; createdAt: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_DOT: Record<string,string> = {
  info: "bg-indigo-400", warning: "bg-amber-400",
  danger: "bg-red-500", success: "bg-emerald-400",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, refetch } = useApi<Notification[]>("/api/notifications");
  const notifs = data ?? [];
  const unread = notifs.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method:"PATCH" });
    refetch();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all relative">
        <Bell size={16} className="text-slate-600" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <div className="flex items-center gap-2">
              {unread > 0 && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>}
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {notifs.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">No notifications</div>
            )}
            {notifs.map(n => (
              <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 cursor-pointer ${!n.isRead ? "bg-indigo-50/40" : ""}`}
                onClick={() => { if (n.link) window.location.href = n.link; }}>
                <div className="flex gap-2.5 items-start">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${TYPE_DOT[n.type] ?? "bg-slate-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100">
            <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">View all →</button>
          </div>
        </div>
      )}
    </div>
  );
}
