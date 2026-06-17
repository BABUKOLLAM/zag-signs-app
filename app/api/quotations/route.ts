import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate, autoNo } from "@/lib/api-helpers";
import { QuotationStatus } from "@prisma/client";

function shape(q: Awaited<ReturnType<typeof prisma.quotation.findFirst>> & {
  customer?: { name: string; company: string } | null;
  items?: { description: string; qty: number; unit: string; unitPrice: number; total: number }[];
}) {
  if (!q) return null;
  return {
    id: q.id,
    quotationNo: q.quotationNo,
    status: q.status,
    statusLabel: toLabel(q.status),
    subtotal: q.subtotal,
    tax: q.tax,
    discount: q.discount,
    total: q.total,
    validUntil: toDate(q.validUntil),
    terms: q.terms ?? "",
    notes: q.notes ?? "",
    createdAt: toDate(q.createdAt),
    customerId: q.customerId,
    customerName: (q as { customer?: { name: string; company: string } | null }).customer?.company ?? "",
    items: (q as { items?: unknown[] }).items ?? [],
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as QuotationStatus | null;
  const customerId = searchParams.get("customerId");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "50"));

  const where = {
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
  };

  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { name: true, company: true } },
        items: true,
      },
    }),
    prisma.quotation.count({ where }),
  ]);

  return NextResponse.json({
    data: quotations.map((q) => shape(q as Parameters<typeof shape>[0])),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { customerId, leadId, items = [], tax = 0, discount = 0, validUntil, terms, notes } = body;

  if (!customerId && !leadId) return err("Customer or Lead is required");
  if (!items.length) return err("At least one item is required");

  const subtotal: number = items.reduce((s: number, i: { qty: number; unitPrice: number }) => s + i.qty * i.unitPrice, 0);
  const total = subtotal + Number(tax) - Number(discount);

  const year = new Date().getFullYear();
  const count = await prisma.quotation.count();
  const quotationNo = `Q${year}-${String(count + 1).padStart(3, "0")}`;

  const quotation = await prisma.quotation.create({
    data: {
      quotationNo,
      customerId: customerId ?? null,
      leadId: leadId ?? null,
      subtotal,
      tax: Number(tax),
      discount: Number(discount),
      total,
      validUntil: validUntil ? new Date(validUntil) : null,
      terms: terms?.trim() ?? null,
      notes: notes?.trim() ?? null,
      items: {
        create: items.map((i: { description: string; qty: number; unit: string; unitPrice: number }) => ({
          description: i.description,
          qty: Number(i.qty),
          unit: i.unit ?? "Nos",
          unitPrice: Number(i.unitPrice),
          total: Number(i.qty) * Number(i.unitPrice),
        })),
      },
    },
    include: { items: true, customer: { select: { name: true, company: true } } },
  });

  return ok(shape(quotation), 201);
}
