import type { OrderListItem } from "@/modules/orders/orders.types";
import type { OrderCreateOptions } from "@/modules/orders/orders.page-model";
import { backendGet } from "@/shared/api/backend";

export async function fetchOrders(): Promise<OrderListItem[]> {
  return backendGet<OrderListItem[]>("/api/v1/orders");
}

export async function fetchOrderById(orderId: number): Promise<OrderListItem | null> {
  return backendGet<OrderListItem | null>(`/api/v1/orders/${orderId}`);
}

export async function fetchOrderCreateOptions(): Promise<OrderCreateOptions> {
  return backendGet<OrderCreateOptions>("/api/v1/orders/options");
}
