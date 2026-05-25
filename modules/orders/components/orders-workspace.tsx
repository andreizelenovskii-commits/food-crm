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
  matchesDateFilter,
  type DateMode,
  sortOrdersNewestFirst,
  summarizeOrders,
} from "@/modules/orders/components/orders-filtering";
import type { OrderCreateOptions } from "@/modules/orders/orders.page-model";
import type { OrderListItem } from "@/modules/orders/orders.types";

type OrdersModuleKey = "new" | "work" | "done";

const ORDER_MODULES: Array<{
  key: OrdersModuleKey;
  title: string;
  eyebrow: string;
  description: string;
  emptyText: string;
}> = [
  {
    key: "new",
    title: "Новые",
    eyebrow: "Поступили",
    description: "Заказы, которые уже переданы на кухню и ждут первого рабочего действия.",
    emptyText: "Новых заказов сейчас нет.",
  },
  {
    key: "work",
    title: "В работе",
    eyebrow: "Процесс",
    description: "Готовые и собранные заказы, которые нужно довести до следующего этапа.",
    emptyText: "В работе сейчас пусто.",
  },
  {
    key: "done",
    title: "Завершенные",
    eyebrow: "Архив",
    description: "Доставленные, оплаченные и отмененные заказы выбранного периода.",
    emptyText: "Завершенных заказов по фильтру нет.",
  },
];

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
  const [dateMode, setDateMode] = useState<DateMode>("day");
  const [dateValue, setDateValue] = useState(buildDayKey());

  const periodOrders = useMemo(
    () => sortOrdersNewestFirst(orders.filter((order) => matchesDateFilter(order, dateMode, dateValue))),
    [dateMode, dateValue, orders],
  );
  const modules = useMemo(
    () =>
      ORDER_MODULES.map((module) => {
        const moduleOrders = periodOrders.filter((order) => getOrderModuleKey(order) === module.key);
        return {
          ...module,
          orders: moduleOrders,
          summary: summarizeOrders(moduleOrders),
        };
      }),
    [periodOrders],
  );
  const periodSummary = useMemo(() => summarizeOrders(periodOrders), [periodOrders]);

  return (
    <>
      <section className="space-y-5">
        <div className="rounded-[26px] border border-red-100/80 bg-white p-4 shadow-[0_18px_60px_rgba(111,18,25,0.08)] sm:p-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-700">
                Заказы FoodLike
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-zinc-950 sm:text-4xl">
                Три рабочих модуля
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-zinc-500">
                Новые, в работе и завершенные заказы разделены сразу. В карточке видно главное, детали открываются внутри.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <Link
                href="/dashboard/orders/dispatcher"
                className="inline-flex h-11 items-center justify-center rounded-full bg-red-800 px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(153,27,27,0.22)] transition hover:bg-red-900"
              >
                Экран диспетчера
              </Link>
              {canCreate ? (
                <button
                  type="button"
                  onClick={() => document.querySelector<HTMLButtonElement>("[data-order-create-fab]")?.click()}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-red-100 bg-red-50 px-5 text-sm font-bold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                >
                  Создать заказ
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.58fr)]">
            <OrdersPeriodControl
              dateMode={dateMode}
              dateValue={dateValue}
              onDateModeChange={setDateMode}
              onDateValueChange={setDateValue}
            />
            <section className="grid gap-3 sm:grid-cols-2">
              <OrdersMetric label="Всего" value={periodSummary.total} hint="за период" />
              <OrdersMetric label="Оборот" value={formatOrderMoney(periodSummary.revenueCents)} hint="по всем модулям" />
            </section>
          </div>
        </div>

        <div className="grid gap-4 2xl:grid-cols-3">
          {modules.map((module) => (
            <OrdersModule
              key={module.key}
              module={module}
              packagingOptions={packagingOptions}
              user={user}
            />
          ))}
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

function getOrderModuleKey(order: OrderListItem): OrdersModuleKey {
  if (order.status === "SENT_TO_KITCHEN") {
    return "new";
  }

  if (order.status === "READY" || order.status === "PACKED") {
    return "work";
  }

  return "done";
}

function OrdersModule({
  module,
  user,
  packagingOptions,
}: {
  module: (typeof ORDER_MODULES)[number] & {
    orders: OrderListItem[];
    summary: ReturnType<typeof summarizeOrders>;
  };
  user: SessionUser;
  packagingOptions: ProductItem[];
}) {
  return (
    <section className="min-w-0 rounded-[26px] border border-red-100/80 bg-white p-4 shadow-[0_18px_60px_rgba(111,18,25,0.08)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-700">
            {module.eyebrow}
          </p>
          <h3 className="mt-1 text-2xl font-black text-zinc-950">{module.title}</h3>
          <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-zinc-500">{module.description}</p>
        </div>
        <div className="rounded-[18px] bg-red-50 px-4 py-3 text-right">
          <p className="text-2xl font-black leading-none text-red-800">{module.orders.length}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-red-700">заказов</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <OrdersMetric label="Активные" value={module.summary.active} hint="внутри модуля" compact />
        <OrdersMetric label="Сумма" value={formatOrderMoney(module.summary.revenueCents)} hint="по модулю" compact />
      </div>

      <div className="mt-4">
        {module.orders.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-red-200 bg-red-50/40 px-4 py-10 text-center">
            <p className="text-sm font-black text-zinc-950">{module.emptyText}</p>
          </div>
        ) : (
          <PaginatedList className="space-y-3" itemLabel="заказов" pageSize={5}>
            {module.orders.map((order) => (
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
    </section>
  );
}

function OrdersMetric({
  label,
  value,
  hint,
  compact = false,
}: {
  label: string;
  value: string | number;
  hint: string;
  compact?: boolean;
}) {
  return (
    <article className={`rounded-[20px] border border-red-100 bg-[linear-gradient(135deg,#fff_0%,#fff7f7_100%)] ${compact ? "p-3" : "p-4"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700">{label}</p>
      <p className={`${compact ? "mt-1 text-xl" : "mt-2 text-2xl"} font-black leading-none text-zinc-950`}>{value}</p>
      <p className="mt-2 text-xs font-semibold text-zinc-500">{hint}</p>
    </article>
  );
}

function OrdersPeriodControl({
  dateMode,
  dateValue,
  onDateModeChange,
  onDateValueChange,
}: {
  dateMode: DateMode;
  dateValue: string;
  onDateModeChange: (mode: DateMode) => void;
  onDateValueChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-red-100 bg-red-50/35 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700">
            Период
          </p>
          <p className="mt-1 text-lg font-black text-zinc-950">Единый фильтр для трех модулей</p>
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

function DateModeButton({ isActive, label, onClick }: {
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
