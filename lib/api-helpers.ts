import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { canAccess, canAccessModules } from "./permissions";

export const ok = (data: unknown, status = 200) =>
  NextResponse.json({ data }, { status });

export const err = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

/**
 * Returns the session only if the user's role is in `allowed`; otherwise null.
 * Use in routes that must be limited to specific roles (defense in depth on
 * top of the UI-level RBAC). Empty `allowed` means any authenticated user.
 */
export async function requireRole(allowed: string[] = []) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  if (allowed.length > 0 && !allowed.includes(session.user.role)) return null;
  return session;
}

/**
 * Server-side equivalent of the client's usePermissions().canUse(path) —
 * checks the user's per-user UserPermission override first, falling back
 * to role defaults. Use for API routes that gate sensitive data (e.g. salary)
 * so the check matches what the RouteGuard already shows in the UI, instead
 * of a second hand-maintained role list that can drift out of sync.
 */
export async function requirePathAccess(path: string) {
  return requireAnyPathAccess([path]);
}

/**
 * Like requirePathAccess, but passes if the user can access ANY of the given
 * paths. Use when one endpoint backs more than one page with different role
 * sets (e.g. /api/sales-orders serves both /sales-orders and /installation).
 */
export async function requireAnyPathAccess(paths: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as { id?: string }).id;
  const role = (session.user as { role?: string }).role;
  const override = userId
    ? await prisma.userPermission.findUnique({ where: { userId }, select: { modules: true } })
    : null;
  const allowed = override
    ? paths.some((p) => canAccessModules(override.modules, p))
    : paths.some((p) => canAccess(role, p));
  return allowed ? session : null;
}

/** Convert DB enum like IN_PRODUCTION → "In Production" */
export function toLabel(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Format datetime to YYYY-MM-DD */
export function toDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

/** Generate next sequential number: autoNo("L", 5) → "L006" */
export function autoNo(prefix: string, count: number): string {
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}
