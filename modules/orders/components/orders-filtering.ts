import type { OrderListItem } from "@/modules/orders/orders.types";
import { isOrderClosed } from "@/modules/orders/orders.workflow";

export type OrderScope = "all" | "closed" | "internal";
export type DateMode = "day" | "month";

export const SCOPE_LABELS: Record<OrderScope, string> = {
  all: "Все заказы",
  closed: "Закрытые заказы",
  internal: "Внутренние заказы",
};

export function buildDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function buildMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function matchesDateFilter(order: OrderListItem, mode: DateMode, value: string) {
  if (!value) {
    return true;
  }

  const createdAt = new Date(order.createdAt);

  if (Number.isNaN(createdAt.getTime())) {
    return false;
  }

  return mode === "day" ? buildDayKey(createdAt) === value : buildMonthKey(createdAt) === value;
}

export function filterByScope(orders: OrderListItem[], scope: OrderScope) {
  switch (scope) {
    case "closed":
      return orders.filter((order) => !order.isInternal && isOrderClosed(order.status));
    case "internal":
      return orders.filter((order) => order.isInternal);
    case "all":
      return orders;
  }
}

export function sortOrdersNewestFirst(orders: OrderListItem[]) {
  return [...orders].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function summarizeOrders(orders: OrderListItem[]) {
  const completed = orders.filter((order) => order.status === "DELIVERED_PAID").length;
  const cancelled = orders.filter((order) => order.status === "CANCELLED").length;

  return {
    total: orders.length,
    active: orders.filter((order) => !isOrderClosed(order.status)).length,
    completed,
    cancelled,
    revenueCents: orders.reduce((sum, order) => sum + order.totalCents, 0),
  };
}
