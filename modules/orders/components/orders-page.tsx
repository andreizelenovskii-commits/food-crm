import { PageShell } from "@/components/ui/page-shell";
import { OrdersWorkspace } from "@/modules/orders/components/orders-workspace";
import type { OrderListItem } from "@/modules/orders/orders.types";
import type { ProductItem } from "@/modules/inventory/inventory.types";

type OrdersPageProps = {
  period?: string | null;
  date?: string | null;
  orders: OrderListItem[];
  packagingOptions: ProductItem[];
};

export function OrdersPage({
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
    >
      <OrdersWorkspace
        period={period}
        date={date}
        orders={orders}
        packagingOptions={packagingOptions}
      />
    </PageShell>
  );
}
