import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Singleton pattern — prevents exhausting DB connections in dev (hot-reload creates new instances)
const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof withAudit> | undefined };

const MUTATING_OPS = new Set([
  "create", "createMany", "createManyAndReturn",
  "update", "updateMany", "updateManyAndReturn", "upsert",
  "delete", "deleteMany",
]);

// AuditLog/ErrorLog write themselves — logging their own writes would recurse
// (AuditLog) or just add noise (ErrorLog, which already has its own view).
const SKIP_MODELS = new Set(["AuditLog", "ErrorLog"]);

function actionFor(operation: string): string {
  if (operation.startsWith("create") || operation === "upsert") return "CREATE";
  if (operation.startsWith("update")) return "UPDATE";
  return "DELETE";
}

/** Best-effort JSON-safe clone, capped so one huge record can't bloat the log. */
function safeJson(value: unknown): unknown {
  try {
    const str = JSON.stringify(value);
    if (!str) return null;
    return str.length > 20_000 ? { truncated: true, preview: str.slice(0, 2000) } : JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Who's making this request, right now — read directly via NextAuth's own
 * getServerSession() rather than a custom AsyncLocalStorage.
 *
 * A custom AsyncLocalStorage populated inside requireSession() (in
 * lib/api-helpers.ts) and read here was tried first and does NOT survive:
 * enterWith() called inside a nested awaited helper does not propagate to
 * the caller's continuation in this Next.js runtime, confirmed by live
 * testing — setting it directly in a route handler's own top-level frame
 * worked, setting it inside requireSession() did not, even with zero
 * intervening awaits. Next's own request context (which getServerSession
 * relies on via cookies()/headers()) is the one mechanism proven to survive
 * all the way to this point, so we ask it directly instead of trying to
 * shadow it with our own.
 */
async function currentUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    return (session?.user as { id?: string } | undefined)?.id ?? null;
  } catch {
    // No request context at all (a maintenance script, a build step) — fine,
    // the write below just attributes to "System".
    return null;
  }
}

function withAudit(client: PrismaClient) {
  return client.$extends({
    name: "audit-log",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const result = await query(args);
          if (!MUTATING_OPS.has(operation) || SKIP_MODELS.has(model)) return result;

          // Awaited (not fire-and-forget): on Vercel's serverless runtime an
          // un-awaited write can get dropped if the function tears down
          // right after the response is sent. A failure here must still
          // never break the mutation that already succeeded above.
          try {
            const r = result as Record<string, unknown> | null;
            const where = (args as { where?: Record<string, unknown> })?.where;
            const recordId =
              (r && typeof r.id === "string" && r.id) ||
              (where && typeof where.id === "string" && where.id) ||
              (operation.endsWith("Many") ? `bulk(${(r as { count?: number })?.count ?? "?"})` : "unknown");

            await client.auditLog.create({
              data: {
                action: actionFor(operation),
                tableName: model,
                recordId: String(recordId),
                newValues: safeJson(result) as never,
                userId: await currentUserId(),
              },
            });
          } catch {
            // Never let audit logging itself throw inside a request.
          }

          return result;
        },
      },
    },
  });
}

export const prisma =
  globalForPrisma.prisma ??
  withAudit(
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
