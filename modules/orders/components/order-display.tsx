"use client";

import Link from "next/link";
import type { SessionUser } from "@/modules/auth/auth.types";
import { KITCHEN_ZONE_LABELS, type ProductItem } from "@/modules/inventory/inventory.types";
import { chooseOrderPackagingAction } from "@/modules/orders/orders.actions";
import { OrderStatusButton } from "@/modules/orders/components/order-status-button";
import { ORDER_SOURCE_LABELS, type KitchenZone, type OrderItemSummary, type OrderListItem } from "@/modules/orders/orders.types";
import {
  canCancelOrder,
  canAdvanceOrder,
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

        {order.items.length > 0 ? (
          <OrderKitchenPackaging
            order={order}
            user={user}
            packagingOptions={packagingOptions}
          />
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

function OrderKitchenPackaging({
  order,
  user,
  packagingOptions,
}: {
  order: OrderListItem;
  user: SessionUser;
  packagingOptions: ProductItem[];
}) {
  const canChoosePackaging = order.status === "SENT_TO_KITCHEN" && canAdvanceOrder(order.status, user.role);
  const kitchenItems = order.items.filter((item) => item.kitchenZone);

  if (!kitchenItems.length) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-[16px] border border-red-950/10 bg-red-50/35 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
          Упаковка по зонам
        </p>
        <span className="text-xs font-medium text-zinc-500">Выбор для каждой единицы</span>
      </div>
      <div className="space-y-3">
        {(["pizza", "rolls", "fastfood"] as const).map((zone) => {
          const zoneItems = kitchenItems.filter((item) => item.kitchenZone === zone);

          if (!zoneItems.length) {
            return null;
          }

          return (
            <div key={zone} className="space-y-2">
              <p className="text-xs font-semibold text-zinc-950">{KITCHEN_ZONE_LABELS[zone]}</p>
              {zoneItems.map((item) => (
                <OrderItemPackaging
                  key={item.id}
                  orderId={order.id}
                  item={item}
                  zone={zone}
                  packagingOptions={packagingOptions.filter((option) => option.kitchenZone === zone)}
                  canChoosePackaging={canChoosePackaging}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderItemPackaging({
  orderId,
  item,
  zone,
  packagingOptions,
  canChoosePackaging,
}: {
  orderId: number;
  item: OrderItemSummary;
  zone: KitchenZone;
  packagingOptions: ProductItem[];
  canChoosePackaging: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-white/80 bg-white/78 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-950">{item.itemName}</p>
        <span className="text-xs font-semibold text-zinc-500">{item.quantity} шт</span>
      </div>
      <div className="mt-2 space-y-2">
        {Array.from({ length: item.quantity }, (_, index) => {
          const unitIndex = index + 1;
          const usage = item.packagingUsages.find((current) => current.unitIndex === unitIndex);

          return (
            <div key={unitIndex} className="rounded-[12px] border border-red-950/10 bg-white/80 p-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-700">Единица #{unitIndex}</p>
                {usage ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    {usage.packageProductName}
                  </span>
                ) : null}
              </div>
              {!usage ? (
                <PackagingButtons
                  orderId={orderId}
                  orderItemId={item.id}
                  unitIndex={unitIndex}
                  zone={zone}
                  packagingOptions={packagingOptions}
                  disabled={!canChoosePackaging}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PackagingButtons({
  orderId,
  orderItemId,
  unitIndex,
  zone,
  packagingOptions,
  disabled,
}: {
  orderId: number;
  orderItemId: number;
  unitIndex: number;
  zone: KitchenZone;
  packagingOptions: ProductItem[];
  disabled: boolean;
}) {
  if (!packagingOptions.length) {
    return (
      <p className="mt-2 text-xs text-zinc-500">
        Для зоны {KITCHEN_ZONE_LABELS[zone]} пока нет привязанной упаковки.
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {packagingOptions.map((packaging) => (
        <form key={packaging.id} action={chooseOrderPackagingAction}>
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="orderItemId" value={orderItemId} />
          <input type="hidden" name="unitIndex" value={unitIndex} />
          <input type="hidden" name="packageProductId" value={packaging.id} />
          <button
            type="submit"
            disabled={disabled || packaging.stockQuantity < 1}
            className="rounded-full border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-white"
          >
            {packaging.name} · {packaging.stockQuantity} шт
          </button>
        </form>
      ))}
    </div>
  );
}
