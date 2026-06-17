// Proxy runs in the Edge Runtime before every request.
// Uses only global Web APIs (Request/Response) — no next/server import needed.
export function proxy(request: Request) {
  const url = new URL(request.url);
  const cookie = request.headers.get("cookie") ?? "";

  // Allow request through if a NextAuth session cookie exists.
  // The actual JWT validity is checked by getServerSession() in API routes
  // and by useSession() in client components.
  const hasSession =
    cookie.includes("next-auth.session-token=") ||
    cookie.includes("__Secure-next-auth.session-token=");

  if (!hasSession) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("callbackUrl", url.pathname);
    return Response.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|sw\\.js|offline\\.html).*)",
  ],
};
