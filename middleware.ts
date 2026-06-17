export { default } from "next-auth/middleware";

export const config = {
  // Protect all routes except these public paths
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|sw\\.js|offline\\.html).*)",
  ],
};
