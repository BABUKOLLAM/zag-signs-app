import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { err, requireSession } from "@/lib/api-helpers";
import { generateTallyXml, type TallyItem } from "@/lib/tally-xml";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { id } = await params;

  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv) return err("Invoice not found", 404);

  const items = (Array.isArray(inv.items) ? inv.items : []) as unknown as TallyItem[];

  const xml = generateTallyXml({
    invoiceNo:   inv.invoiceNo,
    invoiceDate: inv.invoiceDate.toISOString().split("T")[0],
    customerName: inv.customerName ?? "Customer",
    customerGst:  inv.customerGst  ?? undefined,
    branch:       inv.branch,
    subtotal:     inv.subtotal,
    taxRate:      inv.taxRate,
    taxAmount:    inv.taxAmount,
    discount:     inv.discount,
    totalAmount:  inv.totalAmount,
    items,
    notes:        inv.notes ?? undefined,
  });

  // Mark as Tally-exported
  await prisma.invoice.update({
    where: { id },
    data: { tallyExported: true, tallyExportedAt: new Date() },
  });

  const filename = `${inv.invoiceNo.replace(/\//g, "-")}.xml`;
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
