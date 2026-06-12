import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { OrdersWorkspace } from "@/modules/orders/components/orders-workspace";
import type { OrderListItem } from "@/modules/orders/orders.types";
import type { ProductItem } from "@/modules/inventory/inventory.types";
import type { SessionUser } from "@/modules/auth/auth.types";

type OrdersPageProps = {
  user: SessionUser;
  period?: string | null;
  date?: string | null;
  orders: OrderListItem[];
  packagingOptions: ProductItem[];
};

export function OrdersPage({
  user,
  period,
  date,
  orders,
  packagingOptions,
}: OrdersPageProps) {
  return (
    <PageShell
      title="Заказы"
      description="Операционная доска заказов: новые, в работе и выполненные по выбранному периоду."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <OrdersWorkspace
        user={user}
        period={period}
        date={date}
        orders={orders}
        packagingOptions={packagingOptions}
      />
    </PageShell>
  );
}
