import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAnyPathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { leaveWhere } from "@/lib/list-filters";
import { ROUTE_ACCESS } from "@/lib/route-access";

export async function GET(request: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.leaveRequests);
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(request.url);
  const status     = searchParams.get("status");
  const employeeId = searchParams.get("employeeId");

  // A leave matches when its from–to period overlaps the range.
  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  const where = leaveWhere({ status, employeeId, range });
  const [requests, total] = await Promise.all([prisma.leaveRequest.findMany({
    where,
    include: { employee: { select: { name: true, employeeNo: true, department: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  }), prisma.leaveRequest.count({ where })]);
  return okList(requests.map(r => ({
    id: r.id, leaveType: r.leaveType,
    fromDate: r.fromDate.toISOString().split("T")[0],
    toDate:   r.toDate.toISOString().split("T")[0],
    days: r.days, reason: r.reason ?? "", status: r.status,
    approvedAt: r.approvedAt?.toISOString() ?? null,
    createdAt:  r.createdAt.toISOString().split("T")[0],
    employeeId: r.employeeId ?? "", employeeName: r.employee?.name ?? "",
    employeeNo: r.employee?.employeeNo ?? "", department: r.employee?.department ?? "",
  })), { total, limit: 200 });
}

export async function POST(request: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.leaveRequests);
  if (!session) return err("Forbidden", 403);
  const body = await request.json() as {
    employeeId?: string; leaveType?: string; fromDate?: string;
    toDate?: string; days?: number; reason?: string;
  };
  if (!body.employeeId) return err("employeeId required");
  if (!body.leaveType)  return err("leaveType required");
  if (!body.fromDate || !body.toDate) return err("fromDate and toDate required");

  const req = await prisma.leaveRequest.create({
    data: {
      employeeId: body.employeeId, leaveType: body.leaveType,
      fromDate: new Date(body.fromDate), toDate: new Date(body.toDate),
      days: body.days ?? 1, reason: body.reason ?? null, status: "PENDING",
    },
    include: { employee: { select: { name: true, employeeNo: true } } },
  });
  return ok(req, 201);
}
