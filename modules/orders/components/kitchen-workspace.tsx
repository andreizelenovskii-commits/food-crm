"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SessionUser } from "@/modules/auth/auth.types";
import { OrderStatusButton } from "@/modules/orders/components/order-status-button";
import { ORDER_SOURCE_LABELS, type KitchenOrderListItem } from "@/modules/orders/orders.types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, getOrderAdvanceAction } from "@/modules/orders/orders.workflow";

function formatClock(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function formatOrderTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function minutesSince(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
}

function getOrderAgeLabel(value: string) {
  const minutes = minutesSince(value);

  if (minutes < 1) {
    return "только что";
  }

  return `${minutes} мин`;
}

export function KitchenWorkspace({
  user,
  orders,
  errorMessage,
}: {
  user: SessionUser;
  orders: KitchenOrderListItem[];
  errorMessage?: string | null;
}) {
  const [now, setNow] = useState(() => new Date());
  const [activeGroup, setActiveGroup] = useState<"new" | "ready">("new");
  const sortedOrders = useMemo(
    () => [...orders].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()),
    [orders],
  );
  const newOrders = sortedOrders.filter((order) => order.status === "SENT_TO_KITCHEN");
  const readyOrders = sortedOrders.filter((order) => order.status === "READY");
  const visibleOrders = activeGroup === "new" ? newOrders : readyOrders;
  const urgentCount = sortedOrders.filter((order) => minutesSince(order.createdAt) >= 20).length;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-red-950/10 bg-white/82 p-4 shadow-sm shadow-red-950/5 sm:p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <KitchenMetric label="На кухне" value={newOrders.length} hint="ждут приготовления" />
          <KitchenMetric label="Готовые" value={readyOrders.length} hint="ждут диспетчера" />
          <KitchenMetric label="Срочные" value={urgentCount} hint="ждут 20+ минут" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveGroup("new")}
            className={[
              "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition",
              activeGroup === "new" ? "bg-red-800 text-white" : "border border-red-100 bg-white text-red-800",
            ].join(" ")}
          >
            Новые на кухне
          </button>
          <button
            type="button"
            onClick={() => setActiveGroup("ready")}
            className={[
              "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition",
              activeGroup === "ready" ? "bg-red-800 text-white" : "border border-red-100 bg-white text-red-800",
            ].join(" ")}
          >
            Готовые
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center rounded-full bg-red-800 px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900"
          >
            Обновить
          </button>
          <span className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white px-4 text-sm font-semibold text-zinc-500">
            {formatClock(now)}
          </span>
          <Link
            href="/dashboard/profile"
            className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white px-4 text-sm font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Мой профиль
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-800">
          <p className="font-semibold">Не удалось загрузить кухонную очередь</p>
          <p className="mt-1 leading-6">{errorMessage}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 inline-flex h-9 items-center rounded-full bg-red-800 px-4 text-sm font-semibold text-white"
          >
            Повторить
          </button>
        </div>
      ) : null}

      {!errorMessage && visibleOrders.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-red-200 bg-white/68 px-4 py-14 text-center">
          <p className="text-lg font-semibold text-zinc-950">
            {activeGroup === "new" ? "Нет заказов на кухне" : "Готовых заказов нет"}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {activeGroup === "new"
              ? "Когда диспетчер отправит заказ, он появится здесь."
              : "Готовые заказы появятся после отметки повара."}
          </p>
        </div>
      ) : null}

      {!errorMessage && visibleOrders.length > 0 ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {visibleOrders.map((order) => (
            <KitchenOrderCard key={order.id} order={order} user={user} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function KitchenMetric({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <article className="rounded-[18px] border border-red-100 bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-700">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{hint}</p>
    </article>
  );
}

function KitchenOrderCard({ order, user }: { order: KitchenOrderListItem; user: SessionUser }) {
  const action = getOrderAdvanceAction(order.status, user.role);
  const ageMinutes = minutesSince(order.createdAt);

  return (
    <article className="overflow-hidden rounded-[22px] border border-red-100 bg-white shadow-[0_14px_42px_rgba(111,18,25,0.08)]">
      <div className="border-b border-red-100 bg-[#fff8f8] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-zinc-950">#{order.id}</h2>
              <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-black ${ORDER_STATUS_STYLES[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <span className="inline-flex h-7 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-black text-red-800">
                {ORDER_SOURCE_LABELS[order.source]}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-600">
              Передан в {formatOrderTime(order.createdAt)} · ждёт {getOrderAgeLabel(order.createdAt)}
            </p>
          </div>
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-black",
              ageMinutes >= 20 ? "bg-red-800 text-white" : "bg-amber-100 text-amber-800",
            ].join(" ")}
          >
            {ageMinutes >= 20 ? "Срочно" : "В очереди"}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {order.customerComment ? (
          <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            Комментарий: {order.customerComment}
          </div>
        ) : null}

        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="rounded-[16px] border border-red-50 bg-red-50/35 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-black text-zinc-950">{item.itemName}</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {item.catalogCategory ?? "Без категории"} · зоны: {item.kitchenZones.length ? item.kitchenZones.join(", ") : item.kitchenZone ?? "не указаны"}
                  </p>
                </div>
                <p className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-red-800">
                  x{item.quantity}
                </p>
              </div>
              {item.excludedIngredients.length ? (
                <p className="mt-2 rounded-[12px] bg-white px-3 py-2 text-xs font-semibold text-red-800">
                  Без: {item.excludedIngredients.map((ingredient) => ingredient.label).join(", ")}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-red-100 pt-3">
          <p className="text-xs font-bold text-zinc-500">
            Диспетчер: <span className="text-zinc-950">{order.employeeName}</span>
          </p>
          {action ? (
            <OrderStatusButton orderId={order.id} status={action.status} label={action.label} />
          ) : (
            <span className="text-xs font-bold text-zinc-500">Действий сейчас нет</span>
          )}
        </div>
      </div>
    </article>
  );
}
