import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, err } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch") || undefined;
  const rows = await prisma.vendor.findMany({
    where: branch ? { branch: branch as any } : {},
    orderBy: { name: "asc" },
  });
  return NextResponse.json(ok(rows));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const body = await req.json();
  const count = await prisma.vendor.count();
  const vendorCode = `VEN-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.vendor.create({
    data: {
      vendorCode,
      name: body.name,
      company: body.company ?? null,
      phone: body.phone,
      email: body.email ?? null,
      address: body.address ?? null,
      gstin: body.gstin ?? null,
      category: body.category,
      branch: body.branch,
      creditDays: Number(body.creditDays ?? 30),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(ok(row), { status: 201 });
}
