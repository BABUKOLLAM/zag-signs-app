import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePathAccess("/amc");
  if (!session) return err("Forbidden", 403);
  const { id } = await params;
  const body = await req.json();
  const row = await prisma.aMCContract.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.annualValue !== undefined && { annualValue: Number(body.annualValue) }),
      ...(body.endDate !== undefined && { endDate: new Date(body.endDate) }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return ok(row);
}
