import { fetchClients } from "@/modules/clients/clients.api";
import { buildClientsPageViewModel } from "@/modules/clients/clients.page-model";
import { DashboardPage } from "@/modules/dashboard/components/dashboard-page";
import {
  type DashboardPageSearchParams,
} from "@/modules/dashboard/dashboard.page-model";
import {
  getDashboardMetrics,
} from "@/modules/dashboard/dashboard.api";

export default async function DashboardRoutePage(props: {
  searchParams?: Promise<DashboardPageSearchParams>;
}) {
  await props.searchParams;
  const [dashboard, clients] = await Promise.all([
    getDashboardMetrics(),
    fetchClients(),
  ]);
  const clientsViewModel = buildClientsPageViewModel(clients, "");

  return (
    <DashboardPage
      dashboard={dashboard}
      employeeDashboard={null}
      upcomingBirthdays={clientsViewModel.upcomingBirthdays}
    />
  );
}
