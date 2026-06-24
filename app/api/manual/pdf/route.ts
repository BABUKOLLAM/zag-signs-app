import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let cachedPDF: Buffer | null = null;

export async function GET(request: NextRequest) {
  try {
    // Check if PDF exists in public folder
    const pdfPath = path.join(process.cwd(), "public", "ZAG-SIGNS-ERP-Manual-v1.2.pdf");

    if (fs.existsSync(pdfPath)) {
      // Serve pre-generated PDF
      const buffer = fs.readFileSync(pdfPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="ZAG-SIGNS-ERP-Manual-v1.2.pdf"',
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Fallback: Return error message
    return new NextResponse(
      JSON.stringify({
        error: "PDF not found",
        message: "Manual PDF is being generated. Please try again in a moment.",
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("PDF fetch error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate PDF" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
