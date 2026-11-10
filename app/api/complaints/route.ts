import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, toLabel, toDate, autoNo, requireAnyPathAccess, rangeFromQuery } from "@/lib/api-helpers";
import { complaintWhere } from "@/lib/list-filters";
import { ROUTE_ACCESS } from "@/lib/route-access";
import { ComplaintStatus, ComplaintPriority } from "@prisma/client";

function shape(c: Awaited<ReturnType<typeof prisma.complaint.findFirst>> & {
  customer?: { name: string; company: string } | null;
  assignedTo?: { name: string } | null;
}) {
  if (!c) return null;
  return {
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
    customerId: c.customerId,
    customerName: (c as { customer?: { company: string } | null }).customer?.company ?? "",
    assignedTo: (c as { assignedTo?: { name: string } | null }).assignedTo?.name ?? "Unassigned",
    assignedToId: c.assignedToId ?? null,
  };
}

export async function GET(request: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.complaints);
  if (!session) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ComplaintStatus | null;
  const priority = searchParams.get("priority") as ComplaintPriority | null;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "50"));

  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  const where = complaintWhere({ status, priority, range });

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { name: true, company: true } },
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return NextResponse.json({
    data: complaints.map((c) => shape(c as Parameters<typeof shape>[0])),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.complaints);
  if (!session) return err("Forbidden", 403);

  const body = await request.json();
  const { customerId, subject, description, priority, assignedToId } = body;

  if (!subject?.trim()) return err("Subject is required");
  if (!description?.trim()) return err("Description is required");

  const count = await prisma.complaint.count();
  const complaintNo = autoNo("CMP", count);

  const complaint = await prisma.complaint.create({
    data: {
      complaintNo,
      customerId: customerId ?? null,
      subject: subject.trim(),
      description: description.trim(),
      priority: (priority as ComplaintPriority) ?? ComplaintPriority.MEDIUM,
      assignedToId: assignedToId ?? null,
    },
    include: {
      customer: { select: { name: true, company: true } },
      assignedTo: { select: { name: true } },
    },
  });

  return ok(shape(complaint as Parameters<typeof shape>[0]), 201);
}
