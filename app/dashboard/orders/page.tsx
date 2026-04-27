import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { OrdersPage } from "@/modules/orders/components/orders-page";
import { type OrderCreateOptions } from "@/modules/orders/orders.page-model";
import { fetchOrderCreateOptions, fetchOrders } from "@/modules/orders/orders.api";
import { canCreateOrders } from "@/modules/orders/orders.workflow";

const EMPTY_ORDER_CREATE_OPTIONS: OrderCreateOptions = {
  clients: [],
  employees: [],
  catalogItems: [],
};

export default async function OrdersRoutePage() {
  const user = await requirePermission("view_orders");
  const canManageOrders = hasPermission(user, "manage_orders");
  const canCreate = canCreateOrders(user.role) && canManageOrders;
  const [orders, orderCreateOptions] = await Promise.all([
    fetchOrders(),
    canCreate ? fetchOrderCreateOptions() : Promise.resolve(EMPTY_ORDER_CREATE_OPTIONS),
  ]);

  return (
    <OrdersPage
      user={user}
      canCreate={canCreate}
      orders={orders}
      orderCreateOptions={orderCreateOptions}
    />
  );
}
