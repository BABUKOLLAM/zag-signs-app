import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const date       = searchParams.get("date");
  const month      = searchParams.get("month"); // YYYY-MM

  const records = await prisma.attendance.findMany({
    where: {
      ...(employeeId ? { employeeId } : {}),
      ...(date ? { date: new Date(date) } : {}),
      ...(month ? {
        date: {
          gte: new Date(`${month}-01`),
          lt:  new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1) > 0
            ? new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1))
            : new Date(),
        },
      } : {}),
    },
    include: { employee: { select: { name: true, employeeNo: true, department: true } } },
    orderBy: { date: "desc" },
    take: 500,
  });
  return ok(records.map(r => ({
    id: r.id, date: r.date.toISOString().split("T")[0],
    status: r.status, checkIn: r.checkIn?.toISOString() ?? null,
    checkOut: r.checkOut?.toISOString() ?? null, notes: r.notes ?? "",
    employeeId: r.employeeId ?? "", employeeName: r.employee?.name ?? "",
    employeeNo: r.employee?.employeeNo ?? "", department: r.employee?.department ?? "",
  })));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const body = await request.json() as {
    employeeId?: string; date?: string; status?: string;
    checkIn?: string; checkOut?: string; notes?: string;
  };
  if (!body.employeeId) return err("employeeId required");
  if (!body.date)       return err("date required");

  const record = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: body.employeeId, date: new Date(body.date) } },
    update: {
      status:   (body.status   as never) ?? "PRESENT",
      checkIn:  body.checkIn  ? new Date(body.checkIn)  : null,
      checkOut: body.checkOut ? new Date(body.checkOut) : null,
      notes:    body.notes ?? null,
    },
    create: {
      employeeId: body.employeeId, date: new Date(body.date),
      status: (body.status as never) ?? "PRESENT",
      checkIn:  body.checkIn  ? new Date(body.checkIn)  : null,
      checkOut: body.checkOut ? new Date(body.checkOut) : null,
      notes:    body.notes ?? null,
    },
  });
  return ok(record, 201);
}
