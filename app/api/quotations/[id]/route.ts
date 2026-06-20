import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toDate } from "@/lib/api-helpers";
import { QuotationStatus } from "@prisma/client";

const STATUS_LABELS: Record<string, string> = {
  DRAFT:"Draft", SENT:"Sent", EMAIL:"Sent via Email",
  WHATSAPP:"Sent via WhatsApp", SUBMITTED:"Submitted",
  APPROVED:"Approved", REJECTED:"Rejected", EXPIRED:"Expired",
};

const ROLE_DISPLAY: Record<string, string> = {
  MD:"Managing Director", AVP:"AVP",
  BUSINESS_MANAGER:"Business Manager", SALES_EXECUTIVE:"Sales Executive",
  CRES:"CRES Executive", PRODUCTION:"Production", ACCOUNTS:"Accounts",
  HR:"HR", IT_ADMIN:"IT Admin", CONSULTANT:"Consultant",
};

function bc(b: string | null | undefined) {
  const m: Record<string, string> = {TVM:"TVM",KTYM:"KTM",EKM:"EKM",CLT:"CLT",All:"HO","":"HO"};
  if (!b) return "HO";
  return m[b] ?? b.substring(0,3).toUpperCase();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const q = await prisma.quotation.findUnique({
    where: { id },
    include: {
      customer:   true,
      items:      true,
      proposedBy: { select: { name: true, role: true, branch: true } },
      salesOrders: { select: { id: true, orderNo: true, status: true } },
    },
  });
  if (!q) return err("Quotation not found", 404);

  return ok({
    id: q.id,
    quotationNo: q.quotationNo,
    status:      q.status,
    statusLabel: STATUS_LABELS[q.status] ?? q.status,
    customer:    q.customer ? { id: q.customer.id, name: q.customer.name, company: q.customer.company } : null,
    items: q.items.map((i) => ({
      id: i.id, description: i.description,
      qty: i.qty, unit: i.unit, unitPrice: i.unitPrice, total: i.total,
    })),
    subtotal:   q.subtotal,
    taxRate:    q.taxRate,
    tax:        q.tax,
    discount:   q.discount,
    total:      q.total,
    validUntil: toDate(q.validUntil),
    terms:      q.terms ?? "",
    notes:      q.notes ?? "",
    createdAt:  toDate(q.createdAt),
    salutation:          q.salutation          ?? "",
    attentionSalutation: q.attentionSalutation ?? "",
    attentionName:       q.attentionName       ?? "",
    branch:              q.branch              ?? "",
    proposedByName:        q.proposedBy?.name  ?? "",
    proposedByDesignation: ROLE_DISPLAY[q.proposedBy?.role ?? ""] ?? (q.proposedBy?.role ?? ""),
    proposedByBranch:      bc(q.proposedBy?.branch),
    salesOrders: q.salesOrders,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;

  const q = await prisma.quotation.update({
    where: { id },
    data: {
      ...(body.status      !== undefined && { status:      body.status as QuotationStatus }),
      ...(body.validUntil  !== undefined && { validUntil:  body.validUntil ? new Date(body.validUntil as string) : null }),
      ...(body.terms       !== undefined && { terms:       (body.terms as string).trim() || null }),
      ...(body.notes       !== undefined && { notes:       (body.notes as string).trim() || null }),
    },
  });

  return ok({ id: q.id, quotationNo: q.quotationNo, status: q.status, statusLabel: STATUS_LABELS[q.status] ?? q.status });
}
