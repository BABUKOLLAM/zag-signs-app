import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, err } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const row = await prisma.tender.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.client !== undefined && { client: body.client }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.bidValue !== undefined && { bidValue: Number(body.bidValue) }),
      ...(body.awardedValue !== undefined && { awardedValue: body.awardedValue ? Number(body.awardedValue) : null }),
      ...(body.submitDeadline !== undefined && { submitDeadline: body.submitDeadline ? new Date(body.submitDeadline) : null }),
      ...(body.openingDate !== undefined && { openingDate: body.openingDate ? new Date(body.openingDate) : null }),
      ...(body.competitors !== undefined && { competitors: body.competitors }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json(ok(row));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const { id } = await params;
  await prisma.tender.delete({ where: { id } });
  return NextResponse.json(ok({ deleted: true }));
}
