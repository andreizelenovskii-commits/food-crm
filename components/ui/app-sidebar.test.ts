import { describe, expect, it } from "vitest";
import { getVisibleNavItems, getVisibleOperationalItems } from "@/components/ui/app-sidebar";
import type { SessionUser } from "@/modules/auth/auth.types";

function user(role: SessionUser["role"], permissions: string[] = []): SessionUser {
  return {
    id: 1,
    phone: "79000000000",
    role,
    permissions,
  };
}

describe("getVisibleNavItems", () => {
  it("shows full CRM navigation to manager even with stale permissions", () => {
    const labels = getVisibleNavItems(user("Управляющий", [])).map((item) => item.label);

    expect(labels).toContain("Главная");
    expect(labels).toContain("Склад");
    expect(labels).toContain("Клиенты");
    expect(labels).toContain("Каталог");
    expect(labels).toContain("Управленческий учет");
    expect(labels).toContain("Сотрудники");
    expect(labels).toContain("Настройки");
    expect(labels).not.toContain("Заказы");
    expect(labels).not.toContain("Кухня");
  });

  it("shows operational screens only to full access roles", () => {
    const managerItems = getVisibleOperationalItems(user("Управляющий", [])).map((item) => ({
      href: item.href,
      label: item.label,
    }));
    const dispatcherItems = getVisibleOperationalItems(user("Диспетчер", [
      "view_dashboard",
      "view_orders",
      "manage_orders",
      "view_catalog",
      "view_clients",
    ]));
    const cookItems = getVisibleOperationalItems(user("Повар", ["view_dashboard", "view_orders"]));

    expect(managerItems).toEqual([
      { href: "/dispatcher/orders", label: "Диспетчерская" },
      { href: "/kitchen", label: "Кухня" },
    ]);
    expect(dispatcherItems).toEqual([]);
    expect(cookItems).toEqual([]);
  });

  it("keeps staff roles out of inventory navigation", () => {
    const dispatcherLabels = getVisibleNavItems(user("Диспетчер", [
      "view_dashboard",
      "view_orders",
      "manage_orders",
      "view_catalog",
      "view_clients",
    ])).map((item) => item.label);
    const cookLabels = getVisibleNavItems(user("Повар", ["view_dashboard", "view_orders"])).map((item) => item.label);

    expect(dispatcherLabels).not.toContain("Склад");
    expect(cookLabels).not.toContain("Склад");
  });
});
