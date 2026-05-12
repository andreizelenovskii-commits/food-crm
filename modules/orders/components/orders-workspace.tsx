"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PaginatedList } from "@/components/ui/paginated-list";
import type { SessionUser } from "@/modules/auth/auth.types";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import { OrderCreateButton } from "@/modules/orders/components/order-create-button";
import { OrderCard, formatOrderMoney } from "@/modules/orders/components/order-display";
import {
  buildDayKey,
  buildMonthKey,
  filterByScope,
  matchesDateFilter,
  type DateMode,
  type OrderScope,
  SCOPE_LABELS,
  sortOrdersNewestFirst,
  summarizeOrders,
} from "@/modules/orders/components/orders-filtering";
import type { OrderCreateOptions } from "@/modules/orders/orders.page-model";
import type { OrderListItem } from "@/modules/orders/orders.types";

export function OrdersWorkspace({
  user,
  canCreate,
  orders,
  orderCreateOptions,
}: {
  user: SessionUser;
  canCreate: boolean;
  orders: OrderListItem[];
  orderCreateOptions: OrderCreateOptions;
}) {
  const [scope, setScope] = useState<OrderScope>("all");
  const [dateMode, setDateMode] = useState<DateMode>("day");
  const [dateValue, setDateValue] = useState(buildDayKey());

  const counts = useMemo(
    () => ({
      all: orders.length,
      closed: filterByScope(orders, "closed").length,
      internal: filterByScope(orders, "internal").length,
    }),
    [orders],
  );

  const visibleOrders = useMemo(() => {
    const filtered = filterByScope(orders, scope).filter((order) =>
      matchesDateFilter(order, dateMode, dateValue),
    );

    return sortOrdersNewestFirst(filtered);
  }, [dateMode, dateValue, orders, scope]);

  const summary = useMemo(() => summarizeOrders(visibleOrders), [visibleOrders]);

  return (
    <>
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.12)] sm:p-5">
          <GlassPanel className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-800/75">
                FoodLike orders
              </p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
                Управление заказами
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                Общий список, закрытые продажи, внутренние заказы и диспетчерский экран в одном рабочем модуле.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/orders/dispatcher"
                className="inline-flex h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white shadow-sm shadow-red-950/20 transition hover:bg-red-900"
              >
                Экран диспетчера
              </Link>
              {canCreate ? (
                <button
                  type="button"
                  onClick={() =>
                    document.querySelector<HTMLButtonElement>("[data-order-create-fab]")?.click()
                  }
                  className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white/90 px-4 text-sm font-medium text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                >
                  Создать заказ
                </button>
              ) : null}
            </div>
          </div>
          </GlassPanel>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(320px,0.92fr)_minmax(420px,1.08fr)]">
            <OrdersFilters
              scope={scope}
              counts={counts}
              dateMode={dateMode}
              dateValue={dateValue}
              onScopeChange={setScope}
              onDateModeChange={setDateMode}
              onDateValueChange={setDateValue}
            />

            <section className="grid gap-3 sm:grid-cols-2">
              <KpiTile label="Всего" value={summary.total} hint="В выбранном периоде" />
              <KpiTile label="Активные" value={summary.active} hint="Еще в работе" />
              <KpiTile label="Закрытые" value={summary.completed} hint="Доставлены и оплачены" />
              <KpiTile
                label="Оборот"
                value={formatOrderMoney(summary.revenueCents)}
                hint="По текущему фильтру"
              />
            </section>
          </div>

        <GlassPanel className="mt-4 p-4 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                Список
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">{SCOPE_LABELS[scope]}</h2>
            </div>
            <p className="text-sm text-zinc-500">Найдено: {visibleOrders.length}</p>
          </div>

          <div className="mt-4">
            {visibleOrders.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-red-950/10 bg-white/58 px-4 py-10 text-center text-sm text-zinc-500">
                Заказов по выбранным фильтрам пока нет.
              </div>
            ) : (
              <PaginatedList className="space-y-3" itemLabel="заказов" pageSize={8}>
                {visibleOrders.map((order) => (
                  <OrderCard key={order.id} order={order} user={user} />
                ))}
              </PaginatedList>
            )}
          </div>
        </GlassPanel>
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

function OrdersFilters({
  scope,
  counts,
  dateMode,
  dateValue,
  onScopeChange,
  onDateModeChange,
  onDateValueChange,
}: {
  scope: OrderScope;
  counts: Record<OrderScope, number>;
  dateMode: DateMode;
  dateValue: string;
  onScopeChange: (scope: OrderScope) => void;
  onDateModeChange: (mode: DateMode) => void;
  onDateValueChange: (value: string) => void;
}) {
  return (
    <GlassPanel className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Фильтры
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">Поток заказов</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "closed", "internal"] as const).map((item) => (
            <ScopeButton
              key={item}
              scope={item}
              activeScope={scope}
              count={counts[item]}
              onClick={onScopeChange}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              onDateModeChange("day");
              onDateValueChange(buildDayKey());
            }}
            className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition ${
              dateMode === "day"
                ? "bg-zinc-950 text-white"
                : "border border-red-100 bg-white/80 text-red-800 hover:border-red-800"
            }`}
          >
            По дням
          </button>
          <button
            type="button"
            onClick={() => {
              onDateModeChange("month");
              onDateValueChange(buildMonthKey());
            }}
            className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition ${
              dateMode === "month"
                ? "bg-zinc-950 text-white"
                : "border border-red-100 bg-white/80 text-red-800 hover:border-red-800"
            }`}
          >
            По месяцам
          </button>
        </div>
        <input
          type={dateMode}
          value={dateValue}
          onChange={(event) => onDateValueChange(event.target.value)}
          className="h-10 rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-semibold text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
        />
      </div>
    </GlassPanel>
  );
}

function ScopeButton({
  scope,
  activeScope,
  count,
  onClick,
}: {
  scope: OrderScope;
  activeScope: OrderScope;
  count: number;
  onClick: (scope: OrderScope) => void;
}) {
  const isActive = scope === activeScope;

  return (
    <button
      type="button"
      onClick={() => onClick(scope)}
      className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition ${
        isActive
          ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
          : "border border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
      }`}
    >
      {SCOPE_LABELS[scope]} · {count}
    </button>
  );
}
