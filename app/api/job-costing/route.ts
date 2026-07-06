import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/job-costing");
  if (!session) return NextResponse.json(err("Forbidden"), { status: 403 });
  const { searchParams } = new URL(req.url);
  const salesOrderId = searchParams.get("salesOrderId") || undefined;
  const rows = await prisma.jobCost.findMany({
    where: salesOrderId ? { salesOrderId } : {},
    include: {
      salesOrder: { include: { customer: { select: { name: true, company: true } } } },
      lines: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(ok(rows));
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/job-costing");
  if (!session) return NextResponse.json(err("Forbidden"), { status: 403 });
  const body = await req.json();
  const lines = (body.lines ?? []).map((l: any) => ({
    category: l.category,
    description: l.description,
    quantity: Number(l.quantity ?? 1),
    unit: l.unit ?? "units",
    unitCost: Number(l.unitCost ?? 0),
    totalCost: Number(l.quantity ?? 1) * Number(l.unitCost ?? 0),
  }));
  const row = await prisma.jobCost.upsert({
    where: { salesOrderId: body.salesOrderId },
    update: {
      revenueQuoted: Number(body.revenueQuoted ?? 0),
      revenueActual: Number(body.revenueActual ?? 0),
      notes: body.notes ?? null,
      lines: { deleteMany: {}, create: lines },
    },
    create: {
      salesOrderId: body.salesOrderId,
      revenueQuoted: Number(body.revenueQuoted ?? 0),
      revenueActual: Number(body.revenueActual ?? 0),
      notes: body.notes ?? null,
      lines: { create: lines },
    },
    include: { lines: true, salesOrder: { include: { customer: { select: { name: true } } } } },
  });
  return NextResponse.json(ok(row), { status: 201 });
}
