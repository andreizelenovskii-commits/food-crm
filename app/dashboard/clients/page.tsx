import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { ClientsPage } from "@/modules/clients/components/clients-page";
import {
  buildClientsPageViewModel,
  resolveClientsLoyaltyLevel,
  resolveClientsQuery,
  type ClientsPageSearchParams,
} from "@/modules/clients/clients.page-model";
import { fetchClients } from "@/modules/clients/clients.api";

export default async function ClientsRoutePage(props: {
  searchParams?: Promise<ClientsPageSearchParams>;
}) {
  const user = await requirePermission("view_clients");
  const searchParams = await props.searchParams;
  const clients = await fetchClients();
  const rawQuery = resolveClientsQuery(searchParams);
  const activeLoyaltyLevel = resolveClientsLoyaltyLevel(searchParams);

  return (
    <ClientsPage
      user={user}
      canManageClients={hasPermission(user, "manage_clients")}
      viewModel={buildClientsPageViewModel(clients, rawQuery, activeLoyaltyLevel)}
    />
  );
}
