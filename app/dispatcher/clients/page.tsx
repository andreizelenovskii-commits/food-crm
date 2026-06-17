import { redirect } from "next/navigation";
import { StaffShell } from "@/modules/auth/components/staff-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { getUserHomePath } from "@/modules/auth/auth.redirect";
import { fetchClients } from "@/modules/clients/clients.api";
import { SimpleDispatcherClients } from "@/modules/clients/components/simple-dispatcher-clients";
import { canCreateOrders } from "@/modules/orders/orders.workflow";

const DISPATCHER_NAV = [
  { href: "/dispatcher/orders", label: "Заказы" },
  { href: "/dispatcher/clients", label: "Клиенты" },
];

export default async function DispatcherClientsPage() {
  const user = await requirePermission("view_clients");

  if (!canCreateOrders(user.role)) {
    redirect(getUserHomePath(user));
  }

  const clients = await fetchClients();

  return (
    <StaffShell
      user={user}
      title="Диспетчер"
      subtitle="Клиентская база для приёма заказов"
      navItems={DISPATCHER_NAV}
      activeHref="/dispatcher/clients"
    >
      <SimpleDispatcherClients clients={clients} />
    </StaffShell>
  );
}
