/* eslint-disable max-lines */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useEmployeeSession } from "@/modules/auth/components/employee-session-provider";
import type { SessionUser } from "@/modules/auth/auth.types";
import type { ProductItem } from "@/modules/inventory/inventory.types";
import { OrderCard, formatOrderMoney } from "@/modules/orders/components/order-display";
import { OrdersPeriodPicker } from "@/modules/orders/components/orders-period-picker";
import { sortOrdersNewestFirst } from "@/modules/orders/components/orders-filtering";
import type { OrderListItem, OrderStatus } from "@/modules/orders/orders.types";
import {
  buildSalesHref,
  buildSalesPeriodRange,
  isDateInRange,
  SALES_PERIOD_LABELS,
  SALES_PERIODS,
  type SalesPeriod,
} from "@/modules/sales/sales.periods";

type OrdersColumnKey = "new" | "work" | "done";

const ORDER_COLUMNS: Array<{
  key: OrdersColumnKey;
  title: string;
  eyebrow: string;
  description: string;
  statuses: OrderStatus[];
  emptyText: string;
}> = [
  {
    key: "new",
    title: "Новые заказы",
    eyebrow: "Поступили",
    description: "Заказы, которые только пришли и ждут первого действия.",
    statuses: ["SENT_TO_KITCHEN"],
    emptyText: "Новых заказов за период нет.",
  },
  {
    key: "work",
    title: "В работе",
    eyebrow: "Готовим",
    description: "Заказы на кухне, сборке или передаче дальше.",
    statuses: ["READY", "PACKED"],
    emptyText: "В работе за период пусто.",
  },
  {
    key: "done",
    title: "Выполненные",
    eyebrow: "Закрыты",
    description: "Оплаченные, доставленные и отмененные заказы.",
    statuses: ["DELIVERED_PAID", "CANCELLED"],
    emptyText: "Выполненных заказов за период нет.",
  },
];

function buildOrdersHref(period: SalesPeriod, date: string) {
  return buildSalesHref(period, date).replace("/dashboard/sales", "/dashboard/orders");
}

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((sum, item) => sum + getValue(item), 0);
}

function formatOrdersCount(count: number) {
  if (count === 1) {
    return "1 новый";
  }

  return `${count} новых`;
}

function buildPeriodOptions(period: SalesPeriod, date: string) {
  return SALES_PERIODS.map((item) => ({
    label: SALES_PERIOD_LABELS[item],
    href: buildOrdersHref(item, date),
    isActive: item === period,
  }));
}

function buildDateParts(date: Date) {
  const currentYear = new Date().getFullYear();
  const selectedYear = date.getFullYear();
  const startYear = Math.min(currentYear - 5, selectedYear - 2);
  const endYear = Math.max(currentYear + 2, selectedYear + 2);

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(selectedYear),
    days: Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0")),
    months: Array.from({ length: 12 }, (_, index) => {
      const value = String(index + 1).padStart(2, "0");
      const label = new Date(2026, index, 1).toLocaleDateString("ru-RU", { month: "long" });
      return { value, label };
    }),
    years: Array.from({ length: endYear - startYear + 1 }, (_, index) => String(startYear + index)),
  };
}

function getColumnKey(order: OrderListItem): OrdersColumnKey {
  if (order.status === "SENT_TO_KITCHEN") {
    return "new";
  }
  if (order.status === "READY" || order.status === "PACKED") {
    return "work";
  }
  return "done";
}

