import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate } from "@/lib/api-helpers";
import { Branch } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const branch = searchParams.get("branch") as Branch | null;
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : null;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "24"));

  const where = {
    ...(employeeId ? { employeeId } : {}),
    ...(branch ? { branch } : {}),
    ...(year ? { year } : {}),
  };

  const [mwrs, total] = await Promise.all([
    prisma.mWR.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: { employee: { select: { name: true, role: true } } },
    }),
    prisma.mWR.count({ where }),
  ]);

  return NextResponse.json({
    data: mwrs.map((m) => ({
      id: m.id,
      month: m.month,
      year: m.year,
      branch: m.branch,
      department: m.department,
      salesTarget: m.salesTarget ?? 0,
      salesAchievement: m.salesAchievement ?? 0,
      conversionPct: m.conversionPct ?? 0,
      collectionPct: m.collectionPct ?? 0,
      productionAchievement: m.productionAchievement ?? 0,
      efficiencyPct: m.efficiencyPct ?? 0,
      totalCollected: m.totalCollected ?? 0,
      approvalStatus: m.approvalStatus,
      approvalStatusLabel: toLabel(m.approvalStatus),
      createdAt: toDate(m.createdAt),
      employee: m.employee?.name ?? "Unknown",
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { branch, department, month, year, employeeId, ...rest } = body;

  if (!branch) return err("Branch is required");
  if (!department) return err("Department is required");
  if (!month || !year) return err("Month and year are required");

  const mwr = await prisma.mWR.create({
    data: {
      branch: branch as Branch,
      department,
      month: Number(month),
      year: Number(year),
      employeeId: employeeId ?? null,
      salesTarget: rest.salesTarget ? Number(rest.salesTarget) : null,
      salesAchievement: rest.salesAchievement ? Number(rest.salesAchievement) : null,
      conversionPct: rest.conversionPct ? Number(rest.conversionPct) : null,
      collectionPct: rest.collectionPct ? Number(rest.collectionPct) : null,
      productionAchievement: rest.productionAchievement ? Number(rest.productionAchievement) : null,
      efficiencyPct: rest.efficiencyPct ? Number(rest.efficiencyPct) : null,
      rejectionCount: rest.rejectionCount ? Number(rest.rejectionCount) : null,
      rejectionReasons: rest.rejectionReasons?.trim() ?? null,
      totalCollected: rest.totalCollected ? Number(rest.totalCollected) : null,
    },
  });

  return ok({ id: mwr.id }, 201);
}
