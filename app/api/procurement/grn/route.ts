import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/procurement");
  if (!session) return err("Forbidden", 403);
  const rows = await prisma.goodsReceived.findMany({
    include: {
      po: { include: { vendor: { select: { name: true } } } },
      items: true,
      receivedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/procurement");
  if (!session) return err("Forbidden", 403);
  const body = await req.json();
  const count = await prisma.goodsReceived.count();
  const grnNo = `GRN-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.goodsReceived.create({
    data: {
      grnNo,
      poId: body.poId,
      receivedDate: body.receivedDate ? new Date(body.receivedDate) : new Date(),
      notes: body.notes ?? null,
      receivedById: (session.user as any).id,
      items: {
        create: (body.items ?? []).map((i: any) => ({
          description: i.description,
          orderedQty: Number(i.orderedQty),
          receivedQty: Number(i.receivedQty),
          rejectedQty: Number(i.rejectedQty ?? 0),
          unit: i.unit,
          notes: i.notes ?? null,
        })),
      },
    },
    include: { items: true, po: { include: { vendor: { select: { name: true } } } } },
  });
  // Update PO status to RECEIVED
  await prisma.purchaseOrder.update({ where: { id: body.poId }, data: { status: "RECEIVED" } });
  return ok(row, 201);
}
