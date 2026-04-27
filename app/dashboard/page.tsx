import { requirePermission } from "@/modules/auth/auth.session";
import { DashboardPage } from "@/modules/dashboard/components/dashboard-page";
import { resolveDashboardSelectedMonth, type DashboardPageSearchParams } from "@/modules/dashboard/dashboard.page-model";
import {
  getDashboardMetrics,
  getEmployeeDashboardMetricsByEmail,
} from "@/modules/dashboard/dashboard.api";

const STAFF_ROLES = new Set(["Повар", "Курьер", "Диспетчер"]);

export default async function DashboardRoutePage(props: {
  searchParams?: Promise<DashboardPageSearchParams>;
}) {
  const user = await requirePermission("view_dashboard");
  const searchParams = await props.searchParams;
  const selectedMonth = resolveDashboardSelectedMonth(searchParams);
  const dashboard = await getDashboardMetrics();
  const employeeDashboard = STAFF_ROLES.has(user.role)
    ? await getEmployeeDashboardMetricsByEmail(user.email, selectedMonth)
    : null;

  return (
    <DashboardPage
      user={user}
      dashboard={dashboard}
      employeeDashboard={employeeDashboard}
    />
  );
}
