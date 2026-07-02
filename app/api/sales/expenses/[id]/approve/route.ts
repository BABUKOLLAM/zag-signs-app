import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { sendExpenseApprovalEmail } from "@/lib/email-service";


// Stage → next status map
const STAGE_TRANSITIONS: Record<string, Record<string, string>> = {
  HOD: {
    RECOMMENDED: "ACCOUNTS_VERIFY",
    HOLD: "HOD_HOLD",
    REJECTED: "HOD_REJECTED",
  },
  ACCOUNTS: {
    VERIFIED: "CEO_REVIEW",
    HOLD: "ACCOUNTS_HOLD",
    REJECTED: "REJECTED",
  },
  CEO: {
    APPROVED: "APPROVED",
    HOLD: "HOLD",
    REJECTED: "REJECTED",
  },
};

// Allowed roles per stage
const STAGE_ROLES: Record<string, string[]> = {
  HOD: ["MD", "AVP", "Business Manager"],
  ACCOUNTS: ["Accounts"],
  CEO: ["MD"],
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const { id } = await params;
    const body = await req.json();
    const { stage, action, reason } = body;
    const role = (session.user as any).role;
    const actionById = (session.user as any).id;

    // Validate stage
    if (!STAGE_TRANSITIONS[stage]) {
      return err("Invalid stage", 400);
    }

    // Validate role permission
    if (!STAGE_ROLES[stage].includes(role)) {
      return err(`Your role cannot act at ${stage} stage`, 403);
    }

    // Validate action
    const validActions = Object.keys(STAGE_TRANSITIONS[stage]);
    if (!validActions.includes(action)) {
      return err(`Invalid action for ${stage}. Valid: ${validActions.join(", ")}`, 400);
    }

    // Require reason for HOLD or REJECTED
    if ((action === "HOLD" || action === "REJECTED") && !reason) {
      return err("Reason is required for Hold or Rejected", 400);
    }

    const expense = await prisma.expenseReport.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        approvals: true,
      },
    });

    if (!expense) return err("Expense not found", 404);

    const newStatus = STAGE_TRANSITIONS[stage][action];

    // Record approval action
    await prisma.expenseApproval.create({
      data: {
        expenseId: id,
        stage,
        actionById,
        action,
        reason: reason || null,
      },
    });

    // Update expense status
    await prisma.expenseReport.update({
      where: { id },
      data: {
        status: newStatus,
        ...(action === "HOLD" ? { holdReason: reason } : {}),
        ...(action === "REJECTED" ? { rejectionReason: reason } : {}),
        ...(action === "APPROVED" ? { approvedAmount: expense.totalAmount } : {}),
      },
    });

    // Send email notifications
    if (expense.user.email) {
      await sendExpenseApprovalEmail({
        toEmail: expense.user.email,
        toName: expense.user.name,
        expenseNo: expense.expenseNo,
        stage,
        action,
        reason: reason || undefined,
        amount: expense.totalAmount,
      });
    }

    return ok({ status: newStatus, stage, action }, 200);
  } catch (e: any) {
    return err(e.message, 500);
  }
}
