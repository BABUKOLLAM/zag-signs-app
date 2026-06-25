import { NextRequest, NextResponse } from "next/server";

// Redirect to the live manual page with auto-print flag.
// The static PDF was v1.2 — this ensures the download is always current.
export async function GET(_request: NextRequest) {
  return NextResponse.redirect(
    new URL("/manual-print", _request.url),
    { status: 302 }
  );
}
