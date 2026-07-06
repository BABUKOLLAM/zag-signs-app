import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePathAccess("/projects");
  if (!session) return NextResponse.json(err("Forbidden"), { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const row = await prisma.project.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
    include: { customer: { select: { name: true } }, manager: { select: { name: true } }, milestones: true },
  });
  return NextResponse.json(ok(row));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePathAccess("/projects");
  if (!session) return NextResponse.json(err("Forbidden"), { status: 403 });
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json(ok({ deleted: true }));
}
