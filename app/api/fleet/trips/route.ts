import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/fleet");
  if (!session) return NextResponse.json(err("Forbidden"), { status: 403 });
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId") || undefined;
  const rows = await prisma.fleetTrip.findMany({
    where: vehicleId ? { vehicleId } : {},
    include: {
      vehicle: { select: { vehicleNo: true, make: true, model: true } },
      driver: { select: { name: true } },
    },
    orderBy: { startTime: "desc" },
    take: 100,
  });
  return NextResponse.json(ok(rows));
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/fleet");
  if (!session) return NextResponse.json(err("Forbidden"), { status: 403 });
  const body = await req.json();
  const count = await prisma.fleetTrip.count();
  const tripNo = `TRIP-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.fleetTrip.create({
    data: {
      tripNo,
      vehicleId: body.vehicleId,
      driverId: body.driverId || (session.user as any).id,
      startKm: Number(body.startKm),
      endKm: body.endKm ? Number(body.endKm) : null,
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : null,
      purpose: body.purpose,
      fromPlace: body.fromPlace,
      toPlace: body.toPlace,
      relatedOrderId: body.relatedOrderId || null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(ok(row), { status: 201 });
}
