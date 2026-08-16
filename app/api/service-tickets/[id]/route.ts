import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.assignedToId !== undefined) data.assignedToId = body.assignedToId || null;
  if (body.resolutionNotes !== undefined) data.resolutionNotes = body.resolutionNotes;
  if (body.status === "RESOLVED") data.resolvedAt = new Date();
  const row = await prisma.serviceTicket.update({
    where: { id },
    data,
    include: { customer: { select: { name: true } }, assignedTo: { select: { name: true } } },
  });
  return ok(row);
}
