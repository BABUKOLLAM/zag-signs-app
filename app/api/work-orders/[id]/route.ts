import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toDate } from "@/lib/api-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json() as {
    status?: string;
    priority?: string;
    notes?: string;
    dueDate?: string;
    startDate?: string;
  };

  const wo = await prisma.workOrder.findUnique({ where: { id } });
  if (!wo) return err("Work order not found", 404);

  const completedAt =
    body.status === "Completed" && wo.status !== "Completed"
      ? new Date()
      : body.status !== "Completed"
      ? null
      : wo.completedAt;

  const updated = await prisma.workOrder.update({
    where: { id },
    data: {
      ...(body.status   ? { status: body.status }     : {}),
      ...(body.priority ? { priority: body.priority } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.dueDate   ? { dueDate:   new Date(body.dueDate) }   : {}),
      ...(body.startDate ? { startDate: new Date(body.startDate) } : {}),
      completedAt,
    },
    include: {
      salesOrder: {
        select: {
          orderNo: true,
          customer: { select: { name: true, company: true } },
        },
      },
    },
  });

  return ok({
    id: updated.id,
    workOrderNo: updated.workOrderNo,
    description: updated.description,
    status:      updated.status,
    priority:    updated.priority,
    dueDate:     toDate(updated.dueDate),
    completedAt: toDate(updated.completedAt),
    salesOrderNo:  updated.salesOrder?.orderNo ?? "",
    customerName:  updated.salesOrder?.customer?.name ?? "",
  });
}
