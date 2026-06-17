import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel } from "@/lib/api-helpers";
import { TaskStatus, TaskPriority } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const isCompleting = body.status === TaskStatus.COMPLETED;

  const t = await prisma.task.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description.trim() || null }),
      ...(body.status !== undefined && { status: body.status as TaskStatus }),
      ...(body.priority !== undefined && { priority: body.priority as TaskPriority }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId || null }),
      ...(isCompleting && { completedAt: new Date() }),
    },
  });

  return ok({ id: t.id, status: t.status, statusLabel: toLabel(t.status) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return ok({ deleted: true });
}
