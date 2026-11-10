import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess, rangeFromQuery } from "@/lib/api-helpers";
import { projectWhere } from "@/lib/list-filters";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/projects");
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const branch = searchParams.get("branch") || undefined;
  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  const rows = await prisma.project.findMany({
    where: projectWhere({ status, branch, range }),
    include: {
      customer: { select: { name: true, company: true } },
      manager: { select: { name: true } },
      milestones: { orderBy: { dueDate: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/projects");
  if (!session) return err("Forbidden", 403);
  const body = await req.json();
  const count = await prisma.project.count();
  const projectNo = `PRJ-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.project.create({
    data: {
      projectNo,
      name: body.name,
      customerId: body.customerId || null,
      salesOrderId: body.salesOrderId || null,
      branch: body.branch,
      status: body.status ?? "PLANNING",
      managerId: body.managerId || (session.user as any).id,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      budget: Number(body.budget ?? 0),
      notes: body.notes ?? null,
      milestones: {
        create: (body.milestones ?? []).map((m: any) => ({
          title: m.title,
          dueDate: new Date(m.dueDate),
          status: "PENDING",
        })),
      },
    },
    include: {
      customer: { select: { name: true } },
      manager: { select: { name: true } },
      milestones: true,
    },
  });
  return ok(row, 201);
}
