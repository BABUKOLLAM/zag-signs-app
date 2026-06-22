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

type TicketRow = {
  id: string; ticketNo: string; branch: string;
  source: string; status: string; priority: string;
  customerId: string | null; customerName: string;
  customerPhone: string | null; customerEmail: string | null; customerAddress: string | null;
  quotationId: string | null;
  natureOfWork: string; description: string; reference: string | null;
  attachments: unknown;
  estimatedCost: number; advancePaid: number; balanceDue: number;
  paymentMode: string | null;
  receivedAt: Date; expectedAt: Date | null;
  assignedAt: Date | null; startedAt: Date | null;
  halfDoneAt: Date | null; completedAt: Date | null; billedAt: Date | null;
  assignedDesignerId: string | null;
  halfDoneReason: string | null;
  designerRemarks: string | null;
  closingNotes: string | null;
  createdById: string | null;
  createdAt: Date; updatedAt: Date;
  customer?: { id: string; name: string; company: string; phone: string } | null;
  quotation?: { quotationNo: string } | null;
  assignedDesigner?: { id: string; name: string; email: string } | null;
  createdBy?: { id: string; name: string } | null;
};

function shape(t: TicketRow) {
  return {
    id: t.id, ticketNo: t.ticketNo, branch: t.branch,
    source: t.source, status: t.status, priority: t.priority,
    customerId: t.customerId,
    customerName: t.customerName,
    customerPhone: t.customerPhone ?? "",
    customerEmail: t.customerEmail ?? "",
    customerAddress: t.customerAddress ?? "",
    customerCompany: t.customer?.company ?? "",
    quotationId: t.quotationId,
    quotationNo: t.quotation?.quotationNo ?? "",
    natureOfWork: t.natureOfWork, description: t.description,
    reference: t.reference ?? "",
    attachments: t.attachments ?? [],
    estimatedCost: t.estimatedCost, advancePaid: t.advancePaid, balanceDue: t.balanceDue,
    paymentMode: t.paymentMode ?? "",
    receivedAt:  t.receivedAt.toISOString(),
    expectedAt:  t.expectedAt?.toISOString() ?? null,
    assignedAt:  t.assignedAt?.toISOString() ?? null,
    startedAt:   t.startedAt?.toISOString() ?? null,
    halfDoneAt:  t.halfDoneAt?.toISOString() ?? null,
    completedAt: t.completedAt?.toISOString() ?? null,
    billedAt:    t.billedAt?.toISOString() ?? null,
    assignedDesignerId: t.assignedDesignerId,
    assignedDesignerName: t.assignedDesigner?.name ?? "",
    halfDoneReason:  t.halfDoneReason ?? "",
    designerRemarks: t.designerRemarks ?? "",
    closingNotes:    t.closingNotes ?? "",
    createdById:    t.createdById,
    createdByName:  t.createdBy?.name ?? "",
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

const INCLUDE = {
  customer:         { select: { id: true, name: true, company: true, phone: true } },
  quotation:        { select: { quotationNo: true } },
  assignedDesigner: { select: { id: true, name: true, email: true } },
  createdBy:        { select: { id: true, name: true } },
};

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const { searchParams } = new URL(request.url);
  const status   = searchParams.get("status");
  const branch   = searchParams.get("branch");
  const designer = searchParams.get("designer");      // user id
  const mine     = searchParams.get("mine");          // "1" → only my tickets (used by /my-work)
  const search   = searchParams.get("search") ?? "";

  const su = session.user as { id?: string };

  const where: Record<string, unknown> = {};
  if (status)   where.status = status;
  if (branch)   where.branch = branch;
  if (designer) where.assignedDesignerId = designer;
  if (mine === "1" && su.id) where.assignedDesignerId = su.id;
  if (search) {
    where.OR = [
      { ticketNo:     { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { natureOfWork: { contains: search, mode: "insensitive" } },
    ];
  }

  const tickets = await prisma.workOrderTicket.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: 300,
    include: INCLUDE,
  });

  return ok(tickets.map((t) => shape(t as TicketRow)));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const su = session.user as { id?: string; branch?: string };
  const branch = branchCode(su.branch);

  const body = await request.json() as {
    source?: string;
    customerId?: string;
    customerName?: string; customerPhone?: string;
    customerEmail?: string; customerAddress?: string;
    quotationId?: string;
    natureOfWork?: string;
    description?: string;
    reference?: string;
    estimatedCost?: number;
    advancePaid?: number;
    paymentMode?: string;
    expectedAt?: string;
    priority?: string;
    assignedDesignerId?: string;
  };

  let d = { ...body };

  // Auto-populate from quotation if quotationId is given
  if (body.quotationId) {
    const q = await prisma.quotation.findUnique({
      where: { id: body.quotationId },
      include: {
        items: true,
        customer: { select: { id: true, name: true, company: true, phone: true, email: true, address: true } },
      },
    });
    if (!q) return err("Quotation not found");
    d = {
      ...d,
      source:          d.source ?? "QUOTATION",
      customerId:      q.customerId ?? d.customerId,
      customerName:    q.customer?.name    ?? d.customerName    ?? "Customer",
      customerPhone:   q.customer?.phone   ?? d.customerPhone   ?? "",
      customerEmail:   q.customer?.email   ?? d.customerEmail   ?? "",
      customerAddress: q.customer?.address ?? d.customerAddress ?? "",
      estimatedCost:   d.estimatedCost ?? q.total,
      description:     d.description ?? q.items.map(i => `${i.qty} ${i.unit} × ${i.description}`).join("; "),
      reference:       d.reference ?? `Quotation ${q.quotationNo}`,
      natureOfWork:    d.natureOfWork ?? "From Quotation",
    };
  }

  if (!d.customerName?.trim()) return err("Customer name is required");
  if (!d.natureOfWork?.trim()) return err("Nature of work is required");
  if (!d.description?.trim())  return err("Description is required");

  const estimatedCost = Number(d.estimatedCost ?? 0);
  const advancePaid   = Number(d.advancePaid ?? 0);
  const balanceDue    = Math.max(0, estimatedCost - advancePaid);

  const branchCount = await prisma.workOrderTicket.count({ where: { branch } });
  const ticketNo    = `ZAG/WO/${branch}/${String(branchCount + 1).padStart(3, "0")}`;

  const initialStatus = d.assignedDesignerId ? "ASSIGNED" : "NEW";

  const ticket = await prisma.workOrderTicket.create({
    data: {
      ticketNo, branch,
      source:        (d.source ?? "WALK_IN") as never,
      status:        initialStatus as never,
      priority:      (d.priority ?? "MEDIUM") as never,
      customerId:    d.customerId ?? null,
      customerName:  d.customerName!.trim(),
      customerPhone:   d.customerPhone   ?? null,
      customerEmail:   d.customerEmail   ?? null,
      customerAddress: d.customerAddress ?? null,
      quotationId:   d.quotationId ?? null,
      natureOfWork:  d.natureOfWork!.trim(),
      description:   d.description!.trim(),
      reference:     d.reference ?? null,
      estimatedCost, advancePaid, balanceDue,
      paymentMode:   d.paymentMode ?? null,
      expectedAt:    d.expectedAt ? new Date(d.expectedAt) : null,
      assignedDesignerId: d.assignedDesignerId ?? null,
      assignedAt:    d.assignedDesignerId ? new Date() : null,
      createdById:   su.id ?? null,
      events: {
        create: [{
          fromStatus: null,
          toStatus:   initialStatus as never,
          note:       `Ticket created from ${d.source ?? "WALK_IN"}`,
          actorId:    su.id ?? null,
        }],
      },
    },
    include: INCLUDE,
  });

  return ok(shape(ticket as TicketRow), 201);
}
