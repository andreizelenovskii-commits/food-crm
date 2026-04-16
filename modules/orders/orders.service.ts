import { getOrders } from "@/modules/orders/orders.repository";
import type { OrderListItem } from "@/modules/orders/orders.types";

export async function fetchOrders(): Promise<OrderListItem[]> {
  return getOrders();
}
