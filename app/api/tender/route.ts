import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, err } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const branch = searchParams.get("branch") || undefined;
  const rows = await prisma.tender.findMany({
    where: { ...(status ? { status } : {}), ...(branch ? { branch: branch as any } : {}) },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(ok(rows));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const body = await req.json();
  const count = await prisma.tender.count();
  const tenderNo = `TND-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.tender.create({
    data: {
      tenderNo,
      title: body.title,
      client: body.client,
      branch: body.branch,
      status: body.status ?? "OPEN",
      bidValue: Number(body.bidValue ?? 0),
      awardedValue: body.awardedValue ? Number(body.awardedValue) : undefined,
      rfpDate: body.rfpDate ? new Date(body.rfpDate) : undefined,
      submitDeadline: body.submitDeadline ? new Date(body.submitDeadline) : undefined,
      openingDate: body.openingDate ? new Date(body.openingDate) : undefined,
      competitors: body.competitors ?? undefined,
      boqUrl: body.boqUrl ?? undefined,
      notes: body.notes ?? undefined,
      createdById: (session.user as any).id,
    },
  });
  return NextResponse.json(ok(row), { status: 201 });
}
