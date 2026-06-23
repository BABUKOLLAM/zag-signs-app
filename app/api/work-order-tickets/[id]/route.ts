import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

const INCLUDE = {
  customer:         { select: { id: true, name: true, company: true, phone: true, email: true, address: true, gstNo: true } },
  quotation:        { select: { quotationNo: true } },
  assignedDesigner: { select: { id: true, name: true, email: true } },
  createdBy:        { select: { id: true, name: true } },
  events: {
    orderBy: { createdAt: "asc" as const },
    include: { actor: { select: { id: true, name: true } } },
  },
};

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { id } = await params;

  const t = await prisma.workOrderTicket.findUnique({
    where: { id },
    include: INCLUDE,
  });
  if (!t) return err("Ticket not found", 404);

  return ok({
    id: t.id, ticketNo: t.ticketNo, branch: t.branch,
    source: t.source, status: t.status, priority: t.priority,
    customerId: t.customerId,
    customerName: t.customerName,
    customerPhone: t.customerPhone ?? "",
    customerEmail: t.customerEmail ?? "",
    customerAddress: t.customerAddress ?? "",
    customerCompany: t.customer?.company ?? "",
    customerGst: t.customer?.gstNo ?? "",
    quotationId: t.quotationId,
    quotationNo: t.quotation?.quotationNo ?? "",
    natureOfWork: t.natureOfWork,
    description: t.description,
    reference: t.reference ?? "",
    attachments: t.attachments ?? [],
    estimatedCost: t.estimatedCost,
    advancePaid: t.advancePaid,
    balanceDue: t.balanceDue,
    paymentMode: t.paymentMode ?? "",
    receivedAt:  t.receivedAt.toISOString(),
    expectedAt:  t.expectedAt?.toISOString() ?? null,
    assignedAt:  t.assignedAt?.toISOString() ?? null,
    startedAt:   t.startedAt?.toISOString() ?? null,
    halfDoneAt:  t.halfDoneAt?.toISOString() ?? null,
    completedAt: t.completedAt?.toISOString() ?? null,
    billedAt:    t.billedAt?.toISOString() ?? null,
    assignedDesignerId: t.assignedDesignerId,
    assignedDesignerName: t.assignedDesigner?.name ?? "",
    assignedDesignerEmail: t.assignedDesigner?.email ?? "",
    halfDoneReason:  t.halfDoneReason ?? "",
    designerRemarks: t.designerRemarks ?? "",
    closingNotes:    t.closingNotes ?? "",
    createdById:    t.createdById,
    createdByName:  t.createdBy?.name ?? "",
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    events: t.events.map((e) => ({
      id: e.id,
      fromStatus: e.fromStatus, toStatus: e.toStatus,
      note: e.note ?? "",
      actorName: e.actor?.name ?? "System",
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

const STATUS_TIMESTAMPS: Record<string, string> = {
  ASSIGNED:   "assignedAt",
  IN_PROGRESS:"startedAt",
  HALF_DONE:  "halfDoneAt",
  DONE:       "completedAt",
  BILLED:     "billedAt",
};

export async function PUT(request: NextRequest, { params }: Ctx) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const su = session.user as { id?: string };
  const { id } = await params;

  const body = await request.json() as {
    status?: string;
    priority?: string;
    natureOfWork?: string;
    description?: string;
    reference?: string;
    estimatedCost?: number;
    advancePaid?: number;
    paymentMode?: string;
    expectedAt?: string | null;
    assignedDesignerId?: string | null;
    halfDoneReason?: string;
    designerRemarks?: string;
    closingNotes?: string;
    eventNote?: string;
  };

  const current = await prisma.workOrderTicket.findUnique({ where: { id } });
  if (!current) return err("Ticket not found", 404);

  // Validate status transitions: require reason/remarks where applicable
  if (body.status === "HALF_DONE" && !body.halfDoneReason?.trim()) {
    return err("A reason is required when marking a ticket half-done");
  }
  if (body.status === "DONE" && !body.designerRemarks?.trim()) {
    return err("Designer remarks are required when marking a ticket done");
  }

  const data: Record<string, unknown> = {};
  if (body.status !== undefined)             data.status = body.status as never;
  if (body.priority !== undefined)           data.priority = body.priority as never;
  if (body.natureOfWork !== undefined)       data.natureOfWork = body.natureOfWork;
  if (body.description !== undefined)        data.description  = body.description;
  if (body.reference !== undefined)          data.reference    = body.reference;
  if (body.paymentMode !== undefined)        data.paymentMode  = body.paymentMode;
  if (body.expectedAt !== undefined)         data.expectedAt   = body.expectedAt ? new Date(body.expectedAt) : null;
  if (body.assignedDesignerId !== undefined) {
    data.assignedDesignerId = body.assignedDesignerId;
    if (body.assignedDesignerId && !current.assignedAt) data.assignedAt = new Date();
    if (body.assignedDesignerId && current.status === "NEW") data.status = "ASSIGNED";
  }
  if (body.halfDoneReason !== undefined)  data.halfDoneReason  = body.halfDoneReason;
  if (body.designerRemarks !== undefined) data.designerRemarks = body.designerRemarks;
  if (body.closingNotes !== undefined)    data.closingNotes    = body.closingNotes;

  if (body.estimatedCost !== undefined || body.advancePaid !== undefined) {
    const ec = body.estimatedCost ?? current.estimatedCost;
    const ap = body.advancePaid   ?? current.advancePaid;
    data.estimatedCost = ec;
    data.advancePaid   = ap;
    data.balanceDue    = Math.max(0, Number(ec) - Number(ap));
  }

  // Auto-stamp the timestamp matching the new status
  if (body.status && STATUS_TIMESTAMPS[body.status]) {
    data[STATUS_TIMESTAMPS[body.status]] = new Date();
  }

  const updated = await prisma.workOrderTicket.update({
    where: { id },
    data: {
      ...data,
      events: body.status && body.status !== current.status ? {
        create: [{
          fromStatus: current.status,
          toStatus:   body.status as never,
          note:       body.eventNote ?? body.halfDoneReason ?? body.designerRemarks ?? null,
          actorId:    su.id ?? null,
        }],
      } : undefined,
    },
  });

  return ok({ id: updated.id, status: updated.status });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { id } = await params;

  await prisma.workOrderTicket.delete({ where: { id } });
  return ok({ id });
}
