import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toDate, autoNo, rangeFromQuery, okList } from "@/lib/api-helpers";
import { workOrderWhere } from "@/lib/list-filters";

type WOWithRelations = {
  id: string; workOrderNo: string; description: string; status: string; priority: string;
  startDate: Date | null; dueDate: Date | null; completedAt: Date | null;
  notes: string | null; createdAt: Date; salesOrderId: string | null;
  salesOrder?: { orderNo: string; customer: { name: string; company: string } | null } | null;
};

function shape(w: WOWithRelations) {
  return {
    id: w.id,
    workOrderNo: w.workOrderNo,
    description: w.description,
    status: w.status,
    priority: w.priority,
    startDate: toDate(w.startDate),
    dueDate: toDate(w.dueDate),
    completedAt: toDate(w.completedAt),
    notes: w.notes ?? "",
    createdAt: toDate(w.createdAt),
    salesOrderId: w.salesOrderId ?? "",
    salesOrderNo: w.salesOrder?.orderNo ?? "",
    customerName: w.salesOrder?.customer?.name ?? "",
  };
}

const LIST_CAP = 200;

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const status   = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search   = searchParams.get("search") ?? "";

  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;

  const where = workOrderWhere({ status, priority, search, range });
  const [items, total] = await Promise.all([prisma.workOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: LIST_CAP,
    include: {
      salesOrder: {
        select: {
          orderNo: true,
          customer: { select: { name: true, company: true } },
        },
      },
    },
  }), prisma.workOrder.count({ where })]);

  return okList(items.map(shape), { total, limit: LIST_CAP });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const body = await request.json() as {
    description?: string;
    salesOrderId?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    notes?: string;
  };

  if (!body.description?.trim()) return err("description is required");

  const count = await prisma.workOrder.count();
  const workOrderNo = autoNo("WO-", count);

  const wo = await prisma.workOrder.create({
    data: {
      workOrderNo,
      description: body.description.trim(),
      status:      "Pending",
      priority:    body.priority ?? "Medium",
      startDate:   body.startDate ? new Date(body.startDate) : null,
      dueDate:     body.dueDate   ? new Date(body.dueDate)   : null,
      notes:       body.notes ?? null,
      salesOrderId: body.salesOrderId || null,
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

  return ok(shape(wo), 201);
}
