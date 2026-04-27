import type { DashboardSnapshot, EmployeeDashboardSnapshot } from "@/modules/dashboard/dashboard.types";
import { backendGet } from "@/shared/api/backend";

export async function getDashboardMetrics(): Promise<DashboardSnapshot> {
  const data = await backendGet<{
    dashboard: DashboardSnapshot;
    employeeDashboard: EmployeeDashboardSnapshot | null;
  }>("/api/v1/dashboard");

  return data.dashboard;
}

export async function getEmployeeDashboardMetricsByEmail(
  _email: string,
  monthKey?: string | null,
): Promise<EmployeeDashboardSnapshot | null> {
  const query = monthKey ? `?month=${encodeURIComponent(monthKey)}` : "";
  const data = await backendGet<{
    dashboard: DashboardSnapshot;
    employeeDashboard: EmployeeDashboardSnapshot | null;
  }>(`/api/v1/dashboard${query}`);

  return data.employeeDashboard;
}
