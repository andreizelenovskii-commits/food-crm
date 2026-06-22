import type { ReactNode } from "react";
import { StaffShell } from "@/modules/auth/components/staff-shell";
import { EmployeeSessionProvider } from "@/modules/auth/components/employee-session-provider";
import { requireWorkspaceAccess } from "@/modules/auth/server/employee-session";

const DISPATCHER_NAV = [
  { href: "/dispatcher/orders", label: "Заказы" },
  { href: "/dispatcher/clients", label: "Клиенты" },
];

export default async function DispatcherLayout({ children }: { children: ReactNode }) {
  const user = await requireWorkspaceAccess("dispatcher");

  return (
    <EmployeeSessionProvider initialUser={user}>
      <StaffShell
        user={user}
        title="Диспетчер"
        subtitle="Заказы смены без лишних CRM-разделов"
        navItems={DISPATCHER_NAV}
      >
        {children}
      </StaffShell>
    </EmployeeSessionProvider>
  );
}
