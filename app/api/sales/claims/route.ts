import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, ok, err, autoNo } from "@/lib/api-helpers";


// Claim submission window: 1st to 10th of month
function getClaimSubmissionWindow() {
  const now = new Date();
  const today = now.getDate();

  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const isWindowOpen = today <= 10;
  const closesOn = 11;
  const daysLeft = Math.max(0, closesOn - today);

  return { currentMonth, isWindowOpen, closesOn, daysLeft };
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get("month");
    const submittedByUserId = searchParams.get("submittedByUserId");
    const status = searchParams.get("status");

    const where: any = {};
    if (month) where.submissionWindow = month;
    if (submittedByUserId) where.submittedByUserId = submittedByUserId;
    if (status) where.status = status;

    const claims = await prisma.salesClaim.findMany({
      where,
      include: {
        submittedBy: { select: { id: true, name: true } },
        approvalHistory: { include: { approver: { select: { name: true } } } },
        attachments: true,
      },
      orderBy: { submittedDate: "desc" },
      take: 200,
    });

    return ok(claims, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await req.json();

    // Check submission window
    const { currentMonth, isWindowOpen, daysLeft } = getClaimSubmissionWindow();

    if (!isWindowOpen && body.status === "SUBMITTED") {
      return new Response(
        JSON.stringify(err(`Claims submission window closed. Next window opens on ${new Date().getFullYear()}-${String(new Date().getMonth() + 2).padStart(2, "0")}-01`)),
        { status: 409 }
      );
    }

    // Generate claim number
    const count = await prisma.salesClaim.count();
    const claimNo = `SC-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const claim = await prisma.salesClaim.create({
      data: {
        claimNo,
        claimType: body.claimType,
        claimReason: body.claimReason,
        amount: body.amount,
        submittedByUserId: (session.user as any).id,
        submissionWindow: currentMonth,
        status: body.status || "DRAFT", // DRAFT or SUBMITTED
        supportingDetails: body.supportingDetails || null,
      },
      include: {
        submittedBy: true,
        approvalHistory: true,
        attachments: true,
      },
    });

    // If submitting outside window, auto-add note
    if (body.status === "SUBMITTED" && !isWindowOpen) {
      await prisma.salesClaim.update({
        where: { id: claim.id },
        data: {
          resubmissionAllowed: true,
          supportingDetails: `${body.supportingDetails || ""}\n[NOTE: Submitted outside regular window (${daysLeft} days after closure)]`,
        },
      });
    }

    return ok(claim, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
