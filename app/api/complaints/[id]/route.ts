import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate } from "@/lib/api-helpers";
import { ComplaintStatus, ComplaintPriority } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const isResolving =
    body.status === ComplaintStatus.RESOLVED || body.status === ComplaintStatus.CLOSED;

  const c = await prisma.complaint.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status as ComplaintStatus }),
      ...(body.priority !== undefined && { priority: body.priority as ComplaintPriority }),
      ...(body.resolution !== undefined && { resolution: body.resolution.trim() || null }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || null }),
      ...(isResolving && !body.resolvedAt && { resolvedAt: new Date() }),
    },
  });

  return ok({ id: c.id, complaintNo: c.complaintNo, status: c.status, statusLabel: toLabel(c.status) });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const c = await prisma.complaint.findUnique({
    where: { id },
    include: {
      customer: true,
      assignedTo: { select: { id: true, name: true } },
    },
  });
  if (!c) return err("Complaint not found", 404);

  return ok({
    id: c.id,
    complaintNo: c.complaintNo,
    subject: c.subject,
    description: c.description,
    status: c.status,
    statusLabel: toLabel(c.status),
    priority: c.priority,
    priorityLabel: toLabel(c.priority),
    resolution: c.resolution ?? "",
    resolvedAt: toDate(c.resolvedAt),
    createdAt: toDate(c.createdAt),
    customer: c.customer ? { id: c.customer.id, name: c.customer.name, company: c.customer.company } : null,
    assignedTo: c.assignedTo ? { id: c.assignedTo.id, name: c.assignedTo.name } : null,
  });
}
