import { fetchClients } from "@/modules/clients/clients.api";
import { SimpleDispatcherClients } from "@/modules/clients/components/simple-dispatcher-clients";

export default async function DispatcherClientsPage() {
  const clients = await fetchClients();

  return <SimpleDispatcherClients clients={clients} />;
}
