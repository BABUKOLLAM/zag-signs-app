import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

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
