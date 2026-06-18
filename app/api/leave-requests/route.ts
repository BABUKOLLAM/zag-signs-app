import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { searchParams } = new URL(request.url);
  const status     = searchParams.get("status");
  const employeeId = searchParams.get("employeeId");

  const requests = await prisma.leaveRequest.findMany({
    where: {
      ...(status     ? { status: status as never } : {}),
      ...(employeeId ? { employeeId }              : {}),
    },
    include: { employee: { select: { name: true, employeeNo: true, department: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok(requests.map(r => ({
    id: r.id, leaveType: r.leaveType,
    fromDate: r.fromDate.toISOString().split("T")[0],
    toDate:   r.toDate.toISOString().split("T")[0],
    days: r.days, reason: r.reason ?? "", status: r.status,
    approvedAt: r.approvedAt?.toISOString() ?? null,
    createdAt:  r.createdAt.toISOString().split("T")[0],
    employeeId: r.employeeId ?? "", employeeName: r.employee?.name ?? "",
    employeeNo: r.employee?.employeeNo ?? "", department: r.employee?.department ?? "",
  })));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
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
