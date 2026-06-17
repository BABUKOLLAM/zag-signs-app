import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toDate } from "@/lib/api-helpers";
import { Branch } from "@prisma/client";

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

  const [dars, total] = await Promise.all([
    prisma.dAR.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { employee: { select: { name: true, role: true } } },
    }),
    prisma.dAR.count({ where }),
  ]);

  return NextResponse.json({
    data: dars.map((d) => ({
      id: d.id,
      date: toDate(d.date),
      branch: d.branch,
      department: d.department,
      customerVisits: d.customerVisits,
      callsMade: d.callsMade,
      followUpsDone: d.followUpsDone,
      ordersBooked: d.ordersBooked,
      ordersValue: d.ordersValue,
      collectionsAmount: d.collectionsAmount,
      travelKm: d.travelKm,
      productionOutput: d.productionOutput ?? "",
      outputQty: d.outputQty,
      dispatches: d.dispatches,
      createdAt: toDate(d.createdAt),
      employee: d.employee?.name ?? "Unknown",
      employeeRole: d.employee?.role ?? "",
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { branch, department, date, employeeId, ...rest } = body;

  if (!branch) return err("Branch is required");
  if (!department) return err("Department is required");

  const dar = await prisma.dAR.create({
    data: {
      branch: branch as Branch,
      department,
      date: date ? new Date(date) : new Date(),
      employeeId: employeeId ?? null,
      customerVisits: Number(rest.customerVisits) || 0,
      callsMade: Number(rest.callsMade) || 0,
      followUpsDone: Number(rest.followUpsDone) || 0,
      ordersBooked: Number(rest.ordersBooked) || 0,
      ordersValue: Number(rest.ordersValue) || 0,
      collectionsAmount: Number(rest.collectionsAmount) || 0,
      travelFrom: rest.travelFrom?.trim() ?? null,
      travelTo: rest.travelTo?.trim() ?? null,
      travelKm: Number(rest.travelKm) || 0,
      productionOutput: rest.productionOutput?.trim() ?? null,
      outputQty: Number(rest.outputQty) || 0,
      downtimeHours: Number(rest.downtimeHours) || 0,
      downtimeReason: rest.downtimeReason?.trim() ?? null,
      dispatches: Number(rest.dispatches) || 0,
      dispatchDetails: rest.dispatchDetails?.trim() ?? null,
      accountsCollections: Number(rest.accountsCollections) || 0,
      collectionFrom: rest.collectionFrom?.trim() ?? null,
      vendorPayments: Number(rest.vendorPayments) || 0,
      vendorDetails: rest.vendorDetails?.trim() ?? null,
    },
  });

  return ok({ id: dar.id }, 201);
}
