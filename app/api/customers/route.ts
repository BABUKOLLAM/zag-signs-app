import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toDate, autoNo } from "@/lib/api-helpers";
import { Branch } from "@prisma/client";

function shape(c: Awaited<ReturnType<typeof prisma.customer.findFirst>>) {
  if (!c) return null;
  return {
    id: c.id,
    customerNo: c.customerNo,
    name: c.name,
    company: c.company,
    phone: c.phone,
    email: c.email ?? "",
    branch: c.branch,
    gstNo: c.gstNo ?? "",
    address: c.address ?? "",
    outstandingBalance: c.outstandingBalance,
    creditLimit: c.creditLimit,
    isActive: c.isActive,
    createdAt: toDate(c.createdAt),
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch") as Branch | null;
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "50"));

  const where = {
    ...(branch ? { branch } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { salesOrders: true } },
        salesOrders: { select: { totalAmount: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({
    data: customers.map((c) => ({
      ...shape(c),
      totalOrders: c._count.salesOrders,
      totalValue: c.salesOrders.reduce((s, o) => s + o.totalAmount, 0),
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, company, phone, email, branch, address, gstNo, creditLimit } = body;

  if (!name?.trim()) return err("Name is required");
  if (!company?.trim()) return err("Company is required");
  if (!phone?.trim()) return err("Phone is required");
  if (!branch) return err("Branch is required");

  const count = await prisma.customer.count();
  const customerNo = autoNo("C", count);

  const customer = await prisma.customer.create({
    data: {
      customerNo,
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      email: email?.trim() ?? null,
      branch: branch as Branch,
      address: address?.trim() ?? null,
      gstNo: gstNo?.trim() ?? null,
      creditLimit: Number(creditLimit) || 0,
    },
  });

  return ok(shape(customer), 201);
}
