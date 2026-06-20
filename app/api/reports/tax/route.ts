import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, requireSession } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to   = searchParams.get("to");

  const dateFilter = {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to   ? { lte: new Date(to + "T23:59:59.999Z") } : {}),
  };

  const quotations = await prisma.quotation.findMany({
    where: {
      status: { notIn: ["DRAFT", "REJECTED", "EXPIRED"] },
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
    },
    select: {
      id: true,
      quotationNo: true,
      taxRate: true,
      subtotal: true,
      tax: true,
      total: true,
      createdAt: true,
      customer: { select: { company: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by taxRate
  const rateMap: Record<number, { count: number; subtotal: number; taxAmount: number; total: number }> = {};
  for (const q of quotations) {
    const r = q.taxRate ?? 0;
    if (!rateMap[r]) rateMap[r] = { count: 0, subtotal: 0, taxAmount: 0, total: 0 };
    rateMap[r].count++;
    rateMap[r].subtotal   += q.subtotal;
    rateMap[r].taxAmount  += q.tax;
    rateMap[r].total      += q.total;
  }

  const summary = Object.entries(rateMap)
    .map(([rate, s]) => ({ taxRate: Number(rate), ...s }))
    .sort((a, b) => a.taxRate - b.taxRate);

  const totals = {
    count:     quotations.length,
    subtotal:  quotations.reduce((s, q) => s + q.subtotal, 0),
    taxAmount: quotations.reduce((s, q) => s + q.tax, 0),
    total:     quotations.reduce((s, q) => s + q.total, 0),
  };

  return ok({ summary, totals, quotations });
}
