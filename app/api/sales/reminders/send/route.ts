import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendFollowUpReminderEmail, sendDARReminderEmail, sendClaimsReminderEmail } from "@/lib/email-service";


async function handleReminders(req: NextRequest) {
  try {
    // Only allow requests from internal cron or with API key
    const authHeader = req.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    let sentCount = 0;
    let errors: any[] = [];

    // Server clock runs in UTC — shift the whole timestamp to IST (UTC+5:30)
    // before deriving any hour/day/date so day-boundary checks below match Kerala local time.
    const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const today = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()));

    // 1. Send follow-up reminder emails

    const overdueReminders = await prisma.followUpReminder.findMany({
      where: {
        isDone: false,
        reminderDate: { lte: today },
      },
      include: {
        activityLog: {
          include: {
            user: true,
            customer: true,
            lead: true,
          },
        },
      },
    });

    for (const reminder of overdueReminders) {
      const user = reminder.activityLog.user;
      const customer = reminder.activityLog.customer?.name || reminder.activityLog.lead?.name || "Unknown";

      const result = await sendFollowUpReminderEmail({
        toEmail: user.email || "",
        toName: user.name,
        customerName: customer,
        reminderDate: reminder.reminderDate,
        lastActivityDate: reminder.activityLog.startTime,
        purpose: reminder.activityLog.purpose || "",
      });

      if (result.success) {
        sentCount++;
        // Mark reminder as sent (but not done yet)
      } else {
        errors.push({
          type: "follow-up",
          user: user.name,
          error: result.error,
        });
      }
    }

    // 2. Send DAR reminder emails to all sales staff daily at 9 PM IST.
    if (istNow.getUTCHours() === 21) {
      const salesUsers = await prisma.user.findMany({
        where: {
          role: { in: ["SALES_EXECUTIVE", "CRES", "BUSINESS_MANAGER"] },
        },
      });

      const daysInMonth = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth() + 1, 0)).getUTCDate();
      const daysOpen = istNow.getUTCDate();
      const daysLeft = daysInMonth - daysOpen;
      const claimsWindowStatus = daysOpen <= 10 ? "open" : "closed";

      for (const user of salesUsers) {
        const result = await sendDARReminderEmail({
          toEmail: user.email || "",
          toName: user.name,
          daysOpen,
          daysLeft,
          claimsWindowStatus,
        });

        if (result.success) {
          sentCount++;
        } else {
          errors.push({
            type: "DAR",
            user: user.name,
            error: result.error,
          });
        }
      }
    }

    // 3. Send claims window reminder every weekend
    const dayOfWeek = istNow.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const salesUsers = await prisma.user.findMany({
        where: {
          role: { in: ["SALES_EXECUTIVE", "CRES", "BUSINESS_MANAGER"] },
        },
      });

      const dayOfMonth = istNow.getUTCDate();
      const daysLeft = Math.max(11 - dayOfMonth, 0);

      for (const user of salesUsers) {
        const pendingClaims = await prisma.salesClaim.count({
          where: {
            submittedByUserId: user.id,
            status: { in: ["DRAFT", "SUBMITTED", "MANAGER_REVIEW", "MANAGER_APPROVED"] },
          },
        });

        if (pendingClaims > 0) {
          const result = await sendClaimsReminderEmail(
            user.email || "",
            user.name,
            daysLeft,
            pendingClaims
          );

          if (result.success) {
            sentCount++;
          } else {
            errors.push({
              type: "claims",
              user: user.name,
              error: result.error,
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}

// Vercel Cron triggers this via GET, sending `Authorization: Bearer $CRON_SECRET` automatically.
export async function GET(req: NextRequest) {
  return handleReminders(req);
}

// Kept for manual/external triggering with the same secret.
export async function POST(req: NextRequest) {
  return handleReminders(req);
}
