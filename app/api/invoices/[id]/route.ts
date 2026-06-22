import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { id } = await params;
  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: {
      quotation:   { select: { quotationNo: true } },
      customer:    { select: { name: true, company: true } },
      salesOrder:  { select: { orderNo: true } },
      collections: { select: { id: true, amount: true, collectionDate: true, paymentMode: true, reference: true } },
    },
  });
  if (!inv) return err("Invoice not found", 404);
  return ok(inv);
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { id } = await params;
  const body = await request.json() as {
    status?: string; notes?: string; dueDate?: string; tallyExported?: boolean;
  };
  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      ...(body.status  !== undefined ? { status: body.status as never }        : {}),
      ...(body.notes   !== undefined ? { notes: body.notes }                   : {}),
      ...(body.dueDate !== undefined ? { dueDate: new Date(body.dueDate) }     : {}),
      ...(body.tallyExported === true
        ? { tallyExported: true, tallyExportedAt: new Date() }
        : {}),
    },
  });
  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { id } = await params;
  await prisma.invoice.delete({ where: { id } });
  return ok({ deleted: true });
}