export function OrdersWorkspace({
  period,
  date,
  orders,
  packagingOptions,
}: {
  period?: string | null;
  date?: string | null;
  orders: OrderListItem[];
  packagingOptions: ProductItem[];
}) {
  const { user } = useEmployeeSession();
  const range = buildSalesPeriodRange(period, date);
  const selectedDate = new Date(range.selectedDate);
  const periodOrders = sortOrdersNewestFirst(orders.filter((order) => isDateInRange(order.createdAt, range)));
  const activeOrders = periodOrders.filter((order) => ["SENT_TO_KITCHEN", "READY", "PACKED"].includes(order.status));
  const paidOrders = periodOrders.filter((order) => order.status === "DELIVERED_PAID");
  const cancelledOrders = periodOrders.filter((order) => order.status === "CANCELLED");
  const realRevenueCents = sumBy(paidOrders, (order) => order.totalCents);
  const expectedRevenueCents = realRevenueCents + sumBy(activeOrders, (order) => order.totalCents);
  const averageCheckCents = paidOrders.length ? Math.round(realRevenueCents / paidOrders.length) : 0;
  const columns = ORDER_COLUMNS.map((column) => ({
    ...column,
    orders: periodOrders.filter((order) => getColumnKey(order) === column.key),
  }));
  const [activeColumnKey, setActiveColumnKey] = useState<OrdersColumnKey | null>(null);
  const activeColumn = columns.find((column) => column.key === activeColumnKey) ?? null;

  return (
    <section className="foodlike-frame space-y-4 p-4 sm:p-5">
      <div className="relative z-40 overflow-visible rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.55fr)_1fr] xl:items-end">
          <div>
            <p className="foodlike-kicker">Период заказов</p>
            <h2 className="mt-1 foodlike-title-sm">{range.label}</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Минималистичная доска: новые, в работе и выполненные заказы.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-nowrap lg:items-center xl:justify-end">
            <div className="flex flex-wrap gap-2 lg:flex-nowrap">
              {buildPeriodOptions(range.period, range.selectedDate).map((option) => (
                <Link
                  key={option.label}
                  href={option.href}
                  className={[
                    "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition",
                    option.isActive
                      ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                      : "border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-50",
                  ].join(" ")}
                >
                  {option.label}
                </Link>
              ))}
            </div>
            <OrdersPeriodPicker period={range.period} dateParts={buildDateParts(selectedDate)} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={buildOrdersHref(range.period, range.previousDate)} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/80 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Предыдущий период
          </Link>
          <Link href={buildOrdersHref(range.period, range.nextDate)} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/80 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Следующий период
          </Link>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <OrdersMetric label="Ориентир выручки" value={formatOrderMoney(expectedRevenueCents)} hint="оплаченные + активные заказы" />
        <OrdersMetric label="Реальная выручка" value={formatOrderMoney(realRevenueCents)} hint={`${paidOrders.length} оплаченных заказов`} />
        <OrdersMetric label="Средний чек" value={formatOrderMoney(averageCheckCents)} hint="по фактически оплаченным" />
        <OrdersMetric label="Отмены" value={cancelledOrders.length} hint={`${periodOrders.length} заказов всего`} />
      </section>

      <section className="grid items-stretch gap-4 xl:grid-cols-3">
        {columns.map((column) => (
          <OrdersColumn
            key={column.key}
            column={column}
            onOpen={() => setActiveColumnKey(column.key)}
          />
        ))}
      </section>
      {activeColumn && user ? (
        <OrdersColumnDialog
          column={activeColumn}
          user={user}
          packagingOptions={packagingOptions}
          onClose={() => setActiveColumnKey(null)}
        />
      ) : null}
    </section>
  );
}

function OrdersMetric({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <article className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 text-zinc-950 shadow-sm shadow-red-950/5">
      <p className="foodlike-kicker">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{hint}</p>
    </article>
  );
}

