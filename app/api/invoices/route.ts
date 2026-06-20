import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, autoNo } from "@/lib/api-helpers";

function shape(inv: {
  id: string; invoiceNo: string; invoiceDate: Date; dueDate: Date | null;
  amount: number; taxAmount: number; totalAmount: number; status: string;
  notes: string | null; createdAt: Date;
  salesOrder?: { orderNo: string; customer: { name: string; company: string } | null } | null;
}) {
  return {
    id: inv.id, invoiceNo: inv.invoiceNo,
    invoiceDate: inv.invoiceDate.toISOString().split("T")[0],
    dueDate:     inv.dueDate?.toISOString().split("T")[0] ?? "",
    amount: inv.amount, taxAmount: inv.taxAmount, totalAmount: inv.totalAmount,
    status: inv.status, notes: inv.notes ?? "",
    createdAt: inv.createdAt.toISOString().split("T")[0],
    orderNo:      inv.salesOrder?.orderNo ?? "",
    customerName: inv.salesOrder?.customer?.name ?? "",
    company:      inv.salesOrder?.customer?.company ?? "",
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search") ?? "";

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search ? { OR: [
        { invoiceNo: { contains: search, mode: "insensitive" } },
        { salesOrder: { orderNo: { contains: search, mode: "insensitive" } } },
        { salesOrder: { customer: { name: { contains: search, mode: "insensitive" } } } },
      ]} : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { salesOrder: { select: { orderNo: true, customer: { select: { name: true, company: true } } } } },
  });
  return ok(invoices.map(shape));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const body = await request.json() as {
    salesOrderId?: string; amount?: number; taxRate?: number; taxAmount?: number;
    dueDate?: string; notes?: string;
  };
  if (!body.amount || body.amount <= 0) return err("amount required");

  const taxRate = Number(body.taxRate ?? 0);
  const taxAmount = body.taxAmount != null
    ? body.taxAmount
    : Math.round(body.amount * taxRate) / 100;

  const count  = await prisma.invoice.count();
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo:   autoNo("INV-", count),
      amount:      body.amount,
      taxRate,
      taxAmount,
      totalAmount: body.amount + taxAmount,
      dueDate:     body.dueDate ? new Date(body.dueDate) : null,
      notes:       body.notes ?? null,
      salesOrderId: body.salesOrderId || null,
      status: "PENDING",
    },
    include: { salesOrder: { select: { orderNo: true, customer: { select: { name: true, company: true } } } } },
  });
  return ok(shape(invoice), 201);
}
