import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const priority = searchParams.get("priority") || undefined;
  const rows = await prisma.serviceTicket.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    },
    include: {
      customer: { select: { name: true, company: true, phone: true } },
      amc: { select: { amcNo: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const body = await req.json();
  const count = await prisma.serviceTicket.count();
  const ticketNo = `SVC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.serviceTicket.create({
    data: {
      ticketNo,
      customerId: body.customerId,
      amcId: body.amcId || null,
      type: body.type,
      priority: body.priority ?? "MEDIUM",
      description: body.description,
      assignedToId: body.assignedToId || null,
      slaHours: Number(body.slaHours ?? 24),
    },
    include: {
      customer: { select: { name: true, company: true } },
      assignedTo: { select: { name: true } },
    },
  });
  return ok(row, 201);
}
