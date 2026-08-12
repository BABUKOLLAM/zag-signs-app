import { describe, it, expect } from "vitest";
import { canAccess, canAccessModules, defaultModulesForRole } from "@/lib/permissions";

describe("canAccess — role defaults", () => {
  it("grants full-access roles (AVP, IT Admin, Consultant) every path", () => {
    expect(canAccess("IT Admin", "/admin/database")).toBe(true);
    expect(canAccess("AVP", "/anything-not-in-any-list")).toBe(true);
    expect(canAccess("Consultant", "/accounts")).toBe(true);
  });

  it("grants base paths to every authenticated role", () => {
    expect(canAccess("Sales Executive", "/dashboard")).toBe(true);
    expect(canAccess("HR", "/help")).toBe(true);
  });

  it("keeps Sales Executive out of Accounts/Invoices (invoice generation is Accounts-only)", () => {
    expect(canAccess("Sales Executive", "/invoices")).toBe(false);
    expect(canAccess("Sales Executive", "/accounts")).toBe(false);
  });

  it("still gives Sales Executive Collections (AR) visibility", () => {
    expect(canAccess("Sales Executive", "/collections")).toBe(true);
  });

  it("scopes HR to its own module plus tasks", () => {
    expect(canAccess("HR", "/hr")).toBe(true);
    expect(canAccess("HR", "/tasks")).toBe(true);
    expect(canAccess("HR", "/customers")).toBe(false);
  });

  it("denies unknown/missing roles on a role-gated path (base paths like /dashboard are open to all)", () => {
    expect(canAccess(undefined, "/invoices")).toBe(false);
    expect(canAccess("Not A Real Role", "/invoices")).toBe(false);
  });

  it("matches sub-paths, not just exact paths", () => {
    expect(canAccess("Accounts", "/accounts/some-sub-page")).toBe(true);
  });
});

describe("canAccessModules — per-user override", () => {
  it("wildcard grants everything", () => {
    expect(canAccessModules(["*"], "/admin/database")).toBe(true);
  });
  it("only grants paths explicitly listed", () => {
    expect(canAccessModules(["/leads", "/customers"], "/leads")).toBe(true);
    expect(canAccessModules(["/leads", "/customers"], "/invoices")).toBe(false);
  });
  it("still grants base paths regardless of the override list", () => {
    expect(canAccessModules(["/leads"], "/dashboard")).toBe(true);
  });
});

describe("defaultModulesForRole", () => {
  it("returns wildcard for full-access roles", () => {
    expect(defaultModulesForRole("IT Admin")).toEqual(["*"]);
  });
  it("returns the role's explicit path list otherwise", () => {
    expect(defaultModulesForRole("HR")).toContain("/hr");
    expect(defaultModulesForRole("HR")).not.toContain("/invoices");
  });
});
