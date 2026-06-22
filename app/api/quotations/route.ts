import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toDate } from "@/lib/api-helpers";
import { QuotationStatus } from "@prisma/client";
import { makeClientCode } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  DRAFT:     "Draft",
  SENT:      "Sent",
  EMAIL:     "Sent via Email",
  WHATSAPP:  "Sent via WhatsApp",
  SUBMITTED: "Submitted",
  APPROVED:  "Approved",
  REJECTED:  "Rejected",
  EXPIRED:   "Expired",
};

const ROLE_DISPLAY: Record<string, string> = {
  MD: "Managing Director", AVP: "AVP",
  BUSINESS_MANAGER: "Business Manager", SALES_EXECUTIVE: "Sales Executive",
  CRES: "CRES Executive", PRODUCTION: "Production", ACCOUNTS: "Accounts",
  HR: "HR", IT_ADMIN: "IT Admin", CONSULTANT: "Consultant",
};

function getBranchCode(branch: string | null | undefined): string {
  const map: Record<string, string> = { TVM: "TVM", KTYM: "KTM", EKM: "EKM", CLT: "CLT", All: "HO", "": "HO" };
  if (!branch) return "HO";
  return map[branch] ?? branch.substring(0, 3).toUpperCase();
}

type QRow = {
  id: string; quotationNo: string; status: string;
  subtotal: number; taxRate: number; tax: number; discount: number; total: number;
  validUntil: Date | null; terms: string | null; notes: string | null; createdAt: Date;
  customerId: string | null; salutation: string | null;
  attentionSalutation: string | null; attentionName: string | null; branch: string | null;
  clientCode: string | null; parentQuotationId: string | null;
  customer?: { name: string; company: string } | null;
  items?: { description: string; qty: number; unit: string; unitPrice: number; total: number }[];
  proposedBy?: { name: string; role: string; branch: string | null } | null;
};

function shape(q: QRow) {
  return {
    id: q.id, quotationNo: q.quotationNo, status: q.status,
    statusLabel:         STATUS_LABELS[q.status] ?? q.status,
    subtotal: q.subtotal, taxRate: q.taxRate, tax: q.tax,
    discount: q.discount, total: q.total,
    validUntil: toDate(q.validUntil), terms: q.terms ?? "", notes: q.notes ?? "",
    createdAt: toDate(q.createdAt), customerId: q.customerId,
    customerName:        q.customer?.company ?? q.customer?.name ?? "",
    clientCode:          q.clientCode ?? "",
    parentQuotationId:   q.parentQuotationId ?? null,
    salutation:          q.salutation ?? "",
    attentionSalutation: q.attentionSalutation ?? "",
    attentionName:       q.attentionName ?? "",
    branch:              q.branch ?? "",
    proposedByName:        q.proposedBy?.name ?? "",
    proposedByDesignation: ROLE_DISPLAY[q.proposedBy?.role ?? ""] ?? (q.proposedBy?.role ?? ""),
    proposedByBranch:      getBranchCode(q.proposedBy?.branch),
    items: q.items ?? [],
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status     = searchParams.get("status") as QuotationStatus | null;
  const customerId = searchParams.get("customerId");
  const leadId     = searchParams.get("leadId");
  const page  = Math.max(1, Number(searchParams.get("page")  ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "50"));

  const where = {
    ...(status     ? { status }     : {}),
    ...(customerId ? { customerId } : {}),
    ...(leadId     ? { leadId }     : {}),
  };

  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer:   { select: { name: true, company: true } },
        items:      true,
        proposedBy: { select: { name: true, role: true, branch: true } },
      },
    }),
    prisma.quotation.count({ where }),
  ]);

  return NextResponse.json({
    data: quotations.map((q) => shape(q as QRow)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const su = session.user as { id?: string; role?: string; branch?: string };
  const branchCode = getBranchCode(su.branch);

  const body = await request.json() as {
    customerId?: string; leadId?: string; status?: string;
    items?: { description: string; qty: number; unit: string; unitPrice: number }[];
    taxRate?: number; discount?: number; validUntil?: string;
    terms?: string; notes?: string;
    salutation?: string; attentionSalutation?: string; attentionName?: string;
    // revision fields
    parentQuotationId?: string;
    revisionNote?: string;
  };

  const { customerId, leadId, items = [], taxRate = 0, discount = 0,
          validUntil, terms, notes, salutation, attentionSalutation, attentionName,
          status = "DRAFT", parentQuotationId, revisionNote } = body;

  if (!customerId && !leadId) return err("Customer or Lead is required");
  if (!items.length) return err("At least one item is required");

  const subtotal = items.reduce((s, i) => s + Number(i.qty) * Number(i.unitPrice), 0);
  const tax      = Math.round(subtotal * Number(taxRate)) / 100;
  const total    = subtotal + tax - Number(discount);

  // Generate client code from customer company name
  let code = "";
  if (customerId) {
    const cust = await prisma.customer.findUnique({ where: { id: customerId }, select: { company: true, name: true } });
    code = makeClientCode(cust?.company || cust?.name || "");
  } else if (leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { company: true, name: true } });
    code = makeClientCode(lead?.company || lead?.name || "");
  }

  let quotationNo: string;

  if (parentQuotationId) {
    // Revision: number = parentNo-R{n}
    const parent = await prisma.quotation.findUnique({ where: { id: parentQuotationId }, select: { quotationNo: true } });
    if (!parent) return err("Parent quotation not found");
    const rootNo = parent.quotationNo; // e.g. ZAG/Q/HO/001
    const existingRevisions = await prisma.quotation.count({ where: { parentQuotationId } });
    quotationNo = `${rootNo}-R${existingRevisions + 2}`; // R2, R3, ...
  } else {
    // New root quotation: branch-sequential
    const branchCount = await prisma.quotation.count({ where: { branch: branchCode, parentQuotationId: null } });
    quotationNo = `ZAG/Q/${branchCode}/${String(branchCount + 1).padStart(3, "0")}`;
  }

  const quotation = await prisma.quotation.create({
    data: {
      quotationNo,
      status:              (status as QuotationStatus),
      customerId:          customerId          ?? null,
      leadId:              leadId              ?? null,
      subtotal, taxRate: Number(taxRate), tax,
      discount:            Number(discount),
      total,
      validUntil:          validUntil ? new Date(validUntil) : null,
      terms:               terms?.trim()         ?? null,
      notes:               notes?.trim()         ?? null,
      salutation:          salutation            ?? null,
      attentionSalutation: attentionSalutation   ?? null,
      attentionName:       attentionName?.trim() ?? null,
      branch:              branchCode,
      proposedById:        su.id                 ?? null,
      clientCode:          code                  || null,
      parentQuotationId:   parentQuotationId     ?? null,
      revisionNote:        revisionNote?.trim()  ?? null,
      items: {
        create: items.map((i) => ({
          description: i.description,
          qty:       Number(i.qty),
          unit:      i.unit ?? "Nos",
          unitPrice: Number(i.unitPrice),
          total:     Number(i.qty) * Number(i.unitPrice),
        })),
      },
    },
    include: {
      items:      true,
      customer:   { select: { name: true, company: true } },
      proposedBy: { select: { name: true, role: true, branch: true } },
    },
  });

  return ok(shape(quotation as QRow), 201);
}
