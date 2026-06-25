import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookToken, parseIncomingMessage } from "@/lib/whatsapp-service";

// Webhook verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  if (!token || !verifyWebhookToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  return new NextResponse(challenge);
}

// Receive incoming messages (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (optional but recommended)
    // const signature = request.headers.get("x-hub-signature-256");
    // if (!verifyWebhookSignature(signature, body)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    // }

    const message = parseIncomingMessage(body);

    if (!message) {
      console.log("No message found in webhook");
      return NextResponse.json({ success: true });
    }

    console.log("Incoming WhatsApp message:", {
      from: message.from,
      text: message.text,
      type: message.type,
      timestamp: new Date(message.timestamp * 1000),
    });

    // TODO: Store message in database
    // TODO: Send notification to user
    // TODO: Auto-reply if configured

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
