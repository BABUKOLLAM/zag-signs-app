import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAnyPathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { attendanceWhere } from "@/lib/list-filters";
import { ROUTE_ACCESS } from "@/lib/route-access";

export async function GET(request: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.attendance);
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const date       = searchParams.get("date");
  const month      = searchParams.get("month"); // YYYY-MM

  // from/to; the older ?date=YYYY-MM-DD (one day) and ?month=YYYY-MM still work.
  const { range, error: rangeError } = rangeFromQuery(new URLSearchParams({
    from: searchParams.get("from") || date || "",
    to: searchParams.get("to") || date || "",
    ...(month ? { month } : {}),
  }));
  if (rangeError) return rangeError;
  const where = attendanceWhere({ employeeId, range });
  const [records, total] = await Promise.all([prisma.attendance.findMany({
    where,
    include: { employee: { select: { name: true, employeeNo: true, department: true } } },
    orderBy: { date: "desc" },
    take: 500,
  }), prisma.attendance.count({ where })]);
  return okList(records.map(r => ({
    id: r.id, date: r.date.toISOString().split("T")[0],
    status: r.status, checkIn: r.checkIn?.toISOString() ?? null,
    checkOut: r.checkOut?.toISOString() ?? null, notes: r.notes ?? "",
    employeeId: r.employeeId ?? "", employeeName: r.employee?.name ?? "",
    employeeNo: r.employee?.employeeNo ?? "", department: r.employee?.department ?? "",
  })), { total, limit: 500 });
}

export async function POST(request: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.attendance);
  if (!session) return err("Forbidden", 403);
  const body = await request.json() as {
    employeeId?: string; date?: string; status?: string;
    checkIn?: string; checkOut?: string; notes?: string;
    checkInLat?: number; checkInLng?: number;
    checkOutLat?: number; checkOutLng?: number;
    locationName?: string;
  };
  if (!body.employeeId) return err("employeeId required");
  if (!body.date)       return err("date required");

  const gpsFields = {
    checkInLat:   body.checkInLat  ?? null,
    checkInLng:   body.checkInLng  ?? null,
    checkOutLat:  body.checkOutLat ?? null,
    checkOutLng:  body.checkOutLng ?? null,
    locationName: body.locationName ?? null,
  };

  const record = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: body.employeeId, date: new Date(body.date) } },
    update: {
      status:   (body.status   as never) ?? "PRESENT",
      checkIn:  body.checkIn  ? new Date(body.checkIn)  : null,
      checkOut: body.checkOut ? new Date(body.checkOut) : null,
      notes:    body.notes ?? null,
      ...gpsFields,
    },
    create: {
      employeeId: body.employeeId, date: new Date(body.date),
      status: (body.status as never) ?? "PRESENT",
      checkIn:  body.checkIn  ? new Date(body.checkIn)  : null,
      checkOut: body.checkOut ? new Date(body.checkOut) : null,
      notes:    body.notes ?? null,
      ...gpsFields,
    },
  });
  return ok(record, 201);
}
