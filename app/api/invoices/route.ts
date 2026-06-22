import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

const BRANCH_MAP: Record<string, string> = {
  TVM: "TVM", KTYM: "KTYM", EKM: "EKM", CLT: "CLT", HO: "HO",
};
function branchCode(b?: string | null): string {
  if (!b) return "HO";
  return BRANCH_MAP[b] ?? b.substring(0, 3).toUpperCase();
}

type InvoiceRow = {
  id: string; invoiceNo: string; invoiceDate: Date; dueDate: Date | null;
  subtotal: number; taxRate: number; taxAmount: number; discount: number; totalAmount: number;
  status: string; notes: string | null; branch: string; items: unknown;
  customerName: string | null; customerAddress: string | null;
  customerGst: string | null; customerPhone: string | null;
  salutation: string | null; attentionName: string | null;
  tallyExported: boolean; tallyExportedAt: Date | null; createdAt: Date;
  quotationId: string | null;
  quotation?: { quotationNo: string } | null;
  customerId: string | null;
  customer?: { name: string; company: string } | null;
  salesOrder?: { orderNo: string } | null;
};

function shape(inv: InvoiceRow) {
  return {
    id: inv.id, invoiceNo: inv.invoiceNo,
    invoiceDate: inv.invoiceDate.toISOString().split("T")[0],
    dueDate: inv.dueDate?.toISOString().split("T")[0] ?? "",
    subtotal: inv.subtotal, taxRate: inv.taxRate, taxAmount: inv.taxAmount,
    discount: inv.discount, totalAmount: inv.totalAmount,
    status: inv.status, notes: inv.notes ?? "", branch: inv.branch,
    items: inv.items ?? [],
    customerName: inv.customerName ?? inv.customer?.name ?? "",
    customerCompany: inv.customer?.company ?? "",
    customerAddress: inv.customerAddress ?? "",
    customerGst: inv.customerGst ?? "",
    customerPhone: inv.customerPhone ?? "",
    salutation: inv.salutation ?? "",
    attentionName: inv.attentionName ?? "",
    tallyExported: inv.tallyExported,
    tallyExportedAt: inv.tallyExportedAt?.toISOString() ?? null,
    quotationId: inv.quotationId ?? null,
    quotationNo: inv.quotation?.quotationNo ?? "",
    customerId: inv.customerId ?? null,
    orderNo: inv.salesOrder?.orderNo ?? "",
    createdAt: inv.createdAt.toISOString().split("T")[0],
  };
}

const INCLUDE = {
  quotation:  { select: { quotationNo: true } },
  customer:   { select: { name: true, company: true } },
  salesOrder: { select: { orderNo: true } },
};

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search") ?? "";

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search ? { OR: [
        { invoiceNo: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ]} : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: INCLUDE,
  });

  return ok(invoices.map((inv) => shape(inv as InvoiceRow)));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const su = session.user as { id?: string; branch?: string };
  const branch = branchCode(su.branch);

  const body = await request.json() as {
    quotationId?: string; customerId?: string;
    customerName?: string; customerAddress?: string;
    customerGst?: string; customerPhone?: string;
    salutation?: string; attentionName?: string;
    subtotal?: number; taxRate?: number; taxAmount?: number;
    discount?: number; totalAmount?: number;
    items?: unknown[]; dueDate?: string; notes?: string; salesOrderId?: string;
  };

  let d = { ...body };

  // Auto-populate from quotation when quotationId is given
  if (body.quotationId) {
    const q = await prisma.quotation.findUnique({
      where: { id: body.quotationId },
      include: {
        items: true,
        customer: { select: { id: true, name: true, company: true, address: true, gstNo: true, phone: true } },
      },
    });
    if (!q) return err("Quotation not found");
    d = {
      ...d,
      customerId:      q.customerId          ?? d.customerId,
      customerName:    q.customer?.name       ?? d.customerName,
      customerAddress: q.customer?.address    ?? d.customerAddress ?? "",
      customerGst:     q.customer?.gstNo      ?? d.customerGst     ?? "",
      customerPhone:   q.customer?.phone      ?? d.customerPhone    ?? "",
      salutation:      q.salutation           ?? d.salutation,
      attentionName:   q.attentionName        ?? d.attentionName,
      subtotal:        q.subtotal,
      taxRate:         q.taxRate,
      taxAmount:       q.tax,
      discount:        q.discount,
      totalAmount:     q.total,
      items: q.items.map((i) => ({
        description: i.description, qty: i.qty, unit: i.unit,
        unitPrice: i.unitPrice, total: i.total,
      })),
    };
  }

  const subtotal    = Number(d.subtotal    ?? 0);
  const taxRate     = Number(d.taxRate     ?? 0);
  const taxAmount   = Number(d.taxAmount   ?? 0);
  const discount    = Number(d.discount    ?? 0);
  const totalAmount = Number(d.totalAmount ?? subtotal + taxAmount - discount);
  if (totalAmount <= 0) return err("totalAmount must be > 0");

  const branchCount = await prisma.invoice.count({ where: { branch } });
  const invoiceNo   = `ZAG/INV/${branch}/${String(branchCount + 1).padStart(3, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo, branch, subtotal, taxRate, taxAmount, discount, totalAmount,
      dueDate:         d.dueDate         ? new Date(d.dueDate) : null,
      notes:           d.notes?.trim()   ?? null,
      customerName:    d.customerName    ?? null,
      customerAddress: d.customerAddress ?? null,
      customerGst:     d.customerGst     ?? null,
      customerPhone:   d.customerPhone   ?? null,
      salutation:      d.salutation      ?? null,
      attentionName:   d.attentionName   ?? null,
      items:           (d.items ?? [])   as never,
      quotationId:     d.quotationId     ?? null,
      customerId:      d.customerId      ?? null,
      salesOrderId:    d.salesOrderId    ?? null,
      status: "PENDING",
    },
    include: INCLUDE,
  });

  return ok(shape(invoice as InvoiceRow), 201);
}
