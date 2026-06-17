import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";
import { getUserHomePath } from "@/modules/auth/auth.redirect";
import { fetchClients } from "@/modules/clients/clients.api";
import { buildClientsPageViewModel } from "@/modules/clients/clients.page-model";
import { DashboardPage } from "@/modules/dashboard/components/dashboard-page";
import { resolveDashboardSelectedMonth, type DashboardPageSearchParams } from "@/modules/dashboard/dashboard.page-model";
import {
  getDashboardMetrics,
  getEmployeeDashboardMetricsForSession,
} from "@/modules/dashboard/dashboard.api";

const STAFF_ROLES = new Set(["Повар", "Курьер", "Диспетчер"]);

export default async function DashboardRoutePage(props: {
  searchParams?: Promise<DashboardPageSearchParams>;
}) {
  const user = await requirePermission("view_dashboard");
  const roleHomePath = getUserHomePath(user);
  if (roleHomePath !== "/dashboard") {
    redirect(roleHomePath);
  }

  const searchParams = await props.searchParams;
  const selectedMonth = resolveDashboardSelectedMonth(searchParams);
  const [dashboard, clients] = await Promise.all([
    getDashboardMetrics(),
    fetchClients(),
  ]);
  const clientsViewModel = buildClientsPageViewModel(clients, "");
  const employeeDashboard = STAFF_ROLES.has(user.role)
    ? await getEmployeeDashboardMetricsForSession(selectedMonth)
    : null;

  return (
    <DashboardPage
      user={user}
      dashboard={dashboard}
      employeeDashboard={employeeDashboard}
      upcomingBirthdays={clientsViewModel.upcomingBirthdays}
    />
  );
}
