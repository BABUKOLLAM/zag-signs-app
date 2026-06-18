import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-helpers";

// Public portal endpoint — no auth required, scoped by customerNo.
// Returns only non-sensitive customer-facing data.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerNo = searchParams.get("customer")?.trim();
  if (!customerNo) return err("customer parameter required");

  const customer = await prisma.customer.findFirst({
    where: { customerNo },
    select: {
      id: true, customerNo: true, name: true, company: true, phone: true, email: true,
    },
  });
  if (!customer) return err("Customer not found", 404);

  const [quotations, orders, invoices] = await Promise.all([
    prisma.quotation.findMany({
      where: { customerId: customer.id },
      select: { quotationNo: true, total: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.salesOrder.findMany({
      where: { customerId: customer.id },
      select: { orderNo: true, totalAmount: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.invoice.findMany({
      where: { salesOrder: { customerId: customer.id } },
      select: { invoiceNo: true, totalAmount: true, status: true, dueDate: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return ok({
    customer,
    quotations: quotations.map(q => ({ ...q, amount: q.total, createdAt: q.createdAt.toISOString() })),
    orders:     orders.map(o     => ({ ...o, createdAt: o.createdAt.toISOString() })),
    invoices:   invoices.map(i   => ({ ...i, dueDate: i.dueDate?.toISOString() ?? null })),
  });
}
