import { KitchenWorkspace } from "@/modules/orders/components/kitchen-workspace";
import { fetchKitchenOrders } from "@/modules/orders/orders.api";
import type { KitchenOrderListItem } from "@/modules/orders/orders.types";

export default async function KitchenPage() {
  let orders: KitchenOrderListItem[] = [];
  let errorMessage: string | null = null;

  try {
    orders = await fetchKitchenOrders();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка API";
  }

  return (
    <KitchenWorkspace orders={orders} errorMessage={errorMessage} />
  );
}
