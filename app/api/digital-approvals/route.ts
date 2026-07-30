import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/digital-approvals");
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const rows = await prisma.digitalApproval.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
    },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/digital-approvals");
  if (!session) return err("Forbidden", 403);
  const body = await req.json();
  const count = await prisma.digitalApproval.count();
  const approvalNo = `APR-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.digitalApproval.create({
    data: {
      approvalNo,
      type: body.type,
      relatedId: body.relatedId,
      relatedType: body.relatedType,
      customerName: body.customerName ?? null,
      customerEmail: body.customerEmail ?? null,
      customerPhone: body.customerPhone ?? null,
      documentUrl: body.documentUrl ?? null,
      notes: body.notes ?? null,
      createdById: (session.user as any).id,
    },
    include: { createdBy: { select: { name: true } } },
  });
  return ok(row, 201);
}
