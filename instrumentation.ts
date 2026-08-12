import type { Instrumentation } from "next";

// Catches unhandled server errors (Route Handlers, Server Components, Server
// Actions) that would otherwise only be visible in Vercel's raw function logs.
// No third-party observability account exists for this project yet, so this
// writes to a DB table instead — see the /admin/error-log page.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const e = err instanceof Error ? err : new Error(String(err));
    const { prisma } = await import("@/lib/prisma");
    await prisma.errorLog.create({
      data: {
        message:   e.message?.slice(0, 2000) || "Unknown error",
        digest:    (e as { digest?: string }).digest ?? null,
        stack:     e.stack?.slice(0, 4000) ?? null,
        path:      request.path,
        method:    request.method,
        routeType: context.routeType,
      },
    });
  } catch {
    // Logging the error must never itself throw and mask the original error.
  }
};
