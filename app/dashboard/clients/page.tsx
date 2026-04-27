import { redirect } from "next/navigation";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { ClientsPage } from "@/modules/clients/components/clients-page";
import {
  buildClientsPageViewModel,
  findExactClientPhoneMatch,
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
  const exactPhoneMatch = findExactClientPhoneMatch(clients, rawQuery);

  if (exactPhoneMatch) {
    redirect(`/dashboard/clients/${exactPhoneMatch.id}`);
  }

  return (
    <ClientsPage
      user={user}
      canManageClients={hasPermission(user, "manage_clients")}
      viewModel={buildClientsPageViewModel(clients, rawQuery)}
    />
  );
}
