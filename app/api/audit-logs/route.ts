import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const role = (session.user as { role: string }).role;
  const isAdmin = ["MD","IT Admin","IT_ADMIN"].some(r => role === r || role.replace(/\s/g,"_") === r.replace(/\s/g,"_"));
  if (!isAdmin) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const table  = searchParams.get("table");
  const userId = searchParams.get("userId");
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(table  ? { tableName: table } : {}),
      ...(userId ? { userId }           : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * 100,
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return ok(logs.map(l => ({
    id: l.id, action: l.action, tableName: l.tableName, recordId: l.recordId,
    oldValues: l.oldValues, newValues: l.newValues,
    ipAddress: l.ipAddress ?? "", createdAt: l.createdAt.toISOString(),
    userName: l.user?.name ?? "System", userEmail: l.user?.email ?? "",
  })));
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
      oldValues: body.oldValues ?? undefined, newValues: body.newValues ?? undefined,
      userId: dbUser?.id ?? null,
    },
  });
  return ok(log, 201);
}
