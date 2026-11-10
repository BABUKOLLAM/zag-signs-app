import { NextRequest } from "next/server";
import { requirePathAccess, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import {
  approvalDenial, isApprovalStage, EXPENSE_TRANSITIONS, STAGE_PENDING,
} from "@/lib/expense-approval";

/** Thrown inside the transaction when the report moved on before we got to it. */
class StaleStatus extends Error {}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requirePathAccess("/sales/approvals");
  if (!session) return err("Forbidden", 403);

  try {
    const body = await req.json();
    const stage = body.stage as unknown;
    const action = body.action as string;
    const reason = body.reason as string | undefined;

    if (!isApprovalStage(stage)) return err("Invalid stage", 400);
    const nextStatus = EXPENSE_TRANSITIONS[stage]?.[action];
    if (!nextStatus) return err("Invalid action for this stage", 400);
    if (["HOLD", "REJECTED"].includes(action) && !reason?.trim()) {
      return err("Reason is required for Hold or Reject", 400);
    }

    const expense = await prisma.expenseReport.findUnique({ where: { id } });
    if (!expense) return err("Expense report not found", 404);

    const user = session.user as { id?: string; role?: string };
    const userId = user.id ?? "";
    // Path access alone let any /sales user (e.g. Sales Executive) act at any
    // stage, including on their own report. Enforce role-per-stage + no self-approval.
    const denial = approvalDenial({ role: user.role, myId: userId, stage, expenseOwnerId: expense.userId });
    if (denial) return err(denial, 403);

    const pending = STAGE_PENDING[stage];
    if (!pending.includes(expense.status)) {
      return err(`Expense is ${expense.status}; it is not awaiting ${stage} action`, 409);
    }

    const data: Record<string, unknown> = { status: nextStatus };
    if (action === "HOLD") data.holdReason = reason;
    if (action === "REJECTED") data.rejectionReason = reason;
    if (action === "APPROVED") data.approvedAmount = expense.netPayable || expense.totalAmount;

    const updated = await prisma.$transaction(async (tx) => {
      // Compare-and-set: only moves if the status is still one this stage may
      // act on. A double-click / concurrent approver changes 0 rows → 409,
      // and the approval record below is rolled back with it.
      const moved = await tx.expenseReport.updateMany({
        where: { id, status: { in: pending } },
        data,
      });
      if (moved.count !== 1) throw new StaleStatus();

      await tx.expenseApproval.create({
        data: { expenseId: id, stage, actionById: userId, action, reason: reason || null },
      });
      await tx.auditLog.create({
        data: {
          action: `EXPENSE_${stage}_${action}`,
          tableName: "ExpenseReport",
          recordId: id,
          oldValues: { status: expense.status },
          newValues: { status: nextStatus, stage, action, reason: reason || null },
          userId: userId || null,
        },
      });

      return tx.expenseReport.findUniqueOrThrow({
        where: { id },
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
  } catch (e: unknown) {
    if (e instanceof StaleStatus) return err("This expense was already actioned — refresh and try again", 409);
    return err(e instanceof Error ? e.message : "Failed", 500);
  }
}
