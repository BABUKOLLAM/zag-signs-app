import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return ok([]);

  const mode = "insensitive" as const;

  const [leads, customers, orders, quotations, employees] = await Promise.all([
    prisma.lead.findMany({
      where: { OR: [{ name: { contains: q, mode } }, { company: { contains: q, mode } }, { leadNo: { contains: q, mode } }] },
      select: { id: true, leadNo: true, name: true, company: true, status: true },
      take: 5,
    }),
    prisma.customer.findMany({
      where: { OR: [{ name: { contains: q, mode } }, { company: { contains: q, mode } }, { customerNo: { contains: q, mode } }] },
      select: { id: true, customerNo: true, name: true, company: true },
      take: 5,
    }),
    prisma.salesOrder.findMany({
      where: { OR: [{ orderNo: { contains: q, mode } }, { customer: { name: { contains: q, mode } } }] },
      select: { id: true, orderNo: true, status: true, customer: { select: { name: true } } },
      take: 5,
    }),
    prisma.quotation.findMany({
      where: { OR: [{ quotationNo: { contains: q, mode } }, { customer: { name: { contains: q, mode } } }] },
      select: { id: true, quotationNo: true, status: true, customer: { select: { name: true } } },
      take: 5,
    }),
    prisma.employee.findMany({
      where: { OR: [{ name: { contains: q, mode } }, { employeeNo: { contains: q, mode } }, { designation: { contains: q, mode } }] },
      select: { id: true, employeeNo: true, name: true, designation: true, department: true },
      take: 5,
    }),
  ]);

  const results = [
    ...leads.map(l      => ({ type: "Lead",      id: l.id, title: l.name, subtitle: l.leadNo + (l.company ? ` · ${l.company}` : ""), badge: l.status,  href: "/leads" })),
    ...customers.map(c  => ({ type: "Customer",  id: c.id, title: c.name, subtitle: c.customerNo + ` · ${c.company}`,                  badge: "",        href: "/customers" })),
    ...orders.map(o     => ({ type: "Order",      id: o.id, title: o.orderNo, subtitle: o.customer?.name ?? "",                          badge: o.status,  href: "/sales-orders" })),
    ...quotations.map(q => ({ type: "Quotation",  id: q.id, title: q.quotationNo, subtitle: q.customer?.name ?? "",                      badge: q.status,  href: "/quotations" })),
    ...employees.map(e  => ({ type: "Employee",   id: e.id, title: e.name, subtitle: e.designation + ` · ${e.department}`,               badge: e.employeeNo, href: "/hr" })),
  ];

  return ok(results);
}
