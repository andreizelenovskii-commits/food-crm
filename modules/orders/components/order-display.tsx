"use client";

import Link from "next/link";
import type { SessionUser } from "@/modules/auth/auth.types";
import type { ProductItem } from "@/modules/inventory/inventory.types";
import { OrderKitchenPackaging } from "@/modules/orders/components/order-kitchen-packaging";
import { OrderStatusButton } from "@/modules/orders/components/order-status-button";
import { ORDER_SOURCE_LABELS, type OrderItemSummary, type OrderListItem } from "@/modules/orders/orders.types";
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

function getItemsCount(items: OrderItemSummary[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
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
    <article className="rounded-[18px] border border-red-100 bg-white p-4 text-zinc-950 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700">{label}</p>
      <p className="mt-2 text-2xl font-black leading-none text-zinc-950">{value}</p>
      <p className="mt-2 text-xs font-semibold leading-5 text-zinc-500">{hint}</p>
    </article>
  );
}

export function OrderCard({
  order,
  user,
  packagingOptions = [],
  compact = false,
}: {
  order: OrderListItem;
  user: SessionUser;
  packagingOptions?: ProductItem[];
  compact?: boolean;
}) {
  const isFinished = isOrderClosed(order.status);
  const advanceAction = getOrderAdvanceAction(order.status, user.role);
  const stageOwner = getOrderStageOwner(order.status);
  const canShowCancel = canCancelOrder(order.status, user.role);
  const itemsCount = getItemsCount(order.items);

  return (
    <article className="overflow-hidden rounded-[20px] border border-red-100 bg-white shadow-[0_12px_38px_rgba(111,18,25,0.07)] transition hover:border-red-200 hover:shadow-[0_18px_48px_rgba(111,18,25,0.1)]">
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-zinc-950">#{order.id}</h3>
            <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-black ${ORDER_STATUS_STYLES[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="inline-flex h-7 items-center rounded-full border border-red-100 bg-red-50 px-3 text-xs font-black text-red-800">
              {ORDER_SOURCE_LABELS[order.source]}
            </span>
            {order.isInternal ? (
              <span className="inline-flex h-7 items-center rounded-full bg-zinc-950 px-3 text-xs font-black text-white">
                Внутренний
              </span>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <OrderFact label="Клиент" value={<OrderClientLink order={order} />} />
            <OrderFact label="Время" value={formatOrderDate(order.createdAt)} />
            <OrderFact label="Состав" value={`${itemsCount} поз. / ${order.items.length} строк`} />
            <OrderFact
              label="Этап"
              value={stageOwner ?? (order.status === "CANCELLED" ? "Остановлен" : "Закрыт")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:items-end">
          <p className="text-2xl font-black text-red-800">{formatOrderMoney(order.totalCents)}</p>
          {!isFinished ? (
            <p className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-800">
              {advanceAction ? `Дальше: ${advanceAction.label}` : `Ждет: ${stageOwner ?? "ответственный"}`}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-red-100 bg-[#fff8f8] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <OrderActions
            advanceAction={advanceAction}
            canShowCancel={canShowCancel}
            orderId={order.id}
          />
          <p className="text-xs font-bold text-zinc-500">
            Исполнитель: <span className="text-zinc-950">{order.employeeName}</span>
          </p>
        </div>

        {!compact ? (
          <div className="mt-3 grid gap-2">
            <OrderDetailsPanel title="Клиент и доставка">
              <OrderDetailLine label="Телефон" value={order.customerPhoneSnapshot ?? "Не указан"} />
              <OrderDetailLine label="Адрес" value={order.deliveryAddressSnapshot ?? "Самовывоз или без адреса"} />
              <OrderDetailLine label="Тип" value={order.clientType === "ORGANIZATION" ? "Организация" : "Клиент"} />
              {order.customerComment ? <OrderDetailLine label="Комментарий" value={order.customerComment} /> : null}
            </OrderDetailsPanel>

            <OrderDetailsPanel title="Состав заказа">
              {order.items.length ? (
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <OrderItemRow key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-zinc-500">Позиции не добавлены.</p>
              )}
            </OrderDetailsPanel>

            <OrderDetailsPanel title="Упаковка и кухня">
              {order.discountPercent > 0 ? (
                <p className="mb-3 rounded-[14px] border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-800">
                  Скидка {order.discountPercent}% от {formatOrderMoney(order.subtotalCents)}
                </p>
              ) : null}
              {order.items.length > 0 ? (
                <OrderKitchenPackaging
                  order={order}
                  user={user}
                  packagingOptions={packagingOptions}
                />
              ) : (
                <p className="text-sm font-semibold text-zinc-500">Нет кухонных позиций.</p>
              )}
            </OrderDetailsPanel>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function OrderFact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[16px] border border-red-50 bg-red-50/45 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-700">{label}</p>
      <div className="mt-1 truncate text-sm font-black text-zinc-950">{value}</div>
    </div>
  );
}

function OrderClientLink({ order }: { order: OrderListItem }) {
  if (!order.clientId) {
    return <span>{order.clientName}</span>;
  }

  return (
    <Link href={`/dashboard/clients/${order.clientId}`} className="hover:text-red-800">
      {order.clientName}
    </Link>
  );
}

function OrderActions({
  advanceAction,
  canShowCancel,
  orderId,
}: {
  advanceAction: ReturnType<typeof getOrderAdvanceAction>;
  canShowCancel: boolean;
  orderId: number;
}) {
  if (!advanceAction && !canShowCancel) {
    return <span className="text-xs font-bold text-zinc-500">Действий сейчас нет</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {advanceAction ? (
        <OrderStatusButton orderId={orderId} status={advanceAction.status} label={advanceAction.label} />
      ) : null}
      {canShowCancel ? (
        <OrderStatusButton
          orderId={orderId}
          status="CANCELLED"
          label="Отменить"
          className="inline-flex h-10 items-center rounded-full border border-red-200 bg-white px-4 text-sm font-bold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        />
      ) : null}
    </div>
  );
}

function OrderDetailsPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-[18px] border border-red-100 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-black text-zinc-950 marker:hidden">
        {title}
        <span className="flex size-8 items-center justify-center rounded-full bg-red-50 text-lg leading-none text-red-800 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="border-t border-red-50 px-4 py-3">{children}</div>
    </details>
  );
}

function OrderDetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2 first:pt-0 last:pb-0">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-700">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-zinc-700">{value}</p>
    </div>
  );
}

function OrderItemRow({ item }: { item: OrderItemSummary }) {
  return (
    <div className="rounded-[14px] border border-red-50 bg-red-50/35 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-zinc-950">{item.itemName}</p>
          {item.excludedIngredients.length ? (
            <p className="mt-1 text-xs font-semibold text-red-800">
              Без: {item.excludedIngredients.map((ingredient) => ingredient.label).join(", ")}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-black text-zinc-950">{item.quantity} шт</p>
          <p className="mt-1 text-xs font-bold text-red-800">{formatOrderMoney(item.totalPriceCents)}</p>
        </div>
      </div>
    </div>
  );
}
