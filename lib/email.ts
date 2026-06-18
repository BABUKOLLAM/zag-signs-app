import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: process.env.EMAIL_PORT === "465",
    auth: { user, pass },
  });
}

export async function sendApprovalEmail(opts: {
  toEmail: string;
  toName: string;
  applicantName: string;
  applicantEmail: string;
  applicantRole: string;
  approveUrl: string;
  rejectUrl: string;
}) {
  const { toEmail, toName, applicantName, applicantEmail, applicantRole, approveUrl, rejectUrl } = opts;
  const from = process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? "noreply@zagsigns.com";

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:20px;">ZAG SIGNS ERP</h1>
        <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px;">New User Approval Request</p>
      </div>
      <div style="padding:28px 32px;background:#fff;">
        <p style="color:#374151;font-size:15px;margin:0 0 16px;">Hi ${toName},</p>
        <p style="color:#374151;font-size:15px;margin:0 0 20px;">
          A new user has signed up and needs your approval to access the ERP system.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:8px 12px;background:#f1f5f9;font-size:13px;color:#64748b;width:120px;border-radius:6px 0 0 6px;">Name</td><td style="padding:8px 12px;background:#f8fafc;font-size:14px;font-weight:600;color:#1e293b;">${applicantName}</td></tr>
          <tr><td style="padding:8px 12px;background:#f1f5f9;font-size:13px;color:#64748b;">Email</td><td style="padding:8px 12px;background:#f8fafc;font-size:14px;color:#1e293b;">${applicantEmail}</td></tr>
          <tr><td style="padding:8px 12px;background:#f1f5f9;font-size:13px;color:#64748b;">Role</td><td style="padding:8px 12px;background:#f8fafc;font-size:14px;color:#1e293b;">${applicantRole}</td></tr>
        </table>
        <div style="display:flex;gap:12px;">
          <a href="${approveUrl}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-right:8px;">
            ✓ Approve
          </a>
          <a href="${rejectUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
            ✗ Reject
          </a>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;">
          These links expire in 72 hours. You can also manage users from the Admin → Users panel.
        </p>
      </div>
    </div>
  `;

  const transport = getTransport();
  if (!transport) {
    // Dev fallback — log to console
    console.log("\n─── APPROVAL EMAIL (no SMTP configured) ───");
    console.log(`To: ${toEmail}`);
    console.log(`Applicant: ${applicantName} <${applicantEmail}> — ${applicantRole}`);
    console.log(`Approve: ${approveUrl}`);
    console.log(`Reject:  ${rejectUrl}`);
    console.log("───────────────────────────────────────────\n");
    return;
  }

  await transport.sendMail({
    from,
    to: toEmail,
    subject: `[ZAG SIGNS ERP] Approve new user: ${applicantName} (${applicantRole})`,
    html,
  });
}

export async function sendWelcomeEmail(opts: {
  toEmail: string;
  toName: string;
  role: string;
  loginUrl: string;
}) {
  const { toEmail, toName, role, loginUrl } = opts;
  const from = process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? "noreply@zagsigns.com";

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:20px;">Welcome to ZAG SIGNS ERP</h1>
      </div>
      <div style="padding:28px 32px;background:#fff;border-radius:0 0 12px 12px;">
        <p style="color:#374151;font-size:15px;">Hi ${toName},</p>
        <p style="color:#374151;font-size:15px;">
          Your account has been approved. You can now log in with your registered email and password.
        </p>
        <p style="color:#374151;font-size:14px;">Your role: <strong>${role}</strong></p>
        <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:8px;">
          Login Now
        </a>
      </div>
    </div>
  `;

  const transport = getTransport();
  if (!transport) {
    console.log(`\n─── WELCOME EMAIL: ${toEmail} approved as ${role} ───\n`);
    return;
  }

  await transport.sendMail({
    from,
    to: toEmail,
    subject: "[ZAG SIGNS ERP] Your account has been approved",
    html,
  });
}
