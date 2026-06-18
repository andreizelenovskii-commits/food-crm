import { describe, expect, it } from "vitest";
import {
  getAccessDeniedPath,
  getRoleHomePath,
  getSafeReturnTo,
  normalizeAuthReturnTo,
  normalizeRoleReturnTo,
} from "@/modules/auth/auth.redirect";

describe("normalizeAuthReturnTo", () => {
  it("keeps internal absolute paths", () => {
    expect(normalizeAuthReturnTo("/dashboard/orders")).toBe("/dashboard/orders");
  });

  it("trims whitespace around internal paths", () => {
    expect(normalizeAuthReturnTo("  /dashboard  ")).toBe("/dashboard");
  });

  it("rejects empty, relative and protocol-relative values", () => {
    expect(normalizeAuthReturnTo("")).toBe("/dashboard");
    expect(normalizeAuthReturnTo("dashboard")).toBe("/dashboard");
    expect(normalizeAuthReturnTo("//example.com")).toBe("/dashboard");
    expect(normalizeAuthReturnTo("https://example.com")).toBe("/dashboard");
  });

  it("uses a custom fallback when provided", () => {
    expect(normalizeAuthReturnTo("//example.com", "")).toBe("");
  });
});

describe("getRoleHomePath", () => {
  it("routes operators to their workspaces", () => {
    expect(getRoleHomePath("Диспетчер")).toBe("/dispatcher/orders");
    expect(getRoleHomePath("Повар")).toBe("/kitchen");
    expect(getRoleHomePath("Курьер")).toBe("/dashboard/profile");
  });

  it("keeps managers on the admin dashboard", () => {
    expect(getRoleHomePath("admin")).toBe("/dashboard");
    expect(getRoleHomePath("Администратор")).toBe("/dashboard");
    expect(getRoleHomePath("Управляющий")).toBe("/dashboard");
    expect(getRoleHomePath("Шеф повар")).toBe("/dashboard");
    expect(getRoleHomePath("Старший курьер")).toBe("/dashboard");
  });

  it("keeps unknown roles on a safe fallback", () => {
    expect(getRoleHomePath("unknown")).toBe("/access-denied");
  });

  it("uses a stable top-level access denied route", () => {
    expect(getAccessDeniedPath()).toBe("/access-denied");
  });
});

describe("getSafeReturnTo", () => {
  it("keeps safe CRM return targets", () => {
    expect(getSafeReturnTo("/dashboard")).toBe("/dashboard");
    expect(getSafeReturnTo("/dashboard/inventory")).toBe("/dashboard/inventory");
  });

  it("rejects external and non-CRM return targets", () => {
    expect(getSafeReturnTo("https://evil.com")).toBe("/dashboard");
    expect(getSafeReturnTo("javascript:alert(1)")).toBe("/dashboard");
    expect(getSafeReturnTo("//evil.com")).toBe("/dashboard");
    expect(getSafeReturnTo("/kitchen")).toBe("/dashboard");
    expect(getSafeReturnTo("")).toBe("/dashboard");
  });
});

describe("normalizeRoleReturnTo", () => {
  it("keeps managers on requested internal dashboard routes", () => {
    expect(normalizeRoleReturnTo("/dashboard/settings", { role: "Администратор" })).toBe("/dashboard/settings");
    expect(normalizeRoleReturnTo("/dashboard/inventory", { role: "Управляющий" })).toBe("/dashboard/inventory");
  });

  it("keeps dispatcher on dispatcher workspace instead of forbidden returnTo", () => {
    expect(normalizeRoleReturnTo("/dashboard/settings", { role: "Диспетчер" })).toBe("/dispatcher/orders");
    expect(normalizeRoleReturnTo("/dispatcher/orders", { role: "Диспетчер" })).toBe("/dispatcher/orders");
  });

  it("keeps cook on kitchen workspace instead of forbidden returnTo", () => {
    expect(normalizeRoleReturnTo("/dashboard/settings", { role: "Повар" })).toBe("/kitchen");
    expect(normalizeRoleReturnTo("/kitchen", { role: "Повар" })).toBe("/kitchen");
  });

  it("keeps courier on profile instead of the full dashboard", () => {
    expect(normalizeRoleReturnTo("/dashboard/settings", { role: "Курьер" })).toBe("/dashboard/profile");
    expect(normalizeRoleReturnTo("/dashboard/profile", { role: "Курьер" })).toBe("/dashboard/profile");
  });
});
