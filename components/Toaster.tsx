"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const dismiss = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <Ctx.Provider value={{ success: (m) => add("success", m), error: (m) => add("error", m), info: (m) => add("info", m) }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </Ctx.Provider>
  );
}

const STYLES: Record<ToastType, { wrap: string; text: string; icon: ReactNode }> = {
  success: {
    wrap: "bg-green-50 border-green-200",
    text: "text-green-800",
    icon: <CheckCircle size={16} className="text-green-500 shrink-0" />,
  },
  error: {
    wrap: "bg-red-50 border-red-200",
    text: "text-red-800",
    icon: <XCircle size={16} className="text-red-500 shrink-0" />,
  },
  info: {
    wrap: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    icon: <Info size={16} className="text-blue-500 shrink-0" />,
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const s = STYLES[toast.type];
  return (
    <div className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium max-w-xs ${s.wrap} ${s.text} toast-enter`}>
      {s.icon}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-50 hover:opacity-100 mt-0.5">
        <X size={13} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast used outside ToastProvider");
  return ctx;
}
