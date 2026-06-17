import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate } from "@/lib/api-helpers";
import { VisitType, VisitOutcome } from "@prisma/client";

function shape(v: Awaited<ReturnType<typeof prisma.fieldVisit.findFirst>> & {
  employee?: { name: string } | null;
}) {
  if (!v) return null;
  return {
    id: v.id,
    date: toDate(v.date),
    visitType: v.visitType,
    visitTypeLabel: toLabel(v.visitType),
    outcome: v.outcome,
    outcomeLabel: toLabel(v.outcome),
    customerName: v.customerName,
    location: v.location ?? "",
    startTime: v.startTime ?? "",
    endTime: v.endTime ?? "",
    orderValue: v.orderValue ?? 0,
    nextAction: v.nextAction ?? "",
    notes: v.notes ?? "",
    createdAt: toDate(v.createdAt),
    employee: (v as { employee?: { name: string } | null }).employee?.name ?? "",
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "50"));

  const where = {
    ...(employeeId ? { employeeId } : {}),
  };

  const [visits, total] = await Promise.all([
    prisma.fieldVisit.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { employee: { select: { name: true } } },
    }),
    prisma.fieldVisit.count({ where }),
  ]);

  return NextResponse.json({
    data: visits.map((v) => shape(v as Parameters<typeof shape>[0])),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { date, visitType, outcome, customerName, location, startTime, endTime, orderValue, nextAction, notes, employeeId, customerId } = body;

  if (!customerName?.trim()) return err("Customer name is required");
  if (!visitType) return err("Visit type is required");
  if (!outcome) return err("Outcome is required");

  const visit = await prisma.fieldVisit.create({
    data: {
      date: date ? new Date(date) : new Date(),
      visitType: visitType as VisitType,
      outcome: outcome as VisitOutcome,
      customerName: customerName.trim(),
      location: location?.trim() ?? null,
      startTime: startTime?.trim() ?? null,
      endTime: endTime?.trim() ?? null,
      orderValue: orderValue ? Number(orderValue) : null,
      nextAction: nextAction?.trim() ?? null,
      notes: notes?.trim() ?? null,
      employeeId: employeeId ?? null,
      customerId: customerId ?? null,
    },
    include: { employee: { select: { name: true } } },
  });

  return ok(shape(visit as Parameters<typeof shape>[0]), 201);
}
