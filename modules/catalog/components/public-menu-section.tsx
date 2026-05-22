"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import type { CatalogItem, CatalogItemVariant } from "@/modules/catalog/catalog.types";
import {
  PublicMenuCart,
  type PublicOrderStatus,
} from "@/modules/catalog/components/public-menu-cart";
import {
  type AuthMode,
  PublicAuthModal,
} from "@/modules/catalog/components/public-auth-modal";
import { PublicMenuProductModal } from "@/modules/catalog/components/public-menu-product-modal";
import {
  describePublicMenuItem,
  getPublicMenuCardPrice,
  resolvePublicMenuVariant,
} from "@/modules/catalog/components/public-menu-utils";
import { ORDER_STATUS_LABELS } from "@/modules/orders/orders.workflow";
import { browserBackendJson } from "@/shared/api/browser-backend";

type Cart = Record<string, {
  itemId: number;
  variantId: number;
  excludedIngredientIds: number[];
  quantity: number;
}>;
type CartChoices = Record<string, Record<number, number>>;

function cartKey(itemId: number, variantId: number, excludedIngredientIds: number[] = []) {
  const exclusions = [...excludedIngredientIds].sort((left, right) => left - right).join(".");
  return `${itemId}:${variantId}:${exclusions}`;
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
  const [activeItem, setActiveItem] = useState<CatalogItem | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [cartChoices, setCartChoices] = useState<CartChoices>({});
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<PublicOrderStatus | null>(null);
  const categories = Array.from(new Set(items.map((item) => item.category ?? "Меню")));
  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([key, entry]) => {
          const item = items.find((candidate) => candidate.id === entry.itemId);

          if (!item) {
            return null;
          }

          return {
            key,
            item,
            quantity: entry.quantity,
            variant: resolvePublicMenuVariant(item, entry.variantId),
            excludedIngredients: item.excludedIngredients.filter((ingredient) =>
              entry.excludedIngredientIds.includes(ingredient.id),
            ),
            choices: cartChoices[key] ?? {},
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        .filter((entry) => entry.quantity > 0),
    [cart, cartChoices, items],
  );
  const totalCents = cartItems.reduce(
    (sum, entry) => sum + entry.variant.priceCents * entry.quantity,
    0,
  );

  function addConfiguredItem(
    item: CatalogItem,
    variant: CatalogItemVariant,
    quantity: number,
    excludedIngredientIds: number[],
  ) {
    const key = cartKey(item.id, variant.id, excludedIngredientIds);
    setCart((current) => ({
      ...current,
      [key]: {
        itemId: item.id,
        variantId: variant.id,
        excludedIngredientIds,
        quantity: (current[key]?.quantity ?? 0) + quantity,
      },
    }));
    setActiveItem(null);
    setMessage(null);
  }

  function changeQuantity(key: string, delta: number) {
    setCart((current) => {
      const entry = current[key];
      const nextQuantity = Math.max((entry?.quantity ?? 0) + delta, 0);
      const next = { ...current };
      if (nextQuantity === 0) {
        delete next[key];
        setCartChoices((currentChoices) => {
          const nextChoices = { ...currentChoices };
          delete nextChoices[key];
          return nextChoices;
        });
      } else if (entry) {
        next[key] = { ...entry, quantity: nextQuantity };
      }
      return next;
    });
  }

  function changeChoice(key: string, choiceSlotId: number, selectedCatalogItemId: number) {
    setCartChoices((current) => ({
      ...current,
      [key]: {
        ...(current[key] ?? {}),
        [choiceSlotId]: selectedCatalogItemId,
      },
    }));
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
            catalogItemVariantId: entry.variant.id,
            excludedIngredientIds: entry.excludedIngredients.map((ingredient) => ingredient.id),
            quantity: entry.quantity,
            choices: entry.item.choiceSlots.map((slot) => ({
              choiceSlotId: slot.id,
              selectedCatalogItemId: entry.choices[slot.id],
            })),
          })),
        },
      });
      setCart({});
      setCartChoices({});
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
              {items.map((item) => {
                const cardPrice = getPublicMenuCardPrice(item);

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[8px] border border-[#ffe0e3] bg-white shadow-sm shadow-[#d50014]/8"
                  >
                  <button
                    type="button"
                    onClick={() => setActiveItem(item)}
                    className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[#fff1f2]"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={640}
                        height={480}
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d50014]">
                        FoodLike
                      </span>
                    )}
                  </button>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d50014]">
                          {item.category ?? "Меню"}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-[#241316]">{item.name}</h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-semibold text-[#c90013]">{cardPrice.label}</p>
                        {cardPrice.hint ? (
                          <p className="mt-1 text-xs font-semibold text-[#9b7d83]">{cardPrice.hint}</p>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#6b5960]">{describePublicMenuItem(item)}</p>
                    <button
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className="mt-4 min-h-11 w-full rounded-full bg-[#d50014] px-5 text-sm font-semibold text-white transition hover:bg-[#b90012]"
                    >
                      Выбрать
                    </button>
                  </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-[8px] border border-[#ffe0e3] bg-[#fffafa] p-6 text-[#6b5960]">
              Сейчас меню обновляется. Скоро здесь появятся опубликованные позиции из CRM.
            </div>
          )}

          <PublicMenuCart
            cartItems={cartItems}
            createdOrder={createdOrder}
            currentClient={currentClient}
            isPending={isPending}
            message={message}
            totalCents={totalCents}
            onChoiceChange={changeChoice}
            onQuantityChange={changeQuantity}
            onSubmit={submitOrder}
          />
        </div>
      </section>

      {activeItem ? (
        <PublicMenuProductModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onAdd={addConfiguredItem}
        />
      ) : null}

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
