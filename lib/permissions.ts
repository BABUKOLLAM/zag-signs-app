// ─── Role-Based Access Control ──────────────────────────────────────────────
// Per-user DB overrides (UserPermission table) take priority over these
// role defaults. The PermissionContext in lib/permission-context.tsx fetches
// the override and falls back to canAccess() when none is stored.

export type Role =
  | "MD"
  | "AVP"
  | "Business Manager"
  | "Sales Executive"
  | "CRES"
  | "Production"
  | "Designer"
  | "Accounts"
  | "HR"
  | "IT Admin"
  | "Consultant";

/** Paths every authenticated user can reach regardless of role. */
const BASE_PATHS = ["/dashboard", "/team-reports", "/documents", "/help"];

/** Roles that get everything unless overridden per-user in DB. */
const FULL_ACCESS: Role[] = ["AVP", "IT Admin", "Consultant"];

const ROLE_PATHS: Record<Role, string[]> = {
  // MD sees reports & dashboard by default — IT Admin can unlock more via privileges page
  MD: [
    "/dashboard", "/kpi",
    "/reports", "/reports/tax", "/ai-insights",
    "/team-reports", "/documents",
    "/admin/settings", "/admin/users", "/admin/privileges",
    "/admin/database", "/admin/audit",
  ],

  AVP:        ["*"],
  "IT Admin": ["*"],
  Consultant: ["*"],

  "Business Manager": [
    "/kpi",
    "/leads", "/opportunities", "/customers", "/quotations", "/sales-orders",
    "/work-order-tickets",
    "/work-orders", "/production", "/inventory",
    "/accounts", "/collections", "/invoices",
    "/complaints", "/tasks", "/hr", "/field-visits",
    "/reports", "/reports/tax", "/ai-insights",
  ],

  "Sales Executive": [
    "/leads", "/opportunities", "/customers", "/quotations", "/sales-orders",
    "/work-order-tickets",
    "/field-visits", "/tasks", "/complaints",
  ],

  CRES: [
    "/leads", "/customers", "/complaints", "/tasks", "/field-visits",
    "/work-order-tickets",
  ],

  Production: [
    "/work-orders", "/production", "/inventory", "/tasks",
  ],

  Designer: [
    "/my-work", "/tasks",
  ],

  Accounts: [
    "/kpi", "/customers", "/accounts", "/collections",
    "/reports", "/reports/tax", "/tasks",
  ],

  HR: ["/hr", "/tasks"],
};

/** True if the given role may access the given path (role-default check only). */
export function canAccess(role: string | undefined | null, path: string): boolean {
  if (!role) return false;
  const r = role as Role;
  if (FULL_ACCESS.includes(r)) return true;
  if (BASE_PATHS.some((p) => path === p || path.startsWith(p + "/"))) return true;
  const allowed = ROLE_PATHS[r];
  if (!allowed) return false;
  if (allowed.includes("*")) return true;
  return allowed.some((p) => path === p || path.startsWith(p + "/"));
}

/** Check whether a custom modules array grants access to a path. */
export function canAccessModules(modules: string[], path: string): boolean {
  if (modules.includes("*")) return true;
  if (BASE_PATHS.some((p) => path === p || path.startsWith(p + "/"))) return true;
  return modules.some((m) => path === m || path.startsWith(m + "/"));
}

/** Default module list for a role — used to pre-fill the privilege editor. */
export function defaultModulesForRole(role: string): string[] {
  const r = role as Role;
  if (FULL_ACCESS.includes(r)) return ["*"];
  return ROLE_PATHS[r] ?? BASE_PATHS;
}

/** Default landing path for a role (always allowed). */
export function homePath(): string {
  return "/dashboard";
}

/** All guarded module paths (used by RouteGuard). */
export const ALL_MODULE_PATHS = [
  "/dashboard", "/kpi",
  "/leads", "/opportunities", "/customers", "/quotations", "/sales-orders",
  "/work-order-tickets", "/my-work",
  "/work-orders", "/production", "/inventory",
  "/accounts", "/collections", "/invoices",
  "/complaints", "/tasks", "/hr", "/field-visits",
  "/team-reports", "/reports", "/reports/tax", "/ai-insights", "/documents",
  "/admin/users", "/admin/database", "/admin/audit",
  "/admin/settings", "/admin/privileges",
  "/help",
];

/** True if a path is a guarded module page. */
export function isGuardedPath(path: string): boolean {
  return ALL_MODULE_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

/** Module groups for the privilege management UI. */
export const MODULE_GROUPS: { group: string; color: string; items: { path: string; label: string }[] }[] = [
  {
    group: "Dashboard & KPI", color: "indigo",
    items: [
      { path: "/dashboard", label: "Dashboard" },
      { path: "/kpi",       label: "KPI Monitor" },
    ],
  },
  {
    group: "CRM", color: "blue",
    items: [
      { path: "/leads",         label: "Leads" },
      { path: "/opportunities", label: "Opportunities" },
      { path: "/customers",     label: "Customers" },
    ],
  },
  {
    group: "Sales", color: "green",
    items: [
      { path: "/quotations",   label: "Quotations" },
      { path: "/sales-orders", label: "Sales Orders" },
    ],
  },
  {
    group: "Operations", color: "orange",
    items: [
      { path: "/work-order-tickets", label: "Work Order Tickets" },
      { path: "/my-work",            label: "Designer: My Work" },
      { path: "/work-orders",        label: "Work Orders (Production)" },
      { path: "/production",         label: "Production" },
      { path: "/inventory",          label: "Inventory" },
    ],
  },
  {
    group: "Finance", color: "emerald",
    items: [
      { path: "/accounts",    label: "Accounts / Invoices" },
      { path: "/collections", label: "Collections" },
    ],
  },
  {
    group: "People & Field", color: "purple",
    items: [
      { path: "/complaints",   label: "Complaints" },
      { path: "/tasks",        label: "Tasks" },
      { path: "/hr",           label: "HR" },
      { path: "/field-visits", label: "Field Visits" },
    ],
  },
  {
    group: "Reports", color: "rose",
    items: [
      { path: "/team-reports", label: "Team Reports (DAR/WWR/MWR)" },
      { path: "/reports",      label: "Reports & MIS" },
      { path: "/reports/tax",  label: "GST Tax Report" },
      { path: "/ai-insights",  label: "AI Insights" },
      { path: "/documents",    label: "Documents" },
    ],
  },
  {
    group: "Administration", color: "slate",
    items: [
      { path: "/admin/users",      label: "User Management" },
      { path: "/admin/settings",   label: "Company Settings" },
      { path: "/admin/privileges", label: "Privilege Management" },
      { path: "/admin/database",   label: "Database Studio" },
      { path: "/admin/audit",      label: "Audit Logs" },
    ],
  },
];
