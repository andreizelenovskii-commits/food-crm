import { redirect } from "next/navigation";
import { StaffShell } from "@/modules/auth/components/staff-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { getUserHomePath } from "@/modules/auth/auth.redirect";
import { canAccessDispatcherWorkspace } from "@/modules/auth/authz";
import { fetchClients } from "@/modules/clients/clients.api";
import { SimpleDispatcherClients } from "@/modules/clients/components/simple-dispatcher-clients";

const DISPATCHER_NAV = [
  { href: "/dispatcher/orders", label: "Заказы" },
  { href: "/dispatcher/clients", label: "Клиенты" },
];

export default async function DispatcherClientsPage(props: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const user = await requirePermission("view_clients");

  if (!canAccessDispatcherWorkspace(user)) {
    redirect(getUserHomePath(user));
  }

  const searchParams = await props.searchParams;
  const clients = await fetchClients();

  return (
    <StaffShell
      user={user}
      title="Диспетчер"
      subtitle="Клиентская база для приёма заказов"
      navItems={DISPATCHER_NAV}
      activeHref="/dispatcher/clients"
      returnTo={searchParams?.returnTo}
    >
      <SimpleDispatcherClients clients={clients} />
    </StaffShell>
  );
}
