import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { id } = await params;
  const body = await request.json() as { status?: string };
  if (!body.status) return err("status required");

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: body.status as never,
      approvedAt: body.status === "APPROVED" ? new Date() : null,
    },
  });
  return ok(updated);
}
