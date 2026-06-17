import { describe, expect, it } from "vitest";
import {
  AUTH_PERMISSIONS,
  canAccessCrmShell,
  canAccessDispatcherWorkspace,
  canAccessKitchenWorkspace,
  hasPermission,
  isFullAccessRole,
  isRestrictedStaffRole,
  shouldShowBackToCrm,
} from "@/modules/auth/authz";
import type { SessionUser } from "@/modules/auth/auth.types";

describe("hasPermission", () => {
  it("keeps manager full CRM access even when backend permissions are stale", () => {
    const manager: SessionUser = {
      id: 1,
      phone: "79000000000",
      role: "Управляющий",
      permissions: [],
    };

    expect(isFullAccessRole(manager.role)).toBe(true);
    expect(hasPermission(manager, "view_dashboard")).toBe(true);
    expect(hasPermission(manager, "view_inventory")).toBe(true);
    expect(hasPermission(manager, "manage_inventory")).toBe(true);
    expect(hasPermission(manager, "view_clients")).toBe(true);
    expect(hasPermission(manager, "manage_clients")).toBe(true);
    expect(hasPermission(manager, "view_orders")).toBe(true);
    expect(hasPermission(manager, "manage_orders")).toBe(true);
    expect(AUTH_PERMISSIONS.every((permission) => hasPermission(manager, permission))).toBe(true);
  });

  it("keeps dispatcher and cook out of inventory", () => {
    expect(hasPermission({
      id: 2,
      phone: "79000000001",
      role: "Диспетчер",
      permissions: ["view_dashboard", "view_orders", "manage_orders", "view_catalog", "view_clients"],
    }, "view_inventory")).toBe(false);

    expect(hasPermission({
      id: 3,
      phone: "79000000002",
      role: "Повар",
      permissions: ["view_dashboard", "view_orders"],
    }, "view_inventory")).toBe(false);
  });

  it("keeps manager out of restricted staff logic", () => {
    expect(isRestrictedStaffRole("Диспетчер")).toBe(true);
    expect(isRestrictedStaffRole("Повар")).toBe(true);
    expect(isRestrictedStaffRole("Курьер")).toBe(true);
    expect(isRestrictedStaffRole("Управляющий")).toBe(false);
    expect(isRestrictedStaffRole("Администратор")).toBe(false);
    expect(isRestrictedStaffRole("admin")).toBe(false);
    expect(isRestrictedStaffRole("Шеф повар")).toBe(false);
    expect(isRestrictedStaffRole("Старший курьер")).toBe(false);
  });

  it("allows full access roles into operational workspaces without changing CRM access", () => {
    expect(canAccessCrmShell("Управляющий")).toBe(true);
    expect(canAccessDispatcherWorkspace("Управляющий")).toBe(true);
    expect(canAccessKitchenWorkspace("Управляющий")).toBe(true);
    expect(canAccessDispatcherWorkspace("Администратор")).toBe(true);
    expect(canAccessKitchenWorkspace("admin")).toBe(true);

    expect(canAccessCrmShell("Диспетчер")).toBe(false);
    expect(canAccessDispatcherWorkspace("Диспетчер")).toBe(true);
    expect(canAccessKitchenWorkspace("Диспетчер")).toBe(false);

    expect(canAccessCrmShell("Повар")).toBe(false);
    expect(canAccessDispatcherWorkspace("Повар")).toBe(false);
    expect(canAccessKitchenWorkspace("Повар")).toBe(true);
  });

  it("shows back to CRM only for full access users in operational routes", () => {
    expect(shouldShowBackToCrm("Управляющий", "/kitchen")).toBe(true);
    expect(shouldShowBackToCrm("Управляющий", "/dispatcher/orders")).toBe(true);
    expect(shouldShowBackToCrm("Диспетчер", "/dispatcher/orders")).toBe(false);
    expect(shouldShowBackToCrm("Повар", "/kitchen")).toBe(false);
    expect(shouldShowBackToCrm("Управляющий", "/dashboard")).toBe(false);
  });
});
