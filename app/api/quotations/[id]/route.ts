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
      customer:       { select: { id: true, name: true, company: true, address: true, gstNo: true, phone: true } },
      items:          true,
      proposedBy:     { select: { name: true, role: true, branch: true } },
      salesOrders:    { select: { id: true, orderNo: true, status: true } },
      parentQuotation:{ select: { id: true, quotationNo: true, createdAt: true, status: true, revisionNote: true } },
      revisions:      { select: { id: true, quotationNo: true, createdAt: true, status: true, revisionNote: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!q) return err("Quotation not found", 404);

  // Build version history: root → ...revisions → (current if root has revisions)
  const isRevision = !!q.parentQuotationId;
  let versionHistory: { quotationNo: string; date: string; statusLabel: string; note: string; isCurrent: boolean }[] = [];

  if (isRevision && q.parentQuotation) {
    // Fetch all siblings (other revisions of same parent)
    const siblings = await prisma.quotation.findMany({
      where: { parentQuotationId: q.parentQuotationId! },
      select: { id: true, quotationNo: true, createdAt: true, status: true, revisionNote: true },
      orderBy: { createdAt: "asc" },
    });
    versionHistory = [
      { quotationNo: q.parentQuotation.quotationNo, date: toDate(q.parentQuotation.createdAt), statusLabel: STATUS_LABELS[q.parentQuotation.status] ?? q.parentQuotation.status, note: q.parentQuotation.revisionNote ?? "Original", isCurrent: false },
      ...siblings.map(s => ({ quotationNo: s.quotationNo, date: toDate(s.createdAt), statusLabel: STATUS_LABELS[s.status] ?? s.status, note: s.revisionNote ?? "", isCurrent: s.id === id })),
    ];
  } else if (q.revisions.length > 0) {
    // This is the root; list itself + all revisions
    versionHistory = [
      { quotationNo: q.quotationNo, date: toDate(q.createdAt), statusLabel: STATUS_LABELS[q.status] ?? q.status, note: "Original", isCurrent: true },
      ...q.revisions.map(r => ({ quotationNo: r.quotationNo, date: toDate(r.createdAt), statusLabel: STATUS_LABELS[r.status] ?? r.status, note: r.revisionNote ?? "", isCurrent: false })),
    ];
  }

  return ok({
    id: q.id,
    quotationNo: q.quotationNo,
    status:      q.status,
    statusLabel: STATUS_LABELS[q.status] ?? q.status,
    customer:    q.customer ? { id: q.customer.id, name: q.customer.name, company: q.customer.company } : null,
    customerAddress: q.customer?.address ?? "",
    customerGst:     q.customer?.gstNo  ?? "",
    customerPhone:   q.customer?.phone  ?? "",
    clientCode:      (q as { clientCode?: string | null }).clientCode ?? "",
    parentQuotationId: q.parentQuotationId ?? null,
    revisionNote:    (q as { revisionNote?: string | null }).revisionNote ?? "",
    versionHistory,
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

  const scalar: Record<string, unknown> = {
    ...(body.status             !== undefined && { status:             body.status as QuotationStatus }),
    ...(body.validUntil         !== undefined && { validUntil:         body.validUntil ? new Date(body.validUntil as string) : null }),
    ...(body.terms              !== undefined && { terms:              (body.terms as string).trim() || null }),
    ...(body.notes              !== undefined && { notes:              (body.notes as string).trim() || null }),
    ...(body.salutation         !== undefined && { salutation:         (body.salutation as string) || null }),
    ...(body.attentionSalutation !== undefined && { attentionSalutation: (body.attentionSalutation as string) || null }),
    ...(body.attentionName      !== undefined && { attentionName:      (body.attentionName as string).trim() || null }),
  };

  // Full edit: replace items and recalculate totals when items are provided
  if (body.items && Array.isArray(body.items)) {
    const items = body.items as { description: string; qty: number; unit: string; unitPrice: number }[];
    const taxRate  = Number(body.taxRate  ?? 0);
    const discount = Number(body.discount ?? 0);
    const subtotal = items.reduce((s, i) => s + Number(i.qty) * Number(i.unitPrice), 0);
    const tax      = Math.round(subtotal * taxRate) / 100;
    const total    = subtotal + tax - discount;

    Object.assign(scalar, { subtotal, taxRate, tax, discount, total });

    await prisma.quotationItem.deleteMany({ where: { quotationId: id } });
    await prisma.quotationItem.createMany({
      data: items.map((i) => ({
        quotationId:  id,
        description:  i.description,
        qty:          Number(i.qty),
        unit:         i.unit || "Nos",
        unitPrice:    Number(i.unitPrice),
        total:        Number(i.qty) * Number(i.unitPrice),
      })),
    });
  }

  const q = await prisma.quotation.update({
    where: { id },
    data:  scalar,
  });

  return ok({ id: q.id, quotationNo: q.quotationNo, status: q.status, statusLabel: STATUS_LABELS[q.status] ?? q.status });
}
