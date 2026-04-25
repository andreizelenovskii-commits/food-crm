import { fetchClients } from "@/modules/clients/clients.service";
import { fetchCatalogItems } from "@/modules/catalog/catalog.service";
import { fetchEmployees } from "@/modules/employees/employees.service";
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "@/modules/orders/orders.repository";
import type {
  OrderCreateInput,
  OrderListItem,
  OrderStatus,
} from "@/modules/orders/orders.types";

export async function fetchOrders(): Promise<OrderListItem[]> {
  return getOrders();
}

export async function fetchOrderCreateOptions() {
  const [clients, employees, catalogItems] = await Promise.all([
    fetchClients(),
    fetchEmployees(),
    fetchCatalogItems(),
  ]);

  return {
    clients,
    employees,
    catalogItems,
  };
}

export async function addOrder(input: OrderCreateInput) {
  return createOrder(input);
}

export async function fetchOrderById(orderId: number) {
  return getOrderById(orderId);
}

export async function updateOrderStatusById(orderId: number, status: OrderStatus) {
  return updateOrderStatus(orderId, status);
}
