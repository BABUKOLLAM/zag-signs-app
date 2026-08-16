import { AsyncLocalStorage } from "node:async_hooks";

export interface AuditActor {
  userId: string | null;
}

// Populated by the shared requireSession()/requireRole()/requirePathAccess()
// helpers in lib/api-helpers.ts right after a session is confirmed, using
// enterWith() so every route that authenticates via them is covered without
// having to individually wire an audit call into each of the ~100 mutating
// API routes. Read by the Prisma $extends hook in lib/prisma.ts.
export const auditContext = new AsyncLocalStorage<AuditActor>();

export function setAuditActor(userId: string | null) {
  auditContext.enterWith({ userId });
}

export function currentAuditUserId(): string | null {
  return auditContext.getStore()?.userId ?? null;
}
