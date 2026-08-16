import { PrismaClient } from "@prisma/client";
import { currentAuditUserId } from "./audit-context";

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
                userId: currentAuditUserId(),
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
