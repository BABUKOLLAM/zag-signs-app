import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePathAccess, ok, err } from "@/lib/api-helpers";
import { claimApprovalCheck, nextClaimStatus, CLAIM_STAGE_PENDING, type ClaimStage, type ClaimAction } from "@/lib/claim-approval";

/** Thrown inside the transaction when the claim moved on before we got to it. */
class StaleStatus extends Error {}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePathAccess("/sales/claims");
  if (!session) return err("Forbidden", 403);

  try {
    const { id } = await params;
    const body = await req.json();
    const { stage, action, notes, approvedAmount } = body as {
      stage?: unknown; action?: unknown; notes?: string; approvedAmount?: unknown;
    };

    const claim = await prisma.salesClaim.findUnique({ where: { id } });
    if (!claim) return err("Claim not found", 404);

    const user = session.user as { id?: string; role?: string };
    const userId = user.id ?? "";
    // Previously validStages was declared but never checked: any /sales user
    // could approve any claim at any stage, including their own.
    const problem = claimApprovalCheck({ role: user.role, myId: userId, stage, action, approvedAmount, claim });
    if (problem) return err(problem.error, problem.status);

    const st = stage as ClaimStage;
    const act = action as ClaimAction;
    const newStatus = nextClaimStatus(st, act);
    const amount = act === "APPROVED" && approvedAmount !== undefined && approvedAmount !== null && approvedAmount !== ""
      ? Number(approvedAmount)
      : undefined;

    const updatedClaim = await prisma.$transaction(async (tx) => {
      // Compare-and-set on the current status: enforces MANAGER → AVP → MD,
      // never reopens APPROVED/REJECTED, and a double-click records one action.
      const moved = await tx.salesClaim.updateMany({
        where: { id, status: { in: CLAIM_STAGE_PENDING[st] } },
        data: {
          status: newStatus,
          approvedAmount: amount,
          rejectionReason: act === "REJECTED" ? notes || null : undefined,
          resubmissionAllowed: act === "REJECTED",
        },
      });
      if (moved.count !== 1) throw new StaleStatus();

      await tx.claimApprovalHistory.create({
        data: { claimId: id, stage: st, approvedBy: userId, action: act, notes: notes || null },
      });
      await tx.auditLog.create({
        data: {
          action: `CLAIM_${st}_${act}`,
          tableName: "SalesClaim",
          recordId: id,
          oldValues: { status: claim.status, approvedAmount: claim.approvedAmount },
          newValues: { status: newStatus, stage: st, action: act, approvedAmount: amount ?? null, notes: notes || null },
          userId: userId || null,
        },
      });

      return tx.salesClaim.findUniqueOrThrow({
        where: { id },
        include: { approvalHistory: true, submittedBy: { select: { id: true, name: true } } },
      });
    });

    return ok(updatedClaim, 200);
  } catch (error: unknown) {
    if (error instanceof StaleStatus) return err("This claim was already actioned — refresh and try again", 409);
    return err(error instanceof Error ? error.message : "Failed", 500);
  }
}
