import type { ReactNode } from "react";
import { StaffShell } from "@/modules/auth/components/staff-shell";
import { EmployeeSessionProvider } from "@/modules/auth/components/employee-session-provider";
import { requireWorkspaceAccess } from "@/modules/auth/server/employee-session";
import { WorkspaceNavigationListener } from "@/modules/navigation/workspace-navigation-listener";

const DISPATCHER_NAV = [
  { href: "/dispatcher/orders", label: "Заказы" },
  { href: "/dispatcher/clients", label: "Клиенты" },
];

export default async function DispatcherLayout({ children }: { children: ReactNode }) {
  const user = await requireWorkspaceAccess("dispatcher");

  return (
    <EmployeeSessionProvider initialUser={user}>
      <WorkspaceNavigationListener />
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
