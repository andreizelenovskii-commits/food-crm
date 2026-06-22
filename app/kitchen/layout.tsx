import type { ReactNode } from "react";
import { StaffShell } from "@/modules/auth/components/staff-shell";
import { EmployeeSessionProvider } from "@/modules/auth/components/employee-session-provider";
import { requireWorkspaceAccess } from "@/modules/auth/server/employee-session";
import { WorkspaceNavigationListener } from "@/modules/navigation/workspace-navigation-listener";

export default async function KitchenLayout({ children }: { children: ReactNode }) {
  const user = await requireWorkspaceAccess("kitchen");

  return (
    <EmployeeSessionProvider initialUser={user}>
      <WorkspaceNavigationListener />
      <StaffShell
        user={user}
        title="Кухня"
        subtitle="Очередь заказов для приготовления"
        navItems={[]}
      >
        {children}
      </StaffShell>
    </EmployeeSessionProvider>
  );
}
