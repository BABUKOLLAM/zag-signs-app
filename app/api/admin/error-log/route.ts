import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, rangeFromQuery } from "@/lib/api-helpers";
import { errorLogWhere } from "@/lib/list-filters";

function isAdmin(role: string) {
  return ["MD", "IT Admin", "IT_ADMIN", "AVP"].some(
    (r) => role === r || role.replace(/\s/g, "_") === r.replace(/\s/g, "_")
  );
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const role = (session.user as { role: string }).role;
  if (!isAdmin(role)) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  const where = errorLogWhere({ range });
  const [logs, total] = await Promise.all([
    prisma.errorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 50,
      take: 50,
    }),
    prisma.errorLog.count({ where }),
  ]);

  return ok({
    logs: logs.map((l) => ({
      id: l.id,
      message: l.message,
      digest: l.digest ?? "",
      stack: l.stack ?? "",
      path: l.path ?? "",
      method: l.method ?? "",
      routeType: l.routeType ?? "",
      createdAt: l.createdAt.toISOString(),
    })),
    total,
  });
}

// Admins can clear old entries once reviewed.
export async function DELETE(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const role = (session.user as { role: string }).role;
  if (!isAdmin(role)) return err("Forbidden", 403);

  await prisma.errorLog.deleteMany({});
  return ok({ cleared: true });
}
