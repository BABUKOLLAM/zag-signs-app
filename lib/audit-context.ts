import { AsyncLocalStorage } from "node:async_hooks";

export interface AuditActor {
  userId: string | null;
}

// Populated by the shared requireSession()/requireRole()/requirePathAccess()
// helpers in lib/api-helpers.ts right after a session is confirmed, using
// enterWith() so every route that authenticates via them is covered without
// having to individually wire an audit call into each of the ~100 mutating
// API routes. Read by the Prisma $extends hook in lib/prisma.ts.
//
// Pinned to globalThis (same pattern as the Prisma singleton in lib/prisma.ts)
// — Next.js's bundler can pull this module into more than one chunk, and
// without a shared global each copy gets its own AsyncLocalStorage instance,
// silently breaking propagation (setAuditActor writes to one instance,
// currentAuditUserId reads from another — every write then falls back to
// "System" instead of the real actor, since getStore() returns undefined).
const globalForAudit = globalThis as unknown as { auditContext: AsyncLocalStorage<AuditActor> | undefined };

export const auditContext = globalForAudit.auditContext ?? new AsyncLocalStorage<AuditActor>();
globalForAudit.auditContext = auditContext;

export function setAuditActor(userId: string | null) {
  auditContext.enterWith({ userId });
}

export function currentAuditUserId(): string | null {
  return auditContext.getStore()?.userId ?? null;
}
