"use client";

import type { FormEvent } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import type { CatalogItem, CatalogItemExcludedIngredient, CatalogItemVariant } from "@/modules/catalog/catalog.types";
import { formatPublicMenuMoney } from "@/modules/catalog/components/public-menu-utils";
import { ORDER_STATUS_LABELS } from "@/modules/orders/orders.workflow";
import type { OrderStatus } from "@/modules/orders/orders.types";

export type PublicCartEntry = {
  key: string;
  item: CatalogItem;
  quantity: number;
  variant: CatalogItemVariant;
  excludedIngredients: CatalogItemExcludedIngredient[];
  choices: Record<number, number>;
};

export type PublicOrderStatus = {
  id: number;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
};

export function PublicMenuCart({
  cartItems,
  createdOrder,
  currentClient,
  isPending,
  message,
  totalCents,
  onChoiceChange,
  onQuantityChange,
  onSubmit,
}: {
  cartItems: PublicCartEntry[];
  createdOrder: PublicOrderStatus | null;
  currentClient: PublicClientProfile | null;
  isPending: boolean;
  message: string | null;
  totalCents: number;
  onChoiceChange: (key: string, choiceSlotId: number, selectedCatalogItemId: number) => void;
  onQuantityChange: (key: string, delta: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5 rounded-[8px] border border-[#ffe0e3] bg-[#fff7f8] p-5 lg:grid-cols-[1fr_0.72fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d50014]">Корзина</p>
        <div className="mt-4 space-y-3">
          {cartItems.length ? (
            cartItems.map((entry) => (
              <CartLine
                key={entry.key}
                entry={entry}
                onChoiceChange={onChoiceChange}
                onQuantityChange={onQuantityChange}
              />
            ))
          ) : (
            <p className="rounded-[8px] bg-white p-4 text-sm text-[#6b5960]">Добавьте блюда из меню.</p>
          )}
        </div>
      </div>
      <CheckoutPanel
        createdOrder={createdOrder}
        currentClient={currentClient}
        isPending={isPending}
        message={message}
        totalCents={totalCents}
      />
    </form>
  );
}

function CartLine({
  entry,
  onChoiceChange,
  onQuantityChange,
}: {
  entry: PublicCartEntry;
  onChoiceChange: (key: string, choiceSlotId: number, selectedCatalogItemId: number) => void;
  onQuantityChange: (key: string, delta: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] bg-white p-3">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#241316]">{entry.item.name}</p>
        <p className="text-sm text-[#6b5960]">{entry.variant.label} · {formatPublicMenuMoney(entry.variant.priceCents)}</p>
        {entry.excludedIngredients.length ? (
          <p className="mt-1 text-xs font-semibold text-[#b00012]">
            Без {entry.excludedIngredients.map((ingredient) => ingredient.label).join(", ")}
          </p>
        ) : null}
        <CartChoiceSlots entry={entry} onChoiceChange={onChoiceChange} />
      </div>
      <div className="flex items-center gap-2">
        <CartButton onClick={() => onQuantityChange(entry.key, -1)} label="-" />
        <span className="w-6 text-center text-sm font-semibold">{entry.quantity}</span>
        <CartButton onClick={() => onQuantityChange(entry.key, 1)} label="+" />
      </div>
    </div>
  );
}

function CartChoiceSlots({
  entry,
  onChoiceChange,
}: {
  entry: PublicCartEntry;
  onChoiceChange: (key: string, choiceSlotId: number, selectedCatalogItemId: number) => void;
}) {
  if (!entry.item.choiceSlots.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {entry.item.choiceSlots.map((slot) => (
        <label key={slot.id} className="block space-y-1">
          <span className="text-xs font-semibold text-[#3a292d]">{slot.name}</span>
          <select value={entry.choices[slot.id] ?? ""} onChange={(event) => onChoiceChange(entry.key, slot.id, Number(event.target.value))} className="foodlike-field min-h-10 rounded-[8px] text-sm" required>
            <option value="">Выбрать</option>
            {slot.options.map((option) => (
              <option key={option.catalogItemId} value={option.catalogItemId}>
                {option.name}
                {option.pizzaSize ? ` · ${option.pizzaSize}` : ""}
                {option.rollSize ? ` · ${option.rollSize}` : ""}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

function CheckoutPanel({
  createdOrder,
  currentClient,
  isPending,
  message,
  totalCents,
}: {
  createdOrder: PublicOrderStatus | null;
  currentClient: PublicClientProfile | null;
  isPending: boolean;
  message: string | null;
  totalCents: number;
}) {
  return (
    <div className="rounded-[8px] bg-white p-4">
      <p className="text-lg font-semibold text-[#241316]">Итого: {formatPublicMenuMoney(totalCents)}</p>
      <label className="mt-4 block space-y-2">
        <span className="text-sm font-semibold text-[#3a292d]">Адрес доставки</span>
        <input name="deliveryAddress" className="foodlike-field min-h-12 rounded-[8px]" required />
      </label>
      <label className="mt-3 block space-y-2">
        <span className="text-sm font-semibold text-[#3a292d]">Комментарий</span>
        <textarea name="customerComment" className="foodlike-field min-h-24 rounded-[8px] py-3" />
      </label>
      {message ? <p className="mt-3 rounded-[8px] border border-[#f3dadd] bg-[#fffafa] px-4 py-3 text-sm text-[#6b5960]">{message}</p> : null}
      {createdOrder ? <p className="mt-3 text-sm font-semibold text-[#b00012]">Текущий статус: {ORDER_STATUS_LABELS[createdOrder.status]}</p> : null}
      <button type="submit" disabled={isPending} className="mt-4 min-h-12 w-full rounded-full bg-[#d50014] px-5 text-sm font-semibold text-white transition hover:bg-[#b90012] disabled:opacity-60">
        {currentClient ? "Оформить заказ" : "Войти для заказа"}
      </button>
    </div>
  );
}

function CartButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex size-8 items-center justify-center rounded-full border border-[#f0cfd3] text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2]" aria-label={label}>
      {label}
    </button>
  );
}
