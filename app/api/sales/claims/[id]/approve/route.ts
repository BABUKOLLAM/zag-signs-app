import { NextRequest } from "next/server";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { stage, action, notes, approvedAmount } = body;

    // Validate user role can approve at this stage
    const validStages: Record<string, string[]> = {
      MANAGER: ["AVP", "Business Manager", "MD"],
      AVP: ["AVP", "MD"],
      MD: ["MD"],
    };

    // Record approval
    const approval = await prisma.claimApprovalHistory.create({
      data: {
        claimId: id,
        stage,
        approvedBy: (session.user as any).id,
        action, // APPROVED or REJECTED
        notes: notes || null,
      },
      include: { approver: true },
    });

    // Update claim status
    let newStatus = "DRAFT";
    if (action === "APPROVED") {
      if (stage === "MANAGER") newStatus = "MANAGER_APPROVED";
      else if (stage === "AVP") newStatus = "AVP_APPROVED";
      else if (stage === "MD") newStatus = "APPROVED";
    } else if (action === "REJECTED") {
      newStatus = "REJECTED";
    }

    const updatedClaim = await prisma.salesClaim.update({
      where: { id },
      data: {
        status: newStatus,
        approvedAmount: action === "APPROVED" && approvedAmount ? approvedAmount : undefined,
        rejectionReason: action === "REJECTED" ? notes : undefined,
        resubmissionAllowed: action === "REJECTED",
      },
      include: {
        approvalHistory: true,
        submittedBy: true,
      },
    });

    return new Response(JSON.stringify(ok(updatedClaim)), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}
