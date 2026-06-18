import { describe, expect, it } from "vitest";
import {
  buildDashboardPageViewModel,
  isStaffRestrictedRole,
  shouldFetchDashboardClients,
} from "@/modules/dashboard/dashboard.page-model";
import type { SessionUser } from "@/modules/auth/auth.types";
import type { DashboardSnapshot } from "@/modules/dashboard/dashboard.types";

function user(role: SessionUser["role"], permissions: string[] = []): SessionUser {
  return {
    id: 1,
    phone: "79000000000",
    role,
    permissions,
  };
}

const dashboard: DashboardSnapshot = {
  entityCounts: {
    clients: 2,
    employees: 3,
    orders: 4,
    products: 5,
  },
  statistics: [],
  sales: [],
};

describe("dashboard role model", () => {
  it("keeps full CRM roles out of restricted staff logic", () => {
    expect(isStaffRestrictedRole("Управляющий")).toBe(false);
    expect(isStaffRestrictedRole("Администратор")).toBe(false);
    expect(isStaffRestrictedRole("admin")).toBe(false);
    expect(isStaffRestrictedRole("Шеф повар")).toBe(false);
    expect(isStaffRestrictedRole("Старший курьер")).toBe(false);
  });

  it("keeps staff roles in restricted logic", () => {
    expect(isStaffRestrictedRole("Диспетчер")).toBe(true);
    expect(isStaffRestrictedRole("Повар")).toBe(true);
    expect(isStaffRestrictedRole("Курьер")).toBe(true);
  });

  it("does not fetch clients for users without view_clients", () => {
    expect(shouldFetchDashboardClients(user("Курьер", ["view_dashboard", "view_orders"]))).toBe(false);
    expect(shouldFetchDashboardClients(user("Повар", ["view_dashboard", "view_orders"]))).toBe(false);
  });

  it("fetches clients for manager even when permissions are stale", () => {
    expect(shouldFetchDashboardClients(user("Управляющий", []))).toBe(true);
  });

  it("shows inventory module to manager but not dispatcher or cook", () => {
    const managerModel = buildDashboardPageViewModel({
      user: user("Управляющий", []),
      dashboard,
      employeeDashboard: null,
    });
    const dispatcherModel = buildDashboardPageViewModel({
      user: user("Диспетчер", ["view_dashboard", "view_orders", "manage_orders", "view_catalog", "view_clients"]),
      dashboard,
      employeeDashboard: null,
    });
    const cookModel = buildDashboardPageViewModel({
      user: user("Повар", ["view_dashboard", "view_orders"]),
      dashboard,
      employeeDashboard: null,
    });

    expect(managerModel.isStaffRole).toBe(false);
    expect(managerModel.visibleModuleCards.map((card) => card.label)).toContain("Склад");
    expect(dispatcherModel.visibleModuleCards.map((card) => card.label)).not.toContain("Склад");
    expect(cookModel.visibleModuleCards.map((card) => card.label)).not.toContain("Склад");
  });
});
