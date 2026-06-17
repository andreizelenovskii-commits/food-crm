import { redirect } from "next/navigation";
import { StaffShell } from "@/modules/auth/components/staff-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { getUserHomePath } from "@/modules/auth/auth.redirect";
import { fetchOrders } from "@/modules/orders/orders.api";
import { SimpleDispatcherOrders } from "@/modules/orders/components/simple-dispatcher-orders";
import { canCreateOrders } from "@/modules/orders/orders.workflow";

const DISPATCHER_NAV = [
  { href: "/dispatcher/orders", label: "Заказы" },
  { href: "/dispatcher/clients", label: "Клиенты" },
];

export default async function DispatcherOrdersPage() {
  const user = await requirePermission("view_orders");

  if (!canCreateOrders(user.role)) {
    redirect(getUserHomePath(user));
  }

  const orders = await fetchOrders();

  return (
    <StaffShell
      user={user}
      title="Диспетчер"
      subtitle="Заказы смены без лишних CRM-разделов"
      navItems={DISPATCHER_NAV}
      activeHref="/dispatcher/orders"
    >
      <SimpleDispatcherOrders user={user} orders={orders} />
    </StaffShell>
  );
}
