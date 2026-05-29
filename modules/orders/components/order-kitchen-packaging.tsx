"use client";

import type { SessionUser } from "@/modules/auth/auth.types";
import { KITCHEN_ZONE_LABELS, KITCHEN_ZONES, type ProductItem } from "@/modules/inventory/inventory.types";
import { chooseOrderPackagingAction } from "@/modules/orders/orders.actions";
import type { KitchenZone, OrderItemSummary, OrderListItem } from "@/modules/orders/orders.types";
import { canAdvanceOrder } from "@/modules/orders/orders.workflow";

export function OrderKitchenPackaging({
  order,
  user,
  packagingOptions,
}: {
  order: OrderListItem;
  user: SessionUser;
  packagingOptions: ProductItem[];
}) {
  const canChoosePackaging = order.status === "SENT_TO_KITCHEN" && canAdvanceOrder(order.status, user.role);
  const kitchenItems = order.items.filter((item) => getItemKitchenZones(item).length);

  if (!kitchenItems.length) return null;

  return (
    <div className="space-y-3 rounded-[16px] border border-red-950/10 bg-red-50/35 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
          Упаковка по зонам
        </p>
        <span className="text-xs font-medium text-zinc-500">Выбор для каждой единицы</span>
      </div>
      <div className="space-y-3">
        {KITCHEN_ZONES.map((zone) => {
          const zoneItems = kitchenItems.filter((item) => getItemKitchenZones(item).includes(zone));
          if (!zoneItems.length) return null;

          return (
            <div key={zone} className="space-y-2">
              <p className="text-xs font-semibold text-zinc-950">{KITCHEN_ZONE_LABELS[zone]}</p>
              {zoneItems.map((item) => (
                <OrderItemPackaging
                  key={item.id}
                  canChoosePackaging={canChoosePackaging}
                  item={item}
                  orderId={order.id}
                  packagingOptions={packagingOptions.filter((option) => option.kitchenZone === zone)}
                  zone={zone}
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
      <OrderItemExclusions item={item} />
      <div className="mt-2 space-y-2">
        {Array.from({ length: item.quantity }, (_, index) => (
          <OrderItemPackagingUnit
            key={index}
            canChoosePackaging={canChoosePackaging}
            item={item}
            orderId={orderId}
            packagingOptions={packagingOptions}
            unitIndex={index + 1}
            zone={zone}
          />
        ))}
      </div>
    </div>
  );
}

function OrderItemExclusions({ item }: { item: OrderItemSummary }) {
  if (!item.excludedIngredients.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {item.excludedIngredients.map((ingredient) => (
        <span key={ingredient.id} className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-800">
          Без {ingredient.label}
        </span>
      ))}
    </div>
  );
}

function OrderItemPackagingUnit({
  orderId,
  item,
  unitIndex,
  zone,
  packagingOptions,
  canChoosePackaging,
}: {
  orderId: number;
  item: OrderItemSummary;
  unitIndex: number;
  zone: KitchenZone;
  packagingOptions: ProductItem[];
  canChoosePackaging: boolean;
}) {
  const usage = item.packagingUsages.find(
    (current) => current.unitIndex === unitIndex && current.kitchenZone === zone,
  );

  return (
    <div className="rounded-[12px] border border-red-950/10 bg-white/80 p-2">
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
          disabled={!canChoosePackaging}
          orderId={orderId}
          orderItemId={item.id}
          packagingOptions={packagingOptions}
          unitIndex={unitIndex}
          zone={zone}
        />
      ) : null}
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
    return <p className="mt-2 text-xs text-zinc-500">Для зоны {KITCHEN_ZONE_LABELS[zone]} пока нет привязанной упаковки.</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {packagingOptions.map((packaging) => (
        <form key={packaging.id} action={chooseOrderPackagingAction}>
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="orderItemId" value={orderItemId} />
          <input type="hidden" name="unitIndex" value={unitIndex} />
          <input type="hidden" name="kitchenZone" value={zone} />
          <input type="hidden" name="packageProductId" value={packaging.id} />
          <button type="submit" disabled={disabled || packaging.stockQuantity < 1} className="rounded-full border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-white">
            {packaging.name} · {packaging.stockQuantity} шт
          </button>
        </form>
      ))}
    </div>
  );
}

function getItemKitchenZones(item: OrderItemSummary): KitchenZone[] {
  if (item.kitchenZones.length) {
    return item.kitchenZones;
  }

  return item.kitchenZone ? [item.kitchenZone] : [];
}
