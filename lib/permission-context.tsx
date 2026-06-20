"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { canAccess, canAccessModules } from "@/lib/permissions";

interface PermCtx {
  canUse: (path: string) => boolean;
  loading: boolean;
  reload: () => void;
}

const Ctx = createContext<PermCtx>({
  canUse: () => false,
  loading: true,
  reload: () => {},
});

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [customModules, setCustomModules] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchModules = useCallback(() => {
    if (status !== "authenticated") {
      setLoading(status === "loading");
      return;
    }
    setLoading(true);
    fetch("/api/me/modules", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { modules: string[] | null }) => setCustomModules(d.modules ?? null))
      .catch(() => setCustomModules(null))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const role = (session?.user as { role?: string } | undefined)?.role;

  const canUse = useCallback((path: string): boolean => {
    if (customModules !== null) return canAccessModules(customModules, path);
    return canAccess(role, path);
  }, [customModules, role]);

  return (
    <Ctx.Provider value={{ canUse, loading, reload: fetchModules }}>
      {children}
    </Ctx.Provider>
  );
}

export const usePermissions = () => useContext(Ctx);
