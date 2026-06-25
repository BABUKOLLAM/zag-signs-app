import { NextRequest } from "next/server";
import { requireSession, ok, err, autoNo } from "@/lib/api-helpers";
import { PrismaClient } from "@prisma/client";
import { normBranch } from "@/lib/bulk-helpers";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const searchParams = req.nextUrl.searchParams;
    const branch = searchParams.get("branch");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (branch) where.branch = normBranch(branch);
    if (status) where.status = status;
    if (type) where.type = type;

    const machines = await prisma.machine.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    return new Response(JSON.stringify(ok(machines)), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const body = await req.json();

    // Generate machine number
    const count = await prisma.machine.count();
    const machineNo = autoNo("M", count);

    const machine = await prisma.machine.create({
      data: {
        machineNo,
        name: body.name,
        type: body.type,
        printType: body.printType || null,
        model: body.model || null,
        location: body.location || null,
        branch: body.branch || "TVM",
        hourlyRate: body.hourlyRate || 0,
        capacityPerHour: body.capacityPerHour || null,
        notes: body.notes || null,
      },
    });

    return new Response(JSON.stringify(ok(machine)), { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}
