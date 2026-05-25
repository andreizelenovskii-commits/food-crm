"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PaginatedList } from "@/components/ui/paginated-list";
import type { SessionUser } from "@/modules/auth/auth.types";
import type { ProductItem } from "@/modules/inventory/inventory.types";
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
  packagingOptions,
  orderCreateOptions,
}: {
  user: SessionUser;
  canCreate: boolean;
  orders: OrderListItem[];
  packagingOptions: ProductItem[];
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
      <section className="space-y-5">
        <div className="rounded-[24px] border border-red-100/80 bg-white p-4 shadow-[0_18px_60px_rgba(111,18,25,0.08)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-700">
                Заказы FoodLike
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-zinc-950 sm:text-4xl">
                Рабочий поток
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
                Сначала статус, клиент, сумма и следующий шаг. Детали заказа раскрываются внутри карточки.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/orders/dispatcher"
                className="inline-flex h-11 items-center justify-center rounded-full bg-red-800 px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(153,27,27,0.22)] transition hover:bg-red-900"
              >
                Экран диспетчера
              </Link>
              {canCreate ? (
                <button
                  type="button"
                  onClick={() =>
                    document.querySelector<HTMLButtonElement>("[data-order-create-fab]")?.click()
                  }
                  className="inline-flex h-11 items-center justify-center rounded-full border border-red-100 bg-red-50 px-5 text-sm font-bold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                >
                  Создать заказ
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
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
              <OrdersMetric label="Всего" value={summary.total} hint="за период" />
              <OrdersMetric label="В работе" value={summary.active} hint="не закрыты" />
              <OrdersMetric label="Закрыто" value={summary.completed} hint="оплачено" />
              <OrdersMetric label="Оборот" value={formatOrderMoney(summary.revenueCents)} hint="по фильтру" />
            </section>
          </div>
        </div>

        <div className="rounded-[24px] border border-red-100/80 bg-white p-4 shadow-[0_18px_60px_rgba(111,18,25,0.08)] sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-700">
                Список
              </p>
              <h2 className="mt-1 text-2xl font-black text-zinc-950">{SCOPE_LABELS[scope]}</h2>
            </div>
            <p className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-800">
              Найдено: {visibleOrders.length}
            </p>
          </div>

          <div className="mt-4">
            {visibleOrders.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-red-200 bg-red-50/40 px-4 py-12 text-center">
                <p className="text-base font-black text-zinc-950">Заказов по этим фильтрам нет</p>
                <p className="mt-2 text-sm font-medium text-zinc-500">
                  Смените дату или поток, и список сразу обновится.
                </p>
              </div>
            ) : (
              <PaginatedList className="space-y-3" itemLabel="заказов" pageSize={8}>
                {visibleOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    user={user}
                    packagingOptions={packagingOptions}
                  />
                ))}
              </PaginatedList>
            )}
          </div>
        </div>
      </section>

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

function OrdersMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <article className="rounded-[20px] border border-red-100 bg-[linear-gradient(135deg,#fff_0%,#fff7f7_100%)] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700">{label}</p>
      <p className="mt-2 text-2xl font-black leading-none text-zinc-950">{value}</p>
      <p className="mt-2 text-xs font-semibold text-zinc-500">{hint}</p>
    </article>
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
    <div className="rounded-[20px] border border-red-100 bg-red-50/35 p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700">
            Поток
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
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

        <div className="flex flex-wrap gap-2">
          <DateModeButton
            isActive={dateMode === "day"}
            label="День"
            onClick={() => {
              onDateModeChange("day");
              onDateValueChange(buildDayKey());
            }}
          />
          <DateModeButton
            isActive={dateMode === "month"}
            label="Месяц"
            onClick={() => {
              onDateModeChange("month");
              onDateValueChange(buildMonthKey());
            }}
          />
          <input
            type={dateMode}
            value={dateValue}
            onChange={(event) => onDateValueChange(event.target.value)}
            className="h-11 min-w-[10.5rem] rounded-full border border-red-100 bg-white px-4 text-sm font-bold text-zinc-950 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-800/10"
          />
        </div>
      </div>
    </div>
  );
}

function DateModeButton({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-full px-4 text-sm font-bold transition ${
        isActive
          ? "bg-zinc-950 text-white"
          : "border border-red-100 bg-white text-red-800 hover:border-red-800"
      }`}
    >
      {label}
    </button>
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
      className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-bold transition ${
        isActive
          ? "bg-red-800 text-white shadow-[0_10px_22px_rgba(153,27,27,0.2)]"
          : "border border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-white"
      }`}
    >
      {SCOPE_LABELS[scope]} · {count}
    </button>
  );
}
