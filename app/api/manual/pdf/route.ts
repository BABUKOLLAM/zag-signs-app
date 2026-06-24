import { NextRequest } from "next/server";

// API route for PDF generation - currently returns placeholder
// PDF is generated client-side using html2pdf library for better compatibility
export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      message: "PDF generation is handled client-side",
      status: "use-client-library",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
