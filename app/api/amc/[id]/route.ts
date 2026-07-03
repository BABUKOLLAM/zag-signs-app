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
  const row = await prisma.aMCContract.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.annualValue !== undefined && { annualValue: Number(body.annualValue) }),
      ...(body.endDate !== undefined && { endDate: new Date(body.endDate) }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json(ok(row));
}
