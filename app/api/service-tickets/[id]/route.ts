import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAnyPathAccess } from "@/lib/api-helpers";
import { ROUTE_ACCESS } from "@/lib/route-access";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.serviceTickets);
  if (!session) return err("Forbidden", 403);
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
