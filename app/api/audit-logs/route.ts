import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, requirePathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { auditLogWhere } from "@/lib/list-filters";

export async function GET(request: NextRequest) {
  // Same rule as the Audit Trail page (role default or per-user override):
  // MD and the full-access roles (AVP, IT Admin, Consultant). It used to be
  // MD/IT Admin only, so AVP could open the page but got 403 here.
  const session = await requirePathAccess("/admin/audit");
  if (!session) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const table  = searchParams.get("table");
  const userId = searchParams.get("userId");
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));

  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  const where = auditLogWhere({ table, userId, range });
  const [logs, total] = await Promise.all([prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * 100,
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  }), prisma.auditLog.count({ where })]);

  return okList(logs.map(l => ({
    id: l.id, action: l.action, tableName: l.tableName, recordId: l.recordId,
    oldValues: l.oldValues, newValues: l.newValues,
    ipAddress: l.ipAddress ?? "", createdAt: l.createdAt.toISOString(),
    userName: l.user?.name ?? "System", userEmail: l.user?.email ?? "",
  })), { total, limit: 100, page });
}

// Helper called from API routes to write audit entries
export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const body = await request.json() as {
    action: string; tableName: string; recordId: string;
    oldValues?: Record<string, unknown>; newValues?: Record<string, unknown>;
  };
  const dbUser = session.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    : null;

  const log = await prisma.auditLog.create({
    data: {
      action: body.action, tableName: body.tableName, recordId: body.recordId,
      oldValues: body.oldValues ? (body.oldValues as never) : undefined,
      newValues: body.newValues ? (body.newValues as never) : undefined,
      userId: dbUser?.id ?? null,
    },
  });
  return ok(log, 201);
}
