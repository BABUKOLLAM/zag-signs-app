import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate } from "@/lib/api-helpers";
import { Branch, LeadStatus, LeadSource } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { assignedTo: { select: { id: true, name: true } } },
  });
  if (!lead) return err("Lead not found", 404);

  return ok({
    id: lead.id,
    leadNo: lead.leadNo,
    name: lead.name,
    company: lead.company ?? "",
    phone: lead.phone,
    email: lead.email ?? "",
    branch: lead.branch,
    status: lead.status,
    statusLabel: toLabel(lead.status),
    source: lead.source,
    sourceLabel: toLabel(lead.source),
    value: lead.value,
    assignedTo: lead.assignedTo?.name ?? "Unassigned",
    assignedToId: lead.assignedToId,
    followUpDate: toDate(lead.followUpDate),
    createdAt: toDate(lead.createdAt),
    notes: lead.notes ?? "",
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.company !== undefined && { company: body.company.trim() || null }),
      ...(body.phone !== undefined && { phone: body.phone.trim() }),
      ...(body.email !== undefined && { email: body.email.trim() || null }),
      ...(body.branch !== undefined && { branch: body.branch as Branch }),
      ...(body.status !== undefined && { status: body.status as LeadStatus }),
      ...(body.source !== undefined && { source: body.source as LeadSource }),
      ...(body.value !== undefined && { value: Number(body.value) }),
      ...(body.followUpDate !== undefined && {
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      }),
      ...(body.notes !== undefined && { notes: body.notes.trim() || null }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || null }),
    },
  });

  return ok({ id: lead.id, leadNo: lead.leadNo, status: lead.status, statusLabel: toLabel(lead.status) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return ok({ deleted: true });
}
