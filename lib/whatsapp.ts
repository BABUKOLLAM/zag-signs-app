/**
 * WhatsApp notification helper.
 * Supports Meta Cloud API and Twilio — set env vars to activate.
 *
 * Required env vars (Meta):  WHATSAPP_TOKEN, WHATSAPP_PHONE_ID
 * Required env vars (Twilio): TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
 *
 * Falls back to console.log in development if env vars are not set.
 */

type WAResult = { success: boolean; messageId?: string; error?: string };

export async function sendWhatsApp(to: string, message: string): Promise<WAResult> {
  // Normalise Indian mobile numbers: add 91 country code if missing
  const phone = to.replace(/\D/g, "");
  const e164 = phone.startsWith("91") ? phone : `91${phone}`;

  // ── Meta Cloud API ───────────────────────────────────────────────────────
  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: e164,
            type: "text",
            text: { body: message },
          }),
        }
      );
      const json = (await res.json()) as { messages?: { id: string }[] };
      return { success: true, messageId: json.messages?.[0]?.id };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  // ── Twilio ───────────────────────────────────────────────────────────────
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const from = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";
      const body = new URLSearchParams({
        From: from,
        To: `whatsapp:+${e164}`,
        Body: message,
      });
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );
      const json = (await res.json()) as { sid?: string; message?: string };
      if (!res.ok) return { success: false, error: json.message };
      return { success: true, messageId: json.sid };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  // ── Fallback (dev / no credentials) ─────────────────────────────────────
  console.log(`[WhatsApp → +${e164}]: ${message}`);
  return { success: true, messageId: "console-fallback" };
}

/** Send a lead follow-up reminder via WhatsApp */
export async function sendLeadFollowUpReminder(phone: string, contactName: string, companyName: string, crmLink: string) {
  return sendWhatsApp(
    phone,
    `Hi ${contactName},\n\nThis is a friendly follow-up from *ZAG SIGNS*.\n\nWe wanted to connect regarding signage solutions for *${companyName}*.\n\nWould you be available for a quick call this week?\n\nBest regards,\nZAG SIGNS Team`
  );
}

/** Send a payment reminder via WhatsApp */
export async function sendPaymentReminder(phone: string, contactName: string, invoiceNo: string, amount: number, dueDate: string) {
  return sendWhatsApp(
    phone,
    `Dear ${contactName},\n\nKind reminder: Invoice *${invoiceNo}* for ₹${amount.toLocaleString()} is due on *${dueDate}*.\n\nPlease arrange payment at the earliest.\n\nThank you,\nZAG SIGNS Accounts`
  );
}
