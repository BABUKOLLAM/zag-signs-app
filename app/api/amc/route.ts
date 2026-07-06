import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/amc");
  if (!session) return NextResponse.json(err("Forbidden"), { status: 403 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const rows = await prisma.aMCContract.findMany({
    where: status ? { status } : {},
    include: {
      customer: { select: { name: true, company: true, phone: true } },
      _count: { select: { serviceTickets: true } },
    },
    orderBy: { endDate: "asc" },
  });
  return NextResponse.json(ok(rows));
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/amc");
  if (!session) return NextResponse.json(err("Forbidden"), { status: 403 });
  const body = await req.json();
  const count = await prisma.aMCContract.count();
  const amcNo = `AMC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.aMCContract.create({
    data: {
      amcNo,
      customerId: body.customerId,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      annualValue: Number(body.annualValue ?? 0),
      visitFrequency: body.visitFrequency,
      notes: body.notes ?? null,
    },
    include: { customer: { select: { name: true, company: true } } },
  });
  return NextResponse.json(ok(row), { status: 201 });
}
