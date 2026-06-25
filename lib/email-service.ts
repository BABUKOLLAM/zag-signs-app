import nodemailer from "nodemailer";

// Email service using Gmail SMTP (tech@bpropms.com)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface FollowUpReminderEmail {
  toEmail: string;
  toName: string;
  customerName: string;
  reminderDate: Date;
  lastActivityDate: Date;
  purpose: string;
}

interface DARSubmissionEmail {
  toEmail: string;
  toName: string;
  daysOpen: number;
  daysLeft: number;
  claimsWindowStatus: string;
}

export async function sendFollowUpReminderEmail(data: FollowUpReminderEmail) {
  try {
    const daysOverdue = Math.floor(
      (new Date().getTime() - data.reminderDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const htmlContent = `
      <h2>Follow-Up Reminder</h2>
      <p>Hi ${data.toName},</p>
      <p>This is a reminder to follow up with <strong>${data.customerName}</strong>.</p>

      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Customer:</strong> ${data.customerName}</p>
        <p><strong>Last Activity:</strong> ${data.lastActivityDate.toLocaleDateString()}</p>
        <p><strong>Purpose:</strong> ${data.purpose || "Follow-up"}</p>
        <p><strong>Reminder Due:</strong> ${data.reminderDate.toLocaleDateString()}</p>
        ${daysOverdue > 0 ? `<p style="color: #dc2626;"><strong>⚠️ ${daysOverdue} day(s) overdue</strong></p>` : ""}
      </div>

      <p>Log this activity in the Sales Dashboard to stay on track with your targets.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/sales/activities"
           style="background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Log Activity
        </a>
      </p>

      <p>Best regards,<br/>ZAG SIGNS ERP</p>
    `;

    await transporter.sendMail({
      from: `ZAG SIGNS <${process.env.EMAIL_USER}>`,
      to: data.toEmail,
      subject: `Follow-Up Reminder: ${data.customerName}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendDARReminderEmail(data: DARSubmissionEmail) {
  try {
    const htmlContent = `
      <h2>Daily Activity Report Submission Reminder</h2>
      <p>Hi ${data.toName},</p>
      <p>Time to submit your Daily Activity Report (DAR)!</p>

      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>✓ Window Open:</strong> ${data.claimsWindowStatus === "open" ? "Claims window is open (1st-10th)" : "Claims window closed"}</p>
        <p><strong>Days Since Report Open:</strong> ${data.daysOpen}</p>
        ${data.daysLeft <= 2 ? `<p style="color: #dc2626;"><strong>⚠️ ${data.daysLeft} day(s) left to submit</strong></p>` : ""}
      </div>

      <p>Include:</p>
      <ul>
        <li>Calls made today</li>
        <li>Customer visits completed</li>
        <li>Orders booked</li>
        <li>Collections received</li>
        <li>Highlights and challenges</li>
      </ul>

      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/sales/activities"
           style="background-color: #16a34a; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          View Activities & Submit DAR
        </a>
      </p>

      <p>Best regards,<br/>ZAG SIGNS ERP</p>
    `;

    await transporter.sendMail({
      from: `ZAG SIGNS <${process.env.EMAIL_USER}>`,
      to: data.toEmail,
      subject: `Daily Activity Report Reminder - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendClaimsReminderEmail(
  toEmail: string,
  toName: string,
  daysLeft: number,
  pendingClaimsCount: number
) {
  try {
    const htmlContent = `
      <h2>Claims Submission Window Reminder</h2>
      <p>Hi ${toName},</p>
      <p>Don't forget to submit your expense claims this month!</p>

      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>⏰ Window Closes:</strong> 10th of this month</p>
        <p><strong>Days Left:</strong> ${daysLeft > 0 ? daysLeft : 'Closed'}</p>
        <p><strong>Pending Claims:</strong> ${pendingClaimsCount}</p>
      </div>

      <p>Submit your claims for:</p>
      <ul>
        <li>Travel reimbursement (fuel, accommodation, meals)</li>
        <li>Sales incentives earned</li>
        <li>Client meeting expenses</li>
        <li>Product returns or chargebacks</li>
      </ul>

      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/sales/claims"
           style="background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Submit Claim Now
        </a>
      </p>

      <p>Best regards,<br/>ZAG SIGNS ERP</p>
    `;

    await transporter.sendMail({
      from: `ZAG SIGNS <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Claims Submission Reminder - ${daysLeft} days left`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

interface ExpenseApprovalEmailData {
  toEmail: string;
  toName: string;
  expenseNo: string;
  stage: string;
  action: string;
  reason?: string;
  amount: number;
}

const ACTION_LABELS: Record<string, string> = {
  RECOMMENDED: "Recommended by HOD",
  VERIFIED: "Verified by Accounts",
  APPROVED: "Approved by CEO",
  HOLD: "Placed on Hold",
  REJECTED: "Rejected",
};

const ACTION_COLORS: Record<string, string> = {
  RECOMMENDED: "#16a34a",
  VERIFIED: "#2563eb",
  APPROVED: "#16a34a",
  HOLD: "#d97706",
  REJECTED: "#dc2626",
};

export async function sendExpenseApprovalEmail(data: ExpenseApprovalEmailData) {
  try {
    const label = ACTION_LABELS[data.action] || data.action;
    const color = ACTION_COLORS[data.action] || "#374151";

    const html = `
      <h2 style="color:${color};">Expense Report ${label}</h2>
      <p>Hi ${data.toName},</p>
      <p>Your expense report <strong>${data.expenseNo}</strong> has been updated.</p>

      <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
        <p><strong>Expense No:</strong> ${data.expenseNo}</p>
        <p><strong>Amount:</strong> ₹${data.amount.toLocaleString("en-IN")}</p>
        <p><strong>Stage:</strong> ${data.stage}</p>
        <p><strong>Status:</strong> <span style="color:${color};font-weight:bold;">${label}</span></p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
      </div>

      ${data.action === "HOLD" || data.action === "REJECTED"
        ? `<p style="color:#dc2626;">Please review the reason above and contact your HOD for clarification.</p>`
        : `<p style="color:#16a34a;">Your expense is progressing through the approval chain.</p>`}

      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/sales/expenses"
           style="background:${color};color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
          View Expense Report
        </a>
      </p>
      <p>Best regards,<br/>ZAG SIGNS ERP</p>
    `;

    await transporter.sendMail({
      from: `ZAG SIGNS <${process.env.EMAIL_USER}>`,
      to: data.toEmail,
      subject: `Expense ${data.expenseNo}: ${label}`,
      html,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}
