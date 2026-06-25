import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendFollowUpReminderEmail, sendDARReminderEmail, sendClaimsReminderEmail } from "@/lib/email-service";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Only allow requests from internal cron or with API key
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    let sentCount = 0;
    let errors: any[] = [];

    // 1. Send follow-up reminder emails
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // 2. Send DAR reminder emails to all sales staff daily at 6 PM
    const currentHour = new Date().getHours();
    if (currentHour === 18) {
      const salesUsers = await prisma.user.findMany({
        where: {
          role: { in: ["SALES_EXECUTIVE", "CRES", "BUSINESS_MANAGER"] },
        },
      });

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const daysOpen = today.getDate();
      const daysLeft = daysInMonth - daysOpen;
      const claimsWindowStatus = today.getDate() <= 10 ? "open" : "closed";

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

    // 3. Send claims window reminder when 2-3 days left
    const dayOfMonth = today.getDate();
    if (dayOfMonth === 8 || dayOfMonth === 9) {
      const salesUsers = await prisma.user.findMany({
        where: {
          role: { in: ["SALES_EXECUTIVE", "CRES", "BUSINESS_MANAGER"] },
        },
      });

      const daysLeft = 11 - dayOfMonth;

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
