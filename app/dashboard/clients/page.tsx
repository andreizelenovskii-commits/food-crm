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
  const searchParams = await props.searchParams;
  const clients = await fetchClients();
  const rawQuery = resolveClientsQuery(searchParams);
  const activeLoyaltyLevel = resolveClientsLoyaltyLevel(searchParams);

  return (
    <ClientsPage
      canManageClients={true}
      viewModel={buildClientsPageViewModel(clients, rawQuery, activeLoyaltyLevel)}
    />
  );
}
