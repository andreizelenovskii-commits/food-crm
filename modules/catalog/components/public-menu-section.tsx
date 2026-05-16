"use client";

import { FormEvent, useMemo, useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import {
  type AuthMode,
  PublicAuthModal,
} from "@/modules/catalog/components/public-auth-modal";
import { ORDER_STATUS_LABELS } from "@/modules/orders/orders.workflow";
import type { OrderStatus } from "@/modules/orders/orders.types";
import { browserBackendJson } from "@/shared/api/browser-backend";

type Cart = Record<number, number>;

type PublicOrderStatus = {
  id: number;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function itemDescription(item: CatalogItem) {
  return item.description ?? `Позиция из меню${item.pizzaSize ? `, размер ${item.pizzaSize}` : ""}.`;
}

export function PublicMenuSection({
  currentClient,
  items,
}: {
  currentClient: PublicClientProfile | null;
  items: CatalogItem[];
}) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cart, setCart] = useState<Cart>({});
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<PublicOrderStatus | null>(null);
  const categories = Array.from(new Set(items.map((item) => item.category ?? "Меню")));
  const cartItems = useMemo(
    () =>
      items
        .map((item) => ({ item, quantity: cart[item.id] ?? 0 }))
        .filter((entry) => entry.quantity > 0),
    [cart, items],
  );
  const totalCents = cartItems.reduce(
    (sum, entry) => sum + entry.item.priceCents * entry.quantity,
    0,
  );

  function addItem(itemId: number) {
    setCart((current) => ({ ...current, [itemId]: (current[itemId] ?? 0) + 1 }));
    setMessage(null);
  }

  function changeQuantity(itemId: number, delta: number) {
    setCart((current) => {
      const nextQuantity = Math.max((current[itemId] ?? 0) + delta, 0);
      const next = { ...current };
      if (nextQuantity === 0) {
        delete next[itemId];
      } else {
        next[itemId] = nextQuantity;
      }
      return next;
    });
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentClient) {
      setAuthMode("login");
      setIsAuthOpen(true);
      return;
    }

    if (!cartItems.length) {
      setMessage("Добавьте позиции в корзину");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsPending(true);
    setMessage(null);

    try {
      const order = await browserBackendJson<PublicOrderStatus>("/api/v1/public/orders", {
        body: {
          deliveryAddress: String(formData.get("deliveryAddress") ?? "").trim(),
          customerComment: String(formData.get("customerComment") ?? "").trim(),
          items: cartItems.map((entry) => ({
            catalogItemId: entry.item.id,
            quantity: entry.quantity,
          })),
        },
      });
      setCart({});
      setCreatedOrder(order);
      setMessage(`Заказ #${order.id} принят. Статус: ${ORDER_STATUS_LABELS[order.status]}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось оформить заказ");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <section id="menu" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d50014]">
                Меню FoodLike
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#241316] sm:text-5xl">
                Популярное сегодня
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-[#ffd7dc] bg-[#fff5f6] px-4 py-2 text-sm font-semibold text-[#b00012]"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {items.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[8px] border border-[#ffe0e3] bg-white shadow-sm shadow-[#d50014]/8"
                >
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#fff1f2]">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d50014]">
                        FoodLike
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d50014]">
                          {item.category ?? "Меню"}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-[#241316]">{item.name}</h3>
                      </div>
                      <p className="shrink-0 text-lg font-semibold text-[#c90013]">
                        {formatMoney(item.priceCents)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#6b5960]">{itemDescription(item)}</p>
                    <button
                      type="button"
                      onClick={() => addItem(item.id)}
                      className="mt-4 min-h-11 w-full rounded-full bg-[#d50014] px-5 text-sm font-semibold text-white transition hover:bg-[#b90012]"
                    >
                      В корзину
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[8px] border border-[#ffe0e3] bg-[#fffafa] p-6 text-[#6b5960]">
              Сейчас меню обновляется. Скоро здесь появятся опубликованные позиции из CRM.
            </div>
          )}

          <form
            onSubmit={submitOrder}
            className="mt-8 grid gap-5 rounded-[8px] border border-[#ffe0e3] bg-[#fff7f8] p-5 lg:grid-cols-[1fr_0.72fr]"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d50014]">
                Корзина
              </p>
              <div className="mt-4 space-y-3">
                {cartItems.length ? (
                  cartItems.map((entry) => (
                    <div key={entry.item.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-white p-3">
                      <div>
                        <p className="font-semibold text-[#241316]">{entry.item.name}</p>
                        <p className="text-sm text-[#6b5960]">{formatMoney(entry.item.priceCents)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CartButton onClick={() => changeQuantity(entry.item.id, -1)} label="-" />
                        <span className="w-6 text-center text-sm font-semibold">{entry.quantity}</span>
                        <CartButton onClick={() => changeQuantity(entry.item.id, 1)} label="+" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[8px] bg-white p-4 text-sm text-[#6b5960]">
                    Добавьте блюда из меню.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[8px] bg-white p-4">
              <p className="text-lg font-semibold text-[#241316]">
                Итого: {formatMoney(totalCents)}
              </p>
              <label className="mt-4 block space-y-2">
                <span className="text-sm font-semibold text-[#3a292d]">Адрес доставки</span>
                <input name="deliveryAddress" className="foodlike-field min-h-12 rounded-[8px]" required />
              </label>
              <label className="mt-3 block space-y-2">
                <span className="text-sm font-semibold text-[#3a292d]">Комментарий</span>
                <textarea name="customerComment" className="foodlike-field min-h-24 rounded-[8px] py-3" />
              </label>
              {message ? (
                <p className="mt-3 rounded-[8px] border border-[#f3dadd] bg-[#fffafa] px-4 py-3 text-sm text-[#6b5960]">
                  {message}
                </p>
              ) : null}
              {createdOrder ? (
                <p className="mt-3 text-sm font-semibold text-[#b00012]">
                  Текущий статус: {ORDER_STATUS_LABELS[createdOrder.status]}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={isPending}
                className="mt-4 min-h-12 w-full rounded-full bg-[#d50014] px-5 text-sm font-semibold text-white transition hover:bg-[#b90012] disabled:opacity-60"
              >
                {currentClient ? "Оформить заказ" : "Войти для заказа"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {isAuthOpen ? (
        <PublicAuthModal
          mode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onModeChange={setAuthMode}
        />
      ) : null}
    </>
  );
}

function CartButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full border border-[#f0cfd3] text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2]"
      aria-label={label}
    >
      {label}
    </button>
  );
}
