import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toDate } from "@/lib/api-helpers";
import { Branch } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const c = await prisma.customer.findUnique({
    where: { id },
    include: {
      salesOrders: { orderBy: { createdAt: "desc" }, take: 10 },
      complaints: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { salesOrders: true } },
    },
  });
  if (!c) return err("Customer not found", 404);

  return ok({
    id: c.id,
    customerNo: c.customerNo,
    name: c.name,
    company: c.company,
    phone: c.phone,
    email: c.email ?? "",
    branch: c.branch,
    gstNo: c.gstNo ?? "",
    address: c.address ?? "",
    creditLimit: c.creditLimit,
    outstandingBalance: c.outstandingBalance,
    isActive: c.isActive,
    createdAt: toDate(c.createdAt),
    totalOrders: c._count.salesOrders,
    totalValue: c.salesOrders.reduce((s, o) => s + o.totalAmount, 0),
    recentOrders: c.salesOrders.map((o) => ({
      id: o.id,
      orderNo: o.orderNo,
      status: o.status,
      totalAmount: o.totalAmount,
      deliveryDate: toDate(o.deliveryDate),
    })),
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

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.company !== undefined && { company: body.company.trim() }),
      ...(body.phone !== undefined && { phone: body.phone.trim() }),
      ...(body.email !== undefined && { email: body.email.trim() || null }),
      ...(body.branch !== undefined && { branch: body.branch as Branch }),
      ...(body.address !== undefined && { address: body.address.trim() || null }),
      ...(body.gstNo !== undefined && { gstNo: body.gstNo.trim() || null }),
      ...(body.creditLimit !== undefined && { creditLimit: Number(body.creditLimit) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
    },
  });

  return ok({ id: customer.id, customerNo: customer.customerNo });
}
