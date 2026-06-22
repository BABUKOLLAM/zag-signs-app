import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, requireSession, toDate } from "@/lib/api-helpers";
import { Branch, OpportunityStage } from "@prisma/client";

const STAGE_LABELS: Record<string, string> = {
  QUALIFICATION:    "Qualification",
  PROPOSAL_SENT:    "Proposal Sent",
  NEGOTIATION:      "Negotiation",
  VERBAL_COMMITMENT:"Verbal Commitment",
  CLOSED_WON:       "Closed Won",
  CLOSED_LOST:      "Closed Lost",
};

const STAGE_PROB: Record<string, number> = {
  QUALIFICATION: 20, PROPOSAL_SENT: 40, NEGOTIATION: 65,
  VERBAL_COMMITMENT: 85, CLOSED_WON: 100, CLOSED_LOST: 0,
};

function shape(o: {
  id: string; title: string; stage: string; probability: number; value: number;
  branch: string; expectedClose: Date | null; notes: string | null; createdAt: Date;
  leadId: string | null;
  lead?: { id: string; name: string; company: string | null; phone: string } | null;
}) {
  return {
    id:           o.id,
    title:        o.title,
    stage:        o.stage,
    stageLabel:   STAGE_LABELS[o.stage] ?? o.stage,
    probability:  o.probability,
    value:        o.value,
    branch:       o.branch,
    expectedClose: toDate(o.expectedClose),
    notes:        o.notes ?? "",
    createdAt:    toDate(o.createdAt),
    leadId:       o.leadId,
    leadName:     o.lead?.company || o.lead?.name || "",
    leadPhone:    o.lead?.phone ?? "",
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const stage  = searchParams.get("stage") as OpportunityStage | null;
  const branch = searchParams.get("branch") as Branch | null;
  const leadId = searchParams.get("leadId");
  const page   = Math.max(1, Number(searchParams.get("page")  ?? "1"));
  const limit  = Math.min(100, Number(searchParams.get("limit") ?? "50"));

  const where = {
    ...(stage  ? { stage }  : {}),
    ...(branch ? { branch } : {}),
    ...(leadId ? { leadId } : {}),
  };

  const [opps, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { lead: { select: { id: true, name: true, company: true, phone: true } } },
    }),
    prisma.opportunity.count({ where }),
  ]);

  return NextResponse.json({
    data: opps.map((o) => shape(o)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    title: string; stage?: string; value?: number;
    branch: string; expectedClose?: string; notes?: string; leadId?: string;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const stage = (body.stage as OpportunityStage) ?? OpportunityStage.QUALIFICATION;
  const opp = await prisma.opportunity.create({
    data: {
      title:        body.title.trim(),
      stage,
      probability:  STAGE_PROB[stage] ?? 20,
      value:        Number(body.value) || 0,
      branch:       body.branch as Branch,
      expectedClose: body.expectedClose ? new Date(body.expectedClose) : null,
      notes:        body.notes?.trim() ?? null,
      leadId:       body.leadId ?? null,
    },
    include: { lead: { select: { id: true, name: true, company: true, phone: true } } },
  });

  return NextResponse.json({ data: shape(opp) }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { id: string; stage?: string; probability?: number; notes?: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const stage = body.stage as OpportunityStage | undefined;
  const opp = await prisma.opportunity.update({
    where: { id: body.id },
    data: {
      ...(stage !== undefined && { stage, probability: STAGE_PROB[stage] ?? undefined }),
      ...(body.probability !== undefined && { probability: body.probability }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
    include: { lead: { select: { id: true, name: true, company: true, phone: true } } },
  });

  return NextResponse.json({ data: shape(opp) });
}
