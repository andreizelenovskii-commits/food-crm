"use client";

import { useMemo, useState } from "react";
import type { SessionUser } from "@/modules/auth/auth.types";
import { OrderStatusButton } from "@/modules/orders/components/order-status-button";
import { formatOrderMoney } from "@/modules/orders/components/order-display";
import type { OrderListItem, OrderStatus } from "@/modules/orders/orders.types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, canCancelOrder, getOrderAdvanceAction } from "@/modules/orders/orders.workflow";

type DispatcherOrderGroup = "new" | "work" | "done";

const DISPATCHER_GROUPS: Array<{
  key: DispatcherOrderGroup;
  label: string;
  emptyText: string;
}> = [
  { key: "new", label: "Новые", emptyText: "Новых заказов нет" },
  { key: "work", label: "В работе", emptyText: "Заказов в работе нет" },
  { key: "done", label: "Выполненные", emptyText: "Выполненных заказов пока нет" },
];

function getOrderGroup(status: OrderStatus): DispatcherOrderGroup {
  if (status === "DELIVERED_PAID" || status === "CANCELLED") {
    return "done";
  }

  if (status === "READY" || status === "PACKED") {
    return "work";
  }

  return "new";
}

function formatOrderTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getOrderItemsSummary(order: OrderListItem) {
  return order.items
    .slice(0, 3)
    .map((item) => `${item.itemName} x${item.quantity}`)
    .join(", ") || "Позиции не добавлены";
}

export function SimpleDispatcherOrders({ user, orders }: { user: SessionUser; orders: OrderListItem[] }) {
  const [activeGroup, setActiveGroup] = useState<DispatcherOrderGroup>("new");
  const [searchQuery, setSearchQuery] = useState("");
  const groupedOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return DISPATCHER_GROUPS.map((group) => ({
      ...group,
      orders: orders.filter((order) => {
        if (getOrderGroup(order.status) !== group.key) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [
          String(order.id),
          order.clientName,
          order.customerPhoneSnapshot ?? "",
        ].some((value) => value.toLowerCase().includes(query));
      }),
    }));
  }, [orders, searchQuery]);
  const active = groupedOrders.find((group) => group.key === activeGroup) ?? groupedOrders[0];

  return (
    <section className="space-y-4">
      <div className="rounded-[22px] border border-red-950/10 bg-white/86 p-4 shadow-sm shadow-red-950/5">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Поиск: номер, телефон, клиент"
          className="h-12 w-full rounded-full border border-red-950/10 bg-white px-4 text-base font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-4 focus:ring-red-800/10"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {groupedOrders.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => setActiveGroup(group.key)}
              className={[
                "inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold transition",
                activeGroup === group.key
                  ? "border-red-800 bg-red-800 text-white"
                  : "border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-50",
              ].join(" ")}
            >
              {group.label}
              <span className="ml-2 rounded-full bg-current/10 px-2 py-0.5 text-xs">{group.orders.length}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center rounded-full border border-red-100 bg-white px-4 text-sm font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Обновить
          </button>
        </div>
      </div>

      {active.orders.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-red-200 bg-white/70 px-4 py-14 text-center">
          <p className="text-lg font-semibold text-zinc-950">{active.emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {active.orders.map((order) => (
            <SimpleDispatcherOrderCard key={order.id} user={user} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}

function SimpleDispatcherOrderCard({ user, order }: { user: SessionUser; order: OrderListItem }) {
  const advanceAction = getOrderAdvanceAction(order.status, user.role);
  const canCancel = canCancelOrder(order.status, user.role);

  return (
    <article className="rounded-[22px] border border-red-100 bg-white p-4 shadow-[0_12px_36px_rgba(111,18,25,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black text-zinc-950">#{order.id}</h2>
            <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-black ${ORDER_STATUS_STYLES[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-500">{formatOrderTime(order.createdAt)}</p>
        </div>
        <p className="text-xl font-black text-red-800">{formatOrderMoney(order.totalCents)}</p>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <SimpleFact label="Клиент" value={order.clientName} />
        <SimpleFact label="Телефон" value={order.customerPhoneSnapshot ?? "Не указан"} />
        <SimpleFact label="Адрес" value={order.deliveryAddressSnapshot ?? "Самовывоз"} />
        <SimpleFact label="Состав" value={getOrderItemsSummary(order)} />
        {order.customerComment ? <SimpleFact label="Комментарий" value={order.customerComment} /> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-red-100 pt-4">
        {advanceAction ? (
          <OrderStatusButton orderId={order.id} status={advanceAction.status} label={advanceAction.label} />
        ) : null}
        {canCancel ? (
          <OrderStatusButton
            orderId={order.id}
            status="CANCELLED"
            label="Отменить"
            className="inline-flex h-10 items-center rounded-full border border-red-200 bg-white px-4 text-sm font-bold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        ) : null}
        {!advanceAction && !canCancel ? (
          <span className="text-sm font-semibold text-zinc-500">Действий сейчас нет</span>
        ) : null}
      </div>
    </article>
  );
}

function SimpleFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-red-50 bg-red-50/40 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-700">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-zinc-700">{value}</p>
    </div>
  );
}
