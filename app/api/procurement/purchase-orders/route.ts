import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/procurement");
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const rows = await prisma.purchaseOrder.findMany({
    where: status ? { status } : {},
    include: {
      vendor: { select: { name: true, vendorCode: true } },
      lines: true,
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/procurement");
  if (!session) return err("Forbidden", 403);
  const body = await req.json();
  const count = await prisma.purchaseOrder.count();
  const poNo = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const lines = (body.lines ?? []).map((l: any) => ({
    description: l.description,
    quantity: Number(l.quantity),
    unit: l.unit,
    unitCost: Number(l.unitCost),
    totalCost: Number(l.quantity) * Number(l.unitCost),
  }));
  const totalAmount = lines.reduce((s: number, l: any) => s + l.totalCost, 0);
  const row = await prisma.purchaseOrder.create({
    data: {
      poNo,
      vendorId: body.vendorId,
      branch: body.branch,
      status: "DRAFT",
      totalAmount,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      notes: body.notes ?? null,
      createdById: (session.user as any).id,
      lines: { create: lines },
    },
    include: { vendor: true, lines: true },
  });
  return ok(row, 201);
}
