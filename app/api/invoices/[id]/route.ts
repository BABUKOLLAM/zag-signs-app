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
  const body = await request.json() as { status?: string; notes?: string; dueDate?: string };

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      ...(body.status  ? { status: body.status as never }        : {}),
      ...(body.notes !== undefined ? { notes: body.notes }       : {}),
      ...(body.dueDate ? { dueDate: new Date(body.dueDate) }     : {}),
    },
  });
  return ok(updated);
}
