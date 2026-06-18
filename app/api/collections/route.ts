import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const month      = searchParams.get("month");

  const collections = await prisma.collection.findMany({
    where: {
      ...(customerId ? { customerId } : {}),
      ...(month ? {
        collectionDate: {
          gte: new Date(`${month}-01`),
          lt:  new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1)),
        },
      } : {}),
    },
    orderBy: { collectionDate: "desc" },
    take: 200,
    include: {
      customer:   { select: { name: true, company: true } },
      salesOrder: { select: { orderNo: true } },
      invoice:    { select: { invoiceNo: true } },
    },
  });

  return ok(collections.map(c => ({
    id: c.id,
    collectionDate: c.collectionDate.toISOString().split("T")[0],
    amount: c.amount, paymentMode: c.paymentMode, reference: c.reference ?? "",
    notes: c.notes ?? "", createdAt: c.createdAt.toISOString().split("T")[0],
    customerId: c.customerId ?? "", customerName: c.customer?.name ?? "",
    company: c.customer?.company ?? "", orderNo: c.salesOrder?.orderNo ?? "",
    invoiceNo: c.invoice?.invoiceNo ?? "",
  })));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const body = await request.json() as {
    customerId?: string; salesOrderId?: string; invoiceId?: string;
    amount?: number; paymentMode?: string; reference?: string;
    collectionDate?: string; notes?: string;
  };
  if (!body.amount || body.amount <= 0) return err("amount required");

  const col = await prisma.collection.create({
    data: {
      amount: body.amount,
      paymentMode: (body.paymentMode as never) ?? "BANK_TRANSFER",
      reference:   body.reference  || null,
      notes:       body.notes      || null,
      collectionDate: body.collectionDate ? new Date(body.collectionDate) : new Date(),
      customerId:   body.customerId   || null,
      salesOrderId: body.salesOrderId || null,
      invoiceId:    body.invoiceId    || null,
    },
  });

  // Update invoice status if paid via invoice
  if (body.invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: body.invoiceId } });
    if (invoice) {
      const paid = await prisma.collection.aggregate({
        where: { invoiceId: body.invoiceId },
        _sum: { amount: true },
      });
      const totalPaid = paid._sum.amount ?? 0;
      const newStatus = totalPaid >= invoice.totalAmount ? "PAID"
        : totalPaid > 0 ? "PARTIAL" : "PENDING";
      await prisma.invoice.update({ where: { id: body.invoiceId }, data: { status: newStatus as never } });
    }
  }

  return ok(col, 201);
}
