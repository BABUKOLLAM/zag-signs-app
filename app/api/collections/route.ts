import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { collectionWhere } from "@/lib/list-filters";

const LIST_CAP = 200;

export async function GET(request: NextRequest) {
  const session = await requirePathAccess("/collections");
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  // ?month=YYYY-MM (old links) is mapped to that month's from–to range.
  const { range, error: rangeError } = rangeFromQuery(searchParams);
  if (rangeError) return rangeError;

  const where = collectionWhere({ customerId, range });
  const [collections, agg, modes] = await Promise.all([prisma.collection.findMany({
    where,
    orderBy: { collectionDate: "desc" },
    take: LIST_CAP,
    include: {
      customer:   { select: { name: true, company: true } },
      salesOrder: { select: { orderNo: true } },
      invoice:    { select: { invoiceNo: true } },
    },
  }), prisma.collection.aggregate({ where, _count: { _all: true }, _sum: { amount: true } }),
  prisma.collection.groupBy({ by: ["paymentMode"], where, _sum: { amount: true } })]);

  // totalAmount is over ALL matching collections, not just the rows returned.
  return okList(collections.map(c => ({
    id: c.id,
    collectionDate: c.collectionDate.toISOString().split("T")[0],
    amount: c.amount, paymentMode: c.paymentMode, reference: c.reference ?? "",
    notes: c.notes ?? "", createdAt: c.createdAt.toISOString().split("T")[0],
    customerId: c.customerId ?? "", customerName: c.customer?.name ?? "",
    company: c.customer?.company ?? "", orderNo: c.salesOrder?.orderNo ?? "",
    invoiceNo: c.invoice?.invoiceNo ?? "",
  })), { total: agg._count._all, limit: LIST_CAP, totalAmount: agg._sum.amount ?? 0,
    byMode: Object.fromEntries(modes.map((m) => [m.paymentMode, m._sum.amount ?? 0])) });
}

export async function POST(request: NextRequest) {
  const session = await requirePathAccess("/collections");
  if (!session) return err("Forbidden", 403);
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
