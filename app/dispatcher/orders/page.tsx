import { redirect } from "next/navigation";
import { StaffShell } from "@/modules/auth/components/staff-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { getUserHomePath } from "@/modules/auth/auth.redirect";
import { canAccessDispatcherWorkspace } from "@/modules/auth/authz";
import { fetchOrders } from "@/modules/orders/orders.api";
import { SimpleDispatcherOrders } from "@/modules/orders/components/simple-dispatcher-orders";

const DISPATCHER_NAV = [
  { href: "/dispatcher/orders", label: "Заказы" },
  { href: "/dispatcher/clients", label: "Клиенты" },
];

export default async function DispatcherOrdersPage(props: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const user = await requirePermission("view_orders");

  if (!canAccessDispatcherWorkspace(user)) {
    redirect(getUserHomePath(user));
  }

  const searchParams = await props.searchParams;
  const orders = await fetchOrders();

  return (
    <StaffShell
      user={user}
      title="Диспетчер"
      subtitle="Заказы смены без лишних CRM-разделов"
      navItems={DISPATCHER_NAV}
      activeHref="/dispatcher/orders"
      returnTo={searchParams?.returnTo}
    >
      <SimpleDispatcherOrders user={user} orders={orders} />
    </StaffShell>
  );
}
