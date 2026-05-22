"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SessionUser } from "@/modules/auth/auth.types";
import type { ProductItem } from "@/modules/inventory/inventory.types";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import { OrderCreateButton } from "@/modules/orders/components/order-create-button";
import { OrderCard } from "@/modules/orders/components/order-display";
import {
  buildDayKey,
  buildMonthKey,
  type DateMode,
  matchesDateFilter,
} from "@/modules/orders/components/orders-filtering";
import type { OrderCreateOptions } from "@/modules/orders/orders.page-model";
import type { OrderListItem } from "@/modules/orders/orders.types";
import { INITIAL_ORDER_STATUS, isOrderClosed } from "@/modules/orders/orders.workflow";

export function DispatcherWorkspace({
  user,
  canCreate,
  orders,
  packagingOptions,
  orderCreateOptions,
}: {
  user: SessionUser;
  canCreate: boolean;
  orders: OrderListItem[];
  packagingOptions: ProductItem[];
  orderCreateOptions: OrderCreateOptions;
}) {
  const [dateMode, setDateMode] = useState<DateMode>("day");
  const [dateValue, setDateValue] = useState(buildDayKey());
  const visibleOrders = useMemo(
    () => orders.filter((order) => matchesDateFilter(order, dateMode, dateValue)),
    [dateMode, dateValue, orders],
  );
  const websiteOrders = visibleOrders.filter(
    (order) => !order.isInternal && order.status === INITIAL_ORDER_STATUS,
  );
  const activeClientOrders = visibleOrders.filter(
    (order) => !order.isInternal && !isOrderClosed(order.status) && order.status !== INITIAL_ORDER_STATUS,
  );
  const readyOrders = visibleOrders.filter((order) => order.status === "READY" || order.status === "PACKED");

  return (
    <>
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.12)] sm:p-5">
        <div className="relative space-y-4">
          <section className="grid gap-4 xl:grid-cols-[minmax(300px,0.9fr)_minmax(420px,1.1fr)]">
            <DispatcherHero canCreate={canCreate} />
            <DispatcherPeriod
              dateMode={dateMode}
              dateValue={dateValue}
              websiteCount={websiteOrders.length}
              activeCount={activeClientOrders.length}
              readyCount={readyOrders.length}
              onDateModeChange={setDateMode}
              onDateValueChange={setDateValue}
            />
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.1fr)]">
            <DispatcherColumn
              title="Заказы с сайта"
              orders={websiteOrders}
              user={user}
              packagingOptions={packagingOptions}
              emptyText="Новых входящих заказов нет."
            />
            <DispatcherColumn
              title="В работе у диспетчера"
              orders={activeClientOrders}
              user={user}
              packagingOptions={packagingOptions}
              emptyText="Активных клиентских заказов нет."
            />
          </div>
        </div>
      </div>

      {canCreate ? (
        <OrderCreateButton
          user={user}
          clients={orderCreateOptions.clients}
          employees={orderCreateOptions.employees}
          catalogItems={orderCreateOptions.catalogItems}
        />
      ) : null}
    </>
  );
}

function DispatcherHero({ canCreate }: { canCreate: boolean }) {
  return (
    <GlassPanel className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-800/75">FoodLike dispatch</p>
      <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
        Рабочий экран диспетчера
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
        Входящие клиентские заказы, создание заказа и движение по этапам собраны на одном экране.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {canCreate ? (
          <button
            type="button"
            onClick={() => document.querySelector<HTMLButtonElement>("[data-order-create-fab]")?.click()}
            className="inline-flex h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white shadow-sm shadow-red-950/20 transition hover:bg-red-900"
          >
            Создать заказ
          </button>
        ) : null}
        <Link
          href="/dashboard/orders"
          className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white/90 px-4 text-sm font-medium text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
        >
          Все заказы
        </Link>
      </div>
    </GlassPanel>
  );
}

function DispatcherPeriod({
  dateMode,
  dateValue,
  websiteCount,
  activeCount,
  readyCount,
  onDateModeChange,
  onDateValueChange,
}: {
  dateMode: DateMode;
  dateValue: string;
  websiteCount: number;
  activeCount: number;
  readyCount: number;
  onDateModeChange: (mode: DateMode) => void;
  onDateValueChange: (value: string) => void;
}) {
  return (
    <GlassPanel className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Период</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950">Фильтр смены</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type={dateMode}
            value={dateValue}
            onChange={(event) => onDateValueChange(event.target.value)}
            className="h-10 rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-semibold text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
          <button
            type="button"
            onClick={() => {
              const next = dateMode === "day" ? "month" : "day";
              onDateModeChange(next);
              onDateValueChange(next === "day" ? buildDayKey() : buildMonthKey());
            }}
            className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white/80 px-4 text-sm font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            {dateMode === "day" ? "Месяц" : "День"}
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <KpiTile label="С сайта" value={websiteCount} hint="Новые входящие" />
        <KpiTile label="В работе" value={activeCount} hint="Клиентские этапы" />
        <KpiTile label="Готовность" value={readyCount} hint="К выдаче и доставке" />
      </div>
    </GlassPanel>
  );
}

function DispatcherColumn({
  title,
  orders,
  user,
  packagingOptions,
  emptyText,
}: {
  title: string;
  orders: OrderListItem[];
  user: SessionUser;
  packagingOptions: ProductItem[];
  emptyText: string;
}) {
  return (
    <GlassPanel className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">{orders.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-red-950/10 bg-white/58 px-4 py-8 text-sm text-zinc-500">
            {emptyText}
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              user={user}
              packagingOptions={packagingOptions}
              compact
            />
          ))
        )}
      </div>
    </GlassPanel>
  );
}
