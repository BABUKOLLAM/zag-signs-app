import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate } from "@/lib/api-helpers";
import { Branch, ApprovalStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const branch = searchParams.get("branch") as Branch | null;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "30"));

  const where = {
    ...(employeeId ? { employeeId } : {}),
    ...(branch ? { branch } : {}),
  };

  const [wwrs, total] = await Promise.all([
    prisma.wWR.findMany({
      where,
      orderBy: { weekFrom: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { employee: { select: { name: true, role: true } } },
    }),
    prisma.wWR.count({ where }),
  ]);

  return NextResponse.json({
    data: wwrs.map((w) => ({
      id: w.id,
      weekFrom: toDate(w.weekFrom),
      weekTo: toDate(w.weekTo),
      branch: w.branch,
      department: w.department,
      weeklyTarget: w.weeklyTarget,
      weeklyAchievement: w.weeklyAchievement,
      challenges: w.challenges ?? "",
      actionPlan: w.actionPlan ?? "",
      escalationsNeeded: w.escalationsNeeded,
      approvalStatus: w.approvalStatus,
      approvalStatusLabel: toLabel(w.approvalStatus),
      createdAt: toDate(w.createdAt),
      employee: w.employee?.name ?? "Unknown",
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { branch, department, weekFrom, weekTo, weeklyTarget, weeklyAchievement, challenges, actionPlan, escalationsNeeded, escalationDetails, employeeId } = body;

  if (!branch) return err("Branch is required");
  if (!department) return err("Department is required");
  if (!weekFrom || !weekTo) return err("Week dates are required");

  const wwr = await prisma.wWR.create({
    data: {
      branch: branch as Branch,
      department,
      weekFrom: new Date(weekFrom),
      weekTo: new Date(weekTo),
      weeklyTarget: Number(weeklyTarget) || 0,
      weeklyAchievement: Number(weeklyAchievement) || 0,
      challenges: challenges?.trim() ?? null,
      actionPlan: actionPlan?.trim() ?? null,
      escalationsNeeded: Boolean(escalationsNeeded),
      escalationDetails: escalationDetails?.trim() ?? null,
      employeeId: employeeId ?? null,
    },
  });

  return ok({ id: wwr.id }, 201);
}
