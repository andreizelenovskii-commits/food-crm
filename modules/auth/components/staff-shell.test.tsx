import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StaffShell } from "@/modules/auth/components/staff-shell";
import type { SessionUser } from "@/modules/auth/auth.types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dispatcher/orders",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/modules/auth/auth.actions", () => ({
  logoutAction: vi.fn(),
}));

const dispatcher: SessionUser = {
  id: "u1",
  email: "dispatcher@example.test",
  displayName: "Диспетчер смены",
  role: "Диспетчер",
  permissions: ["view_orders", "manage_orders", "view_clients"],
};

describe("StaffShell", () => {
  it("renders dispatcher work tabs without full CRM sidebar modules", () => {
    render(
      <StaffShell
        user={dispatcher}
        title="Диспетчерская"
        subtitle="Заказы и клиенты смены"
        activeHref="/dispatcher/orders"
        navItems={[
          { href: "/dispatcher/orders", label: "Заказы" },
          { href: "/dispatcher/clients", label: "Клиенты" },
        ]}
      >
        <div>Рабочая область</div>
      </StaffShell>,
    );

    expect(screen.getByRole("link", { name: "Заказы" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Клиенты" })).toBeInTheDocument();
    expect(screen.queryByText("Склад")).not.toBeInTheDocument();
    expect(screen.queryByText("Настройки")).not.toBeInTheDocument();
  });

  it("shows a back to CRM action for managers in operational screens", () => {
    render(
      <StaffShell
        user={{ ...dispatcher, role: "Управляющий", permissions: [] }}
        title="Кухня"
        subtitle="Очередь заказов"
        activeHref="/kitchen"
        navItems={[]}
      >
        <div>Рабочая область</div>
      </StaffShell>,
    );

    expect(screen.getByRole("link", { name: "← Вернуться в CRM" })).toHaveAttribute("href", "/dashboard");
  });

  it("does not show a back to CRM action for restricted staff", () => {
    render(
      <StaffShell
        user={dispatcher}
        title="Диспетчерская"
        subtitle="Заказы и клиенты"
        activeHref="/dispatcher/orders"
        navItems={[
          { href: "/dispatcher/orders", label: "Заказы" },
          { href: "/dispatcher/clients", label: "Клиенты" },
        ]}
      >
        <div>Рабочая область</div>
      </StaffShell>,
    );

    expect(screen.queryByRole("link", { name: "← Вернуться в CRM" })).not.toBeInTheDocument();
  });
});
