import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate } from "@/lib/api-helpers";
import { OrderStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const o = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      quotation: { include: { items: true } },
      workOrders: true,
      invoices: true,
      collections: true,
    },
  });
  if (!o) return err("Order not found", 404);

  return ok({
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
    customer: o.customer ? { id: o.customer.id, name: o.customer.name, company: o.customer.company } : null,
    quotation: o.quotation ? {
      id: o.quotation.id,
      quotationNo: o.quotation.quotationNo,
      items: o.quotation.items,
    } : null,
    workOrders: o.workOrders.map((w) => ({ id: w.id, workOrderNo: w.workOrderNo, status: w.status })),
    invoices: o.invoices.map((i) => ({ id: i.id, invoiceNo: i.invoiceNo, totalAmount: i.totalAmount, status: i.status })),
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

  const o = await prisma.salesOrder.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status as OrderStatus }),
      ...(body.deliveryDate !== undefined && { deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null }),
      ...(body.notes !== undefined && { notes: body.notes.trim() || null }),
      ...(body.paidAmount !== undefined && { paidAmount: Number(body.paidAmount) }),
    },
  });

  return ok({ id: o.id, orderNo: o.orderNo, status: o.status, statusLabel: toLabel(o.status) });
}
