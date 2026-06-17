import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate } from "@/lib/api-helpers";
import { QuotationStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const q = await prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      salesOrders: { select: { id: true, orderNo: true, status: true } },
    },
  });
  if (!q) return err("Quotation not found", 404);

  return ok({
    id: q.id,
    quotationNo: q.quotationNo,
    status: q.status,
    statusLabel: toLabel(q.status),
    customer: q.customer ? { id: q.customer.id, name: q.customer.name, company: q.customer.company } : null,
    items: q.items.map((i) => ({
      id: i.id,
      description: i.description,
      qty: i.qty,
      unit: i.unit,
      unitPrice: i.unitPrice,
      total: i.total,
    })),
    subtotal: q.subtotal,
    tax: q.tax,
    discount: q.discount,
    total: q.total,
    validUntil: toDate(q.validUntil),
    terms: q.terms ?? "",
    notes: q.notes ?? "",
    createdAt: toDate(q.createdAt),
    salesOrders: q.salesOrders,
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

  const q = await prisma.quotation.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status as QuotationStatus }),
      ...(body.validUntil !== undefined && { validUntil: body.validUntil ? new Date(body.validUntil) : null }),
      ...(body.terms !== undefined && { terms: body.terms.trim() || null }),
      ...(body.notes !== undefined && { notes: body.notes.trim() || null }),
    },
  });

  return ok({ id: q.id, quotationNo: q.quotationNo, status: q.status, statusLabel: toLabel(q.status) });
}
