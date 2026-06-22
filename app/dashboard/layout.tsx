import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { EmployeeSessionProvider } from "@/modules/auth/components/employee-session-provider";
import { getUserHomePath } from "@/modules/auth/auth.redirect";
import { requireWorkspaceAccess } from "@/modules/auth/server/employee-session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireWorkspaceAccess("crm");
  const roleHomePath = getUserHomePath(user);

  if (roleHomePath !== "/dashboard") {
    redirect(roleHomePath);
  }

  return (
    <EmployeeSessionProvider initialUser={user}>
      <main className="min-h-screen bg-transparent">
        <div className="min-h-screen md:flex">
          <AppSidebar user={user} />
          <div className="mx-auto w-full min-w-0 flex-1 px-4 pb-4 pt-16 sm:px-5 md:pt-4 lg:px-6">
            <div className="mb-4 flex justify-end">
              <SessionUserActions user={user} />
            </div>
            {children}
          </div>
        </div>
      </main>
    </EmployeeSessionProvider>
  );
}
