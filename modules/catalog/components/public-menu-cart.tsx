"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import type { CatalogItem, CatalogItemExcludedIngredient, CatalogItemVariant } from "@/modules/catalog/catalog.types";
import { formatPublicMenuMoney } from "@/modules/catalog/components/public-menu-utils";
import { ORDER_STATUS_LABELS } from "@/modules/orders/orders.workflow";
import type { OrderStatus } from "@/modules/orders/orders.types";

const DELIVERY_FEE_CENTS = 17000;

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
  const deliveryFeeCents = cartItems.length ? DELIVERY_FEE_CENTS : 0;
  const payableCents = totalCents + deliveryFeeCents;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex min-h-14 items-center gap-3 rounded-full bg-[#d50014] px-5 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(80,8,18,0.26)] transition hover:bg-[#b90012]"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-white/16">К</span>
        <span>Корзина</span>
        <span className="flex min-w-7 items-center justify-center rounded-full bg-white px-2 py-1 text-xs font-bold text-[#b00012]">
          {itemsCount}
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-[#241316]/45 p-3 backdrop-blur-sm sm:p-5">
          <form
            onSubmit={onSubmit}
            className="max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-hidden rounded-[24px] border border-[#f3dadd] bg-white shadow-2xl shadow-black/24"
          >
            <CartHeader itemsCount={itemsCount} onClose={() => setIsOpen(false)} />
            <div className="grid max-h-[calc(100vh-9rem)] overflow-y-auto lg:grid-cols-[1fr_320px]">
              <div className="space-y-3 p-4 sm:p-5">
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
                  <p className="rounded-[18px] border border-dashed border-[#f2d8dc] bg-[#fffafa] p-5 text-sm text-[#6b5960]">
                    Добавьте блюда из меню, и они появятся здесь.
                  </p>
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
    <div className="flex items-start justify-between gap-4 border-b border-[#f6e2e5] bg-[#fff7f8] p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d50014]">Ваш заказ</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#241316]">
          {itemsCount ? `${itemsCount} поз. в корзине` : "Корзина пуста"}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex size-11 items-center justify-center rounded-full border border-[#f0d9dc] bg-white text-lg font-semibold text-[#9b7d83] transition hover:bg-[#fff1f2] hover:text-[#b00012]"
        aria-label="Закрыть корзину"
      >
        x
      </button>
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
    <div className="rounded-[18px] border border-[#f3dadd] bg-white p-4 shadow-sm shadow-[#d50014]/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#241316]">{entry.item.name}</p>
          <p className="mt-1 text-sm text-[#6b5960]">
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
          className="rounded-full border border-[#f0d9dc] px-3 py-1 text-xs font-semibold text-[#b00012] transition hover:bg-[#fff1f2]"
        >
          Удалить
        </button>
      </div>
      <CartChoiceSlots entry={entry} onChoiceChange={onChoiceChange} />
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CartButton onClick={() => onQuantityChange(entry.key, -1)} label="-" />
          <span className="w-8 text-center text-sm font-semibold">{entry.quantity}</span>
          <CartButton onClick={() => onQuantityChange(entry.key, 1)} label="+" />
        </div>
        <p className="text-sm font-semibold text-[#241316]">
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
          <span className="text-xs font-semibold text-[#3a292d]">{slot.name}</span>
          <select value={entry.choices[slot.id] ?? ""} onChange={(event) => onChoiceChange(entry.key, slot.id, Number(event.target.value))} className="foodlike-field min-h-11 rounded-[14px] text-sm" required>
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
  deliveryFeeCents,
  payableCents,
  subtotalCents,
}: {
  createdOrder: PublicOrderStatus | null;
  currentClient: PublicClientProfile | null;
  isPending: boolean;
  message: string | null;
  deliveryFeeCents: number;
  payableCents: number;
  subtotalCents: number;
}) {
  return (
    <aside className="border-t border-[#f6e2e5] bg-[#fffafa] p-4 sm:p-5 lg:border-l lg:border-t-0">
      <div className="rounded-[18px] bg-white p-4 shadow-sm shadow-[#d50014]/5">
        <TotalRow label="Блюда" value={formatPublicMenuMoney(subtotalCents)} />
        <TotalRow label="Доставка" value={formatPublicMenuMoney(deliveryFeeCents)} />
        <TotalRow label="Итого" value={formatPublicMenuMoney(payableCents)} strong />
      </div>
      <CheckoutFields currentClient={currentClient} />
      {message ? <p className="mt-3 rounded-[14px] border border-[#f3dadd] bg-white px-4 py-3 text-sm text-[#6b5960]">{message}</p> : null}
      {createdOrder ? <p className="mt-3 text-sm font-semibold text-[#b00012]">Статус: {ORDER_STATUS_LABELS[createdOrder.status]}</p> : null}
      <button type="submit" disabled={isPending} className="mt-4 min-h-12 w-full rounded-[16px] bg-[#d50014] px-5 text-sm font-semibold text-white transition hover:bg-[#b90012] disabled:opacity-60">
        {currentClient ? "Оформить заказ" : "Войти для заказа"}
      </button>
    </aside>
  );
}

function CheckoutFields({ currentClient }: { currentClient: PublicClientProfile | null }) {
  return (
    <div className="mt-4 space-y-3">
      <CartInput name="recipientPhone" label="Телефон получателя" defaultValue={currentClient?.phone ?? ""} required />
      <CartInput name="deliveryAddress" label="Адрес доставки" defaultValue={currentClient?.address ?? ""} required />
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#3a292d]">Оплата</span>
        <select name="paymentMethod" className="foodlike-field min-h-12 rounded-[14px]" defaultValue="cash" required>
          <option value="cash">Наличными</option>
          <option value="courier_card">Картой курьеру</option>
          <option value="online">Онлайн оплата</option>
        </select>
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#3a292d]">Комментарий</span>
        <textarea name="customerComment" className="foodlike-field min-h-24 rounded-[14px] py-3" />
      </label>
    </div>
  );
}

function CartInput({ defaultValue, label, name, required }: { defaultValue: string; label: string; name: string; required?: boolean }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#3a292d]">{label}</span>
      <input name={name} defaultValue={defaultValue} className="foodlike-field min-h-12 rounded-[14px]" required={required} />
    </label>
  );
}

function TotalRow({ label, strong, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-1 ${strong ? "mt-2 border-t border-[#f3dadd] pt-3 text-lg font-semibold text-[#241316]" : "text-sm text-[#6b5960]"}`}>
      <span>{label}</span>
      <span className={strong ? "text-[#c90013]" : "font-semibold text-[#241316]"}>{value}</span>
    </div>
  );
}

function CartButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex size-9 items-center justify-center rounded-full border border-[#f0cfd3] text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2]" aria-label={label}>
      {label}
    </button>
  );
}