function OrdersColumn({
  column,
  onOpen,
}: {
  column: (typeof ORDER_COLUMNS)[number] & { orders: OrderListItem[] };
  onOpen: () => void;
}) {
  const columnRevenueCents = sumBy(column.orders, (order) => order.totalCents);
  const hasNewOrders = column.key === "new" && column.orders.length > 0;

  return (
    <section
      className={[
        "flex min-w-0 flex-col rounded-[20px] border bg-white/80 p-4 shadow-sm backdrop-blur-2xl",
        hasNewOrders
          ? "border-red-300 shadow-red-950/10 ring-2 ring-red-100"
          : "border-red-950/10 shadow-red-950/5",
      ].join(" ")}
    >
      <div className="grid min-h-24 grid-cols-[1fr_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="foodlike-kicker">{column.eyebrow}</p>
          <h3 className="mt-1 text-xl font-semibold leading-tight text-zinc-950">{column.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{column.description}</p>
        </div>
        <div
          className={[
            "flex size-16 shrink-0 flex-col items-center justify-center rounded-[18px] text-red-800",
            hasNewOrders ? "animate-pulse bg-red-100 ring-4 ring-red-100/70" : "bg-red-50",
          ].join(" ")}
        >
          <p className="text-2xl font-semibold leading-none">{column.orders.length}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]">шт</p>
        </div>
      </div>
      <div
        className={[
          "mt-4 rounded-[18px] border p-4",
          hasNewOrders
            ? "border-red-200 bg-[linear-gradient(135deg,#fff1f1,#fff)]"
            : "border-red-100 bg-[linear-gradient(180deg,#fff,rgba(255,247,247,0.82))]",
        ].join(" ")}
      >
        {hasNewOrders ? (
          <div className="mb-4 rounded-[16px] bg-red-800 px-4 py-5 text-white shadow-lg shadow-red-950/15">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">Требуют внимания</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-4xl font-semibold leading-none">{formatOrdersCount(column.orders.length)}</p>
              <span className="mb-1 inline-flex h-3 w-3 rounded-full bg-white shadow-[0_0_0_8px_rgba(255,255,255,0.18)]" />
            </div>
          </div>
        ) : null}
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Сумма колонки</p>
            <p className="mt-1 text-xl font-semibold leading-none text-zinc-950">{formatOrderMoney(columnRevenueCents)}</p>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-red-800 px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/10 transition hover:bg-red-900"
          >
            Открыть
          </button>
        </div>
        {!column.orders.length ? (
          <p className="mt-3 border-t border-red-950/10 pt-3 text-xs font-medium leading-5 text-zinc-500">
            {column.emptyText}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function OrdersColumnDialog({
  column,
  user,
  packagingOptions,
  onClose,
}: {
  column: (typeof ORDER_COLUMNS)[number] & { orders: OrderListItem[] };
  user: SessionUser;
  packagingOptions: ProductItem[];
  onClose: () => void;
}) {
  const columnRevenueCents = sumBy(column.orders, (order) => order.totalCents);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-red-950/35 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Закрыть заказы" onClick={onClose} />
      <section className="relative flex h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[1500px] flex-col overflow-hidden rounded-[28px] border border-red-950/10 bg-[linear-gradient(180deg,#fff,rgba(255,248,248,0.98))] shadow-[0_30px_90px_rgba(69,10,10,0.32)] sm:h-[calc(100dvh-40px)] sm:w-[calc(100vw-40px)]">
        <div className="shrink-0 border-b border-red-950/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="foodlike-kicker">{column.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{column.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">{column.description}</p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white/85 px-4 text-sm font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Закрыть
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5 sm:p-6">
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <OrdersMetric label="Заказов" value={column.orders.length} hint="в выбранной колонке" />
              <OrdersMetric label="Сумма" value={formatOrderMoney(columnRevenueCents)} hint="по всем заказам колонки" />
              <OrdersMetric label="Средний чек" value={formatOrderMoney(column.orders.length ? columnRevenueCents / column.orders.length : 0)} hint="среднее по колонке" />
            </div>
            {column.orders.length ? (
              <div className="grid gap-3 xl:grid-cols-2">
                {column.orders.map((order) => (
                  <OrderCard key={order.id} order={order} user={user} packagingOptions={packagingOptions} />
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-red-200 bg-red-50/40 px-4 py-14 text-center">
                <p className="text-sm font-semibold text-zinc-950">{column.emptyText}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
