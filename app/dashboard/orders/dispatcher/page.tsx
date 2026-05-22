import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { PageShell } from "@/components/ui/page-shell";
import { DispatcherWorkspace } from "@/modules/orders/components/dispatcher-workspace";
import { type OrderCreateOptions } from "@/modules/orders/orders.page-model";
import { fetchOrderCreateOptions, fetchOrders, fetchPackagingOptions } from "@/modules/orders/orders.api";
import { canCreateOrders } from "@/modules/orders/orders.workflow";

const EMPTY_ORDER_CREATE_OPTIONS: OrderCreateOptions = {
  clients: [],
  employees: [],
  catalogItems: [],
};

export default async function DispatcherOrdersPage() {
  const user = await requirePermission("view_orders");
  const canManageOrders = hasPermission(user, "manage_orders");
  const canCreate = canCreateOrders(user.role) && canManageOrders;
  const [orders, packagingOptions, orderCreateOptions] = await Promise.all([
    fetchOrders(),
    fetchPackagingOptions(),
    canCreate ? fetchOrderCreateOptions() : Promise.resolve(EMPTY_ORDER_CREATE_OPTIONS),
  ]);

  return (
    <PageShell
      title="Экран диспетчера"
      backHref="/dashboard/orders"
      action={<SessionUserActions user={user} />}
    >
      <DispatcherWorkspace
        user={user}
        canCreate={canCreate}
        orders={orders}
        packagingOptions={packagingOptions}
        orderCreateOptions={orderCreateOptions}
      />
    </PageShell>
  );
}
