import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage, sendWhatsAppDocument, sendWhatsAppTemplate } from "@/lib/whatsapp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, message, documentUrl, filename, templateName, parameters } = body;

    if (!to || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let messageId: string;

    switch (type) {
      case "text":
        messageId = await sendWhatsAppMessage(to, message);
        break;
      case "document":
        messageId = await sendWhatsAppDocument(to, documentUrl, filename);
        break;
      case "template":
        messageId = await sendWhatsAppTemplate(to, templateName, "en", parameters);
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, messageId, to, type });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
