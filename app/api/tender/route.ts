import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess, rangeFromQuery } from "@/lib/api-helpers";
import { tenderWhere } from "@/lib/list-filters";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/tender");
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const branch = searchParams.get("branch") || undefined;
  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  const rows = await prisma.tender.findMany({
    where: tenderWhere({ status, branch, range }),
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/tender");
  if (!session) return err("Forbidden", 403);
  const body = await req.json();
  const count = await prisma.tender.count();
  const tenderNo = `TND-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.tender.create({
    data: {
      tenderNo,
      title: body.title,
      client: body.client,
      branch: body.branch,
      status: body.status ?? "OPEN",
      bidValue: Number(body.bidValue ?? 0),
      awardedValue: body.awardedValue ? Number(body.awardedValue) : undefined,
      rfpDate: body.rfpDate ? new Date(body.rfpDate) : undefined,
      submitDeadline: body.submitDeadline ? new Date(body.submitDeadline) : undefined,
      openingDate: body.openingDate ? new Date(body.openingDate) : undefined,
      competitors: body.competitors ?? undefined,
      boqUrl: body.boqUrl ?? undefined,
      notes: body.notes ?? undefined,
      createdById: (session.user as any).id,
    },
  });
  return ok(row, 201);
}
