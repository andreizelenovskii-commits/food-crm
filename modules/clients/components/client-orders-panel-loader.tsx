"use client";

import { useEffect, useState } from "react";
import { useEmployeeSession } from "@/modules/auth/components/employee-session-provider";
import type { OrderListItem } from "@/modules/orders/orders.types";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/modules/orders/orders.workflow";
import { browserBackendJson } from "@/shared/api/browser-backend";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ClientOrdersPanelLoader({ clientId }: { clientId: number }) {
  const { can } = useEmployeeSession();
  const canViewOrders = can("view_orders");
  const [ordersState, setOrdersState] = useState<{
    clientId: number;
    orders: OrderListItem[];
  } | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!canViewOrders) {
      return () => {
        isActive = false;
      };
    }

    browserBackendJson<OrderListItem[]>(`/api/v1/orders/client/${clientId}`, { method: "GET" })
      .then((nextOrders) => {
        if (isActive) {
          setOrdersState({ clientId, orders: nextOrders });
        }
      })
      .catch(() => {
        if (isActive) {
          setOrdersState({ clientId, orders: [] });
        }
      });

    return () => {
      isActive = false;
    };
  }, [canViewOrders, clientId]);

  if (!canViewOrders) {
    return null;
  }

  const orders = ordersState?.clientId === clientId ? ordersState.orders : null;

  return (
    <div className="mt-3 rounded-[18px] border border-red-950/10 bg-white/72 px-4 py-3 shadow-sm shadow-red-950/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
            Заказы клиента
          </p>
          <h3 className="mt-1 text-base font-semibold text-zinc-950">История заказов</h3>
        </div>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-100">
          {orders?.length ?? "..."}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {!orders ? (
          <p className="rounded-[14px] border border-dashed border-zinc-200 bg-white/70 px-3 py-3 text-sm text-zinc-500">
            Загружаем историю заказов...
          </p>
        ) : orders.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-zinc-200 bg-white/70 px-3 py-3 text-sm text-zinc-500">
            Заказов пока нет.
          </p>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[14px] border border-zinc-200 bg-white/82 px-3 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-950">Заказ #{order.id}</p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${ORDER_STATUS_STYLES[order.status]}`}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className="mt-2 grid gap-1.5 text-xs leading-5 text-zinc-600 sm:grid-cols-2">
                <p>{formatOrderDate(order.createdAt)}</p>
                <p className="font-semibold text-zinc-950 sm:text-right">
                  {formatMoney(order.totalCents)}
                </p>
                <p>Исполнитель: {order.employeeName}</p>
                {order.discountPercent > 0 ? (
                  <p className="text-red-800 sm:text-right">Скидка {order.discountPercent}%</p>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
