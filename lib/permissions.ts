// ─── Role-Based Access Control ──────────────────────────────────────────────
// Maps each ZAG role (as stored in the NextAuth session) to the set of module
// paths it may access. "*" grants access to every module.
//
// Every role implicitly gets /dashboard, /team-reports (to file DAR/WWR/MWR),
// and /documents — see BASE_PATHS below.

export type Role =
  | "MD"
  | "AVP"
  | "Business Manager"
  | "Sales Executive"
  | "CRES"
  | "Production"
  | "Accounts"
  | "HR"
  | "IT Admin";

/** Paths every authenticated user can reach regardless of role. */
const BASE_PATHS = ["/dashboard", "/team-reports", "/documents"];

/** Full-access roles see every module. */
const FULL_ACCESS: Role[] = ["MD", "IT Admin"];

/** Admin-only paths: only MD and IT Admin can access */
const ADMIN_PATHS = ["/admin/users", "/admin/database", "/admin/audit"];

/** Per-role allow-lists (in addition to BASE_PATHS). */
const ROLE_PATHS: Record<Role, string[]> = {
  MD: ["*"],
  AVP: ["*"],
  "IT Admin": ["*"],

  "Business Manager": [
    "/kpi",
    "/leads", "/opportunities", "/customers", "/quotations", "/sales-orders",
    "/work-orders", "/production", "/inventory",
    "/accounts", "/collections",
    "/complaints", "/tasks", "/hr", "/field-visits",
    "/reports", "/ai-insights",
  ],

  "Sales Executive": [
    "/leads", "/opportunities", "/customers", "/quotations", "/sales-orders",
    "/field-visits", "/tasks", "/complaints",
  ],

  CRES: [
    "/leads", "/customers", "/complaints", "/tasks", "/field-visits",
  ],

  Production: [
    "/work-orders", "/production", "/inventory", "/tasks",
  ],

  Accounts: [
    "/kpi", "/customers", "/accounts", "/collections", "/reports", "/tasks",
  ],

  HR: [
    "/hr", "/tasks",
  ],
};

/** True if the given role may access the given module path. */
export function canAccess(role: string | undefined | null, path: string): boolean {
  if (!role) return false;
  const r = role as Role;

  // Admin paths: MD and IT Admin only
  if (ADMIN_PATHS.some(p => path === p || path.startsWith(p + "/"))) {
    return r === "MD" || r === "IT Admin";
  }

  if (FULL_ACCESS.includes(r)) return true;
  if (BASE_PATHS.some((p) => path === p || path.startsWith(p + "/"))) return true;

  const allowed = ROLE_PATHS[r];
  if (!allowed) return false;
  if (allowed.includes("*")) return true;

  return allowed.some((p) => path === p || path.startsWith(p + "/"));
}

/** Default landing path for a role (always allowed). */
export function homePath(): string {
  return "/dashboard";
}

/** Every module path the app guards. Non-module paths (/, 404s) are not gated. */
export const ALL_MODULE_PATHS = [
  "/dashboard", "/kpi",
  "/leads", "/opportunities", "/customers", "/quotations", "/sales-orders",
  "/work-orders", "/production", "/inventory",
  "/accounts", "/collections",
  "/complaints", "/tasks", "/hr", "/field-visits",
  "/team-reports", "/reports", "/ai-insights", "/documents",
  "/admin/users", "/admin/database", "/admin/audit",
];

/** True if a path is a guarded module page (and therefore subject to canAccess). */
export function isGuardedPath(path: string): boolean {
  return ALL_MODULE_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}
