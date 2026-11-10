import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, toLabel, toDate, requireAnyPathAccess, rangeFromQuery } from "@/lib/api-helpers";
import { taskWhere } from "@/lib/list-filters";
import { ROUTE_ACCESS } from "@/lib/route-access";
import { validateText } from "@/lib/validation";
import { TaskStatus, TaskPriority } from "@prisma/client";

function shape(t: Awaited<ReturnType<typeof prisma.task.findFirst>> & {
  assignedTo?: { name: string } | null;
  createdBy?: { name: string } | null;
}) {
  if (!t) return null;
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    status: t.status,
    statusLabel: toLabel(t.status),
    priority: t.priority,
    priorityLabel: toLabel(t.priority),
    dueDate: toDate(t.dueDate),
    completedAt: toDate(t.completedAt),
    createdAt: toDate(t.createdAt),
    relatedTo: t.relatedTo ?? "",
    assignedTo: (t as { assignedTo?: { name: string } | null }).assignedTo?.name ?? "Unassigned",
    createdBy: (t as { createdBy?: { name: string } | null }).createdBy?.name ?? "",
  };
}

export async function GET(request: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.tasks);
  if (!session) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as TaskStatus | null;
  const priority = searchParams.get("priority") as TaskPriority | null;
  const assignedToId = searchParams.get("assignedToId");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "50"));

  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  const where = taskWhere({ status, priority, assignedToId, range });

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        assignedTo: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({
    data: tasks.map((t) => shape(t as Parameters<typeof shape>[0])),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.tasks);
  if (!session) return err("Forbidden", 403);

  const body = await request.json();
  const { title, description, priority, dueDate, assignedToId, relatedTo, relatedType } = body;

  const titleError = validateText(title, "Task Title");
  if (titleError) return err(titleError);
  if (relatedTo) {
    const relatedError = validateText(relatedTo, "Related To");
    if (relatedError) return err(relatedError);
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      priority: (priority as TaskPriority) ?? TaskPriority.MEDIUM,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedToId: assignedToId ?? null,
      relatedTo: relatedTo?.trim() ?? null,
      relatedType: relatedType?.trim() ?? null,
    },
    include: {
      assignedTo: { select: { name: true } },
    },
  });

  return ok(shape(task as Parameters<typeof shape>[0]), 201);
}
