import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, err } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch") || undefined;
  const rows = await prisma.vehicle.findMany({
    where: branch ? { branch: branch as any } : {},
    include: {
      driver: { select: { name: true } },
      _count: { select: { trips: true, fuelLogs: true } },
    },
    orderBy: { vehicleNo: "asc" },
  });
  return NextResponse.json(ok(rows));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const body = await req.json();
  const row = await prisma.vehicle.create({
    data: {
      vehicleNo: body.vehicleNo,
      make: body.make,
      model: body.model,
      type: body.type,
      branch: body.branch,
      driverId: body.driverId || null,
      insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
      pucExpiry: body.pucExpiry ? new Date(body.pucExpiry) : null,
      nextService: body.nextService ? new Date(body.nextService) : null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(ok(row), { status: 201 });
}
