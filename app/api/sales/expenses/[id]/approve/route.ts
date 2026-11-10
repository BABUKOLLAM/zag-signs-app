import { NextRequest } from "next/server";
import { requirePathAccess, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { approvalDenial } from "@/lib/expense-approval";

type Stage = "HOD" | "ACCOUNTS" | "CEO";

// Maps (stage, action) → next ExpenseReport.status
const TRANSITIONS: Record<Stage, Record<string, string>> = {
  HOD:      { RECOMMENDED: "ACCOUNTS_VERIFY", HOLD: "HOD_HOLD",      REJECTED: "HOD_REJECTED" },
  ACCOUNTS: { VERIFIED:    "CEO_REVIEW",       HOLD: "ACCOUNTS_HOLD", REJECTED: "REJECTED" },
  CEO:      { APPROVED:    "APPROVED",         HOLD: "HOLD",          REJECTED: "REJECTED" },
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requirePathAccess("/sales/approvals");
  if (!session) return err("Forbidden", 403);

  try {
    const body = await req.json();
    const stage = body.stage as Stage;
    const action = body.action as string;
    const reason = body.reason as string | undefined;

    if (!["HOD", "ACCOUNTS", "CEO"].includes(stage)) return err("Invalid stage", 400);
    const nextStatus = TRANSITIONS[stage]?.[action];
    if (!nextStatus) return err("Invalid action for this stage", 400);
    if (["HOLD", "REJECTED"].includes(action) && !reason?.trim()) {
      return err("Reason is required for Hold or Reject", 400);
    }

    const expense = await prisma.expenseReport.findUnique({ where: { id } });
    if (!expense) return err("Expense report not found", 404);

    const userId = (session.user as any).id as string;
    // Path access alone let any /sales user (e.g. Sales Executive) act at any
    // stage, including on their own report. Enforce role-per-stage + no self-approval.
    const denial = approvalDenial({ role: (session.user as { role?: string }).role, myId: userId, stage, expenseOwnerId: expense.userId });
    if (denial) return err(denial, 403);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.expenseApproval.create({
        data: { expenseId: id, stage, actionById: userId, action, reason: reason || null },
      });

      const data: any = { status: nextStatus };
      if (action === "HOLD") data.holdReason = reason;
      if (action === "REJECTED") data.rejectionReason = reason;
      if (action === "APPROVED") {
        data.approvedAmount = expense.netPayable || expense.totalAmount;
      }

      return tx.expenseReport.update({
        where: { id },
        data,
        include: {
          items: { orderBy: { date: "asc" } },
          attachments: true,
          approvals: { include: { actionBy: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" } },
          user: { select: { id: true, name: true, branch: true, role: true } },
          fjp: { select: { fjpNo: true, forMonth: true } },
        },
      });
    });

    return ok(updated);
  } catch (e: any) {
    return err(e.message, 500);
  }
}
