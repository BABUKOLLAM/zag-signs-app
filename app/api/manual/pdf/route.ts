import { NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ManualPDFDocument } from "@/lib/manual-pdf-doc";

// Node.js runtime required — react-pdf uses Node APIs not available in Edge
export const runtime = "nodejs";

export async function GET() {
  try {
    const buffer = await renderToBuffer(React.createElement(ManualPDFDocument));
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ZAG-SIGNS-ERP-Manual-v1.3.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "PDF generation failed", detail: error?.message }, { status: 500 });
  }
}
