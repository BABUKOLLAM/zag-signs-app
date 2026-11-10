import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAnyPathAccess } from "@/lib/api-helpers";
import { ROUTE_ACCESS } from "@/lib/route-access";
import { leaveUpdateCheck } from "@/lib/leave-approval";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.leaveRequests);
  if (!session) return err("Forbidden", 403);
  const { id } = await params;
  const body = await request.json() as { status?: string };
  if (!body.status) return err("status required");

  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    select: { userId: true, employee: { select: { email: true } } },
  });
  if (!leave) return err("Leave request not found", 404);
  // Was: any signed-in user could approve any leave, including their own.
  const user = session.user as { id?: string; role?: string; email?: string | null };
  const problem = leaveUpdateCheck({
    role: user.role, myId: user.id, myEmail: user.email, status: body.status,
    leave: { userId: leave.userId, employeeEmail: leave.employee?.email ?? null },
  });
  if (problem) return err(problem.error, problem.status);

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: body.status as never,
      approvedAt: body.status === "APPROVED" ? new Date() : null,
    },
  });
  return ok(updated);
}
