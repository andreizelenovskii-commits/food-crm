"use client";

import Link from "next/link";
import type { SessionUser } from "@/modules/auth/auth.types";
import { OrderStatusButton } from "@/modules/orders/components/order-status-button";
import { ORDER_SOURCE_LABELS, type OrderListItem } from "@/modules/orders/orders.types";
import {
  canCancelOrder,
  getOrderAdvanceAction,
  getOrderStageOwner,
  isOrderClosed,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/modules/orders/orders.workflow";

export function formatOrderMoney(cents: number) {
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

export function OrderSummaryTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <article className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 text-zinc-950 shadow-sm shadow-red-950/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{hint}</p>
    </article>
  );
}

export function OrderCard({
  order,
  user,
  compact = false,
}: {
  order: OrderListItem;
  user: SessionUser;
  compact?: boolean;
}) {
  const isFinished = isOrderClosed(order.status);
  const advanceAction = getOrderAdvanceAction(order.status, user.role);
  const stageOwner = getOrderStageOwner(order.status);
  const canShowCancel = canCancelOrder(order.status, user.role);

  return (
    <article className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5 transition hover:-translate-y-1 hover:border-red-900/10 hover:bg-white hover:shadow-red-950/10">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-zinc-950">Заказ #{order.id}</h3>
              <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold ${ORDER_STATUS_STYLES[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              {order.isInternal ? (
                <span className="inline-flex h-7 items-center rounded-full bg-zinc-950 px-3 text-xs font-semibold text-white">
                  Внутренний
                </span>
              ) : null}
              <span className="inline-flex h-7 items-center rounded-full bg-white px-3 text-xs font-semibold text-red-800 ring-1 ring-red-100">
                {ORDER_SOURCE_LABELS[order.source]}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{formatOrderDate(order.createdAt)}</p>
          </div>
          <p className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-900">
            {formatOrderMoney(order.totalCents)}
          </p>
        </div>

        <div className={`grid gap-2 text-sm text-zinc-600 ${compact ? "" : "sm:grid-cols-2"}`}>
          <p>
            Клиент:{" "}
            {order.clientId ? (
              <Link href={`/dashboard/clients/${order.clientId}`} className="font-semibold text-zinc-950 hover:text-red-800">
                {order.clientName}
              </Link>
            ) : (
              <span className="font-semibold text-zinc-950">{order.clientName}</span>
            )}
          </p>
          <p>Исполнитель: {order.employeeName}</p>
          {order.customerPhoneSnapshot ? <p>Телефон: {order.customerPhoneSnapshot}</p> : null}
          {order.deliveryAddressSnapshot ? <p>Адрес: {order.deliveryAddressSnapshot}</p> : null}
          <p>Тип: {order.clientType === "ORGANIZATION" ? "Организация" : "Клиент"}</p>
          <p>
            Этап:{" "}
            <span className="font-semibold text-zinc-950">
              {stageOwner ?? (order.status === "CANCELLED" ? "Остановлен" : "Закрыт")}
            </span>
          </p>
        </div>

        {order.discountPercent > 0 ? (
          <p className="rounded-[14px] border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
            Скидка {order.discountPercent}% от {formatOrderMoney(order.subtotalCents)}
          </p>
        ) : null}

        {!isFinished ? (
          <div className="rounded-[14px] border border-red-950/10 bg-white/70 px-3 py-2 text-sm leading-6 text-zinc-700">
            {advanceAction ? (
              <span>
                Следующий шаг: <span className="font-semibold text-zinc-950">{advanceAction.label}</span>
              </span>
            ) : (
              <span>
                Ждет роль <span className="font-semibold text-zinc-950">{stageOwner ?? "ответственный сотрудник"}</span>
              </span>
            )}
          </div>
        ) : null}

        {advanceAction || canShowCancel ? (
          <div className="flex flex-wrap gap-2">
            {advanceAction ? <OrderStatusButton orderId={order.id} status={advanceAction.status} label={advanceAction.label} /> : null}
            {canShowCancel ? (
              <OrderStatusButton
                orderId={order.id}
                status="CANCELLED"
                label="Отменить"
                className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
