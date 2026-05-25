"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import type { CatalogItem, CatalogItemExcludedIngredient, CatalogItemVariant } from "@/modules/catalog/catalog.types";
import {
  CheckoutPanel,
  DELIVERY_FEE_CENTS,
} from "@/modules/catalog/components/public-menu-checkout";
import { PublicModalCloseButton } from "@/modules/catalog/components/public-modal-shell";
import { formatPublicMenuMoney } from "@/modules/catalog/components/public-menu-utils";
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
  const [isOpen, setIsOpen] = useState(false);
  const itemsCount = cartItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const deliveryFeeCents = DELIVERY_FEE_CENTS;
  const payableCents = totalCents + deliveryFeeCents;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex min-h-14 items-center gap-3 rounded-full bg-[#d50014] px-5 text-sm font-black text-white shadow-[0_20px_50px_rgba(80,8,18,0.26)] transition hover:-translate-y-0.5 hover:bg-[#b90012]"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-white/16 font-black">К</span>
        <span>Корзина</span>
        <span className="flex min-w-7 items-center justify-center rounded-full bg-white px-2 py-1 text-xs font-bold text-[#b00012]">
          {itemsCount}
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#211316]/58 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={onSubmit}
            className="max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(80,8,16,0.24)]"
          >
            <CartHeader itemsCount={itemsCount} onClose={() => setIsOpen(false)} />
            <div className="grid max-h-[calc(100vh-9rem)] overflow-y-auto lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-3 bg-white p-5 sm:p-7">
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
                  <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-dashed border-[#f2d8dc] bg-[#fffafa] p-6 text-center">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d50014]">Корзина</p>
                      <p className="mt-3 text-2xl font-black text-[#241316]">Пока пусто</p>
                      <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-[#7b5e64]">
                        Добавьте блюда из меню, и заказ соберётся здесь.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <CheckoutPanel
                createdOrder={createdOrder}
                currentClient={currentClient}
                isPending={isPending}
                message={message}
                deliveryFeeCents={deliveryFeeCents}
                payableCents={payableCents}
                subtotalCents={totalCents}
              />
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function CartHeader({ itemsCount, onClose }: { itemsCount: number; onClose: () => void }) {
  return (
    <div className="relative overflow-hidden border-b border-[#f6e2e5] bg-[linear-gradient(135deg,#fff8f8_0%,#ffffff_48%,#fff1f2_100%)] p-5 sm:p-7">
      <div className="absolute right-16 top-6 h-20 w-20 rounded-full bg-[#d50014]/8 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d50014]">Ваш заказ</p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-[#241316]">
          {itemsCount ? `${itemsCount} поз. в корзине` : "Корзина пуста"}
        </h2>
      </div>
      <PublicModalCloseButton label="Закрыть корзину" onClose={onClose} />
      </div>
    </div>
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
    <div className="rounded-[22px] border border-[#f3dadd] bg-white p-4 shadow-sm shadow-[#d50014]/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-black text-[#241316]">{entry.item.name}</p>
          <p className="mt-1 text-sm font-semibold text-[#6b5960]">
            {entry.variant.label} · {formatPublicMenuMoney(entry.variant.priceCents)}
          </p>
          {entry.excludedIngredients.length ? (
            <p className="mt-2 text-xs font-semibold text-[#b00012]">
              Без {entry.excludedIngredients.map((ingredient) => ingredient.label).join(", ")}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onQuantityChange(entry.key, -entry.quantity)}
          className="rounded-full border border-[#f0d9dc] bg-white px-3 py-1.5 text-xs font-black text-[#b00012] transition hover:border-[#d50014] hover:bg-[#fff1f2]"
        >
          Удалить
        </button>
      </div>
      <CartChoiceSlots entry={entry} onChoiceChange={onChoiceChange} />
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CartButton onClick={() => onQuantityChange(entry.key, -1)} label="-" />
          <span className="w-8 text-center text-sm font-black text-[#241316]">{entry.quantity}</span>
          <CartButton onClick={() => onQuantityChange(entry.key, 1)} label="+" />
        </div>
        <p className="text-base font-black text-[#241316]">
          {formatPublicMenuMoney(entry.variant.priceCents * entry.quantity)}
        </p>
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
    <div className="mt-3 space-y-2">
      {entry.item.choiceSlots.map((slot) => (
        <label key={slot.id} className="block space-y-1">
          <span className="text-xs font-black text-[#3a292d]">{slot.name}</span>
          <select value={entry.choices[slot.id] ?? ""} onChange={(event) => onChoiceChange(entry.key, slot.id, Number(event.target.value))} className="foodlike-field min-h-11 rounded-[16px] text-sm font-semibold" required>
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

function CartButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex size-9 items-center justify-center rounded-full border border-[#f0cfd3] bg-white text-sm font-black text-[#b00012] transition hover:border-[#d50014] hover:bg-[#fff1f2]" aria-label={label}>
      {label}
    </button>
  );
}
