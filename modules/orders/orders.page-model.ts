import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type { Client } from "@/modules/clients/clients.types";
import type { Employee } from "@/modules/employees/employees.types";
import { FINAL_ORDER_STATUS, isOrderClosed } from "@/modules/orders/orders.workflow";
import type { OrderListItem } from "@/modules/orders/orders.types";

export type OrderCreateOptions = {
  clients: Client[];
  employees: Employee[];
  catalogItems: CatalogItem[];
};

export function buildOrdersPageViewModel(orders: OrderListItem[]) {
  return {
    activeOrders: orders.filter((order) => !order.isInternal && !isOrderClosed(order.status)),
    completedOrders: orders.filter((order) => !order.isInternal && isOrderClosed(order.status)),
    internalOrders: orders.filter((order) => order.isInternal),
    totalRevenueCents: orders.reduce((sum, order) => sum + order.totalCents, 0),
    deliveredOrdersCount: orders.filter((order) => order.status === FINAL_ORDER_STATUS).length,
  };
}
