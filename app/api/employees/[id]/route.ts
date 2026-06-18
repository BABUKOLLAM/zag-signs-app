import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const emp = await prisma.employee.findUnique({ where: { id } });
  if (!emp) return err("Employee not found", 404);
  const updated = await prisma.employee.update({
    where: { id },
    data: {
      ...(body.name        ? { name: String(body.name) }             : {}),
      ...(body.designation ? { designation: String(body.designation) } : {}),
      ...(body.department  ? { department: String(body.department) }  : {}),
      ...(body.branch      ? { branch: body.branch as never }          : {}),
      ...(body.phone !== undefined  ? { phone: body.phone as string | null }  : {}),
      ...(body.email !== undefined  ? { email: body.email as string | null }  : {}),
      ...(body.salary !== undefined ? { salary: Number(body.salary) }         : {}),
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) }  : {}),
      ...(body.dateOfJoining ? { dateOfJoining: new Date(body.dateOfJoining as string) } : {}),
    },
  });
  return ok(updated);
}
