import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePathAccess("/procurement");
  if (!session) return err("Forbidden", 403);
  const { id } = await params;
  const body = await req.json();
  const row = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.deliveryDate !== undefined && { deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null }),
    },
    include: { vendor: true, lines: true },
  });
  return ok(row);
}
