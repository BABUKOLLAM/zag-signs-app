import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, autoNo } from "@/lib/api-helpers";
import { Branch, OpportunityStage } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as { action: string };

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return err("Lead not found", 404);

  if (body.action === "to_opportunity") {
    // Check if an opportunity already exists for this lead
    const existing = await prisma.opportunity.findFirst({ where: { leadId: id } });
    if (existing) return err("An opportunity already exists for this lead");

    const opp = await prisma.opportunity.create({
      data: {
        title:  `${lead.company || lead.name} Opportunity`,
        stage:  OpportunityStage.QUALIFICATION,
        probability: 20,
        value:  lead.value,
        branch: lead.branch as Branch,
        notes:  lead.notes ?? undefined,
        leadId: lead.id,
      },
    });
    // Update lead status to QUALIFIED
    await prisma.lead.update({ where: { id }, data: { status: "QUALIFIED" } });
    return ok({ opportunityId: opp.id, message: "Opportunity created" }, 201);
  }

  if (body.action === "to_customer") {
    if (!lead.company) return err("Lead must have a company name to convert to customer");

    // Check for duplicate by phone
    const dup = await prisma.customer.findFirst({ where: { phone: lead.phone } });
    if (dup) return err(`Customer already exists with this phone (${dup.customerNo})`);

    const count = await prisma.customer.count();
    const customer = await prisma.customer.create({
      data: {
        customerNo: autoNo("C", count),
        name:    lead.name,
        company: lead.company,
        phone:   lead.phone,
        email:   lead.email ?? undefined,
        branch:  lead.branch as Branch,
      },
    });
    // Update lead status to WON
    await prisma.lead.update({ where: { id }, data: { status: "WON", closedAt: new Date() } });
    return ok({ customerId: customer.id, customerNo: customer.customerNo, message: "Customer created" }, 201);
  }

  return err("Unknown action. Use 'to_opportunity' or 'to_customer'.");
}
