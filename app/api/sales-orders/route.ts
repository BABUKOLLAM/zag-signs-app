import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate } from "@/lib/api-helpers";
import { OrderStatus } from "@prisma/client";

function shape(o: Awaited<ReturnType<typeof prisma.salesOrder.findFirst>> & {
  customer?: { name: string; company: string; branch: string } | null;
  quotation?: { quotationNo: string } | null;
}) {
  if (!o) return null;
  return {
    id: o.id,
    orderNo: o.orderNo,
    status: o.status,
    statusLabel: toLabel(o.status),
    totalAmount: o.totalAmount,
    paidAmount: o.paidAmount,
    orderDate: toDate(o.orderDate),
    deliveryDate: toDate(o.deliveryDate),
    notes: o.notes ?? "",
    createdAt: toDate(o.createdAt),
    customerId: o.customerId,
    customerName: (o as { customer?: { company: string } | null }).customer?.company ?? "",
    quotationNo: (o as { quotation?: { quotationNo: string } | null }).quotation?.quotationNo ?? "",
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as OrderStatus | null;
  const customerId = searchParams.get("customerId");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "50"));

  const where = {
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { name: true, company: true, branch: true } },
        quotation: { select: { quotationNo: true } },
      },
    }),
    prisma.salesOrder.count({ where }),
  ]);

  return NextResponse.json({
    data: orders.map((o) => shape(o as Parameters<typeof shape>[0])),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { customerId, quotationId, totalAmount, deliveryDate, notes } = body;

  if (!customerId) return err("Customer is required");
  if (!totalAmount || Number(totalAmount) <= 0) return err("Total amount is required");

  const year = new Date().getFullYear();
  const count = await prisma.salesOrder.count();
  const orderNo = `SO${year}-${String(count + 1).padStart(3, "0")}`;

  const order = await prisma.salesOrder.create({
    data: {
      orderNo,
      customerId,
      quotationId: quotationId ?? null,
      totalAmount: Number(totalAmount),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      notes: notes?.trim() ?? null,
      createdById: null,
    },
    include: {
      customer: { select: { name: true, company: true, branch: true } },
      quotation: { select: { quotationNo: true } },
    },
  });

  return ok(shape(order as Parameters<typeof shape>[0]), 201);
}
