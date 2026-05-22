import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { OrdersWorkspace } from "@/modules/orders/components/orders-workspace";
import type { OrderCreateOptions } from "@/modules/orders/orders.page-model";
import type { OrderListItem } from "@/modules/orders/orders.types";
import type { ProductItem } from "@/modules/inventory/inventory.types";
import type { SessionUser } from "@/modules/auth/auth.types";

type OrdersPageProps = {
  user: SessionUser;
  canCreate: boolean;
  orders: OrderListItem[];
  packagingOptions: ProductItem[];
  orderCreateOptions: OrderCreateOptions;
};

export function OrdersPage({
  user,
  canCreate,
  orders,
  packagingOptions,
  orderCreateOptions,
}: OrdersPageProps) {
  return (
    <PageShell
      title="Заказы"
      description="Единый рабочий модуль для клиентских, закрытых и внутренних заказов."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <OrdersWorkspace
        user={user}
        canCreate={canCreate}
        orders={orders}
        packagingOptions={packagingOptions}
        orderCreateOptions={orderCreateOptions}
      />
    </PageShell>
  );
}
