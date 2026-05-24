"use client";

import { FormEvent, useMemo, useState } from "react";
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
import { PublicMenuCard } from "@/modules/catalog/components/public-menu-card";
import { PublicMenuProductModal } from "@/modules/catalog/components/public-menu-product-modal";
import { resolvePublicMenuVariant } from "@/modules/catalog/components/public-menu-utils";
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
  featuredItems,
  items,
}: {
  currentClient: PublicClientProfile | null;
  featuredItems: CatalogItem[];
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
          recipientPhone: String(formData.get("recipientPhone") ?? "").trim(),
          paymentMethod: String(formData.get("paymentMethod") ?? "").trim(),
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
      <section id="menu" className="relative overflow-hidden bg-white py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,#fff5f6_0%,rgba(255,255,255,0)_100%)]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d50014]">
                Меню FoodLike
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#241316] sm:text-5xl">
                Популярное сегодня
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#6b5960]">
                Небольшая витрина из меню на сегодня. Полный выбор откроется через строку категорий наверху.
              </p>
            </div>
            <a
              href="#menu-categories"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border border-[#ffd7dc] bg-[#fff5f6] px-6 text-sm font-semibold text-[#b00012] shadow-sm shadow-[#d50014]/8 transition hover:border-[#d50014] hover:bg-[#d50014] hover:text-white"
            >
              Смотреть меню
            </a>
          </div>

          {featuredItems.length ? (
            <div className="relative mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredItems.map((item) => (
                <PublicMenuCard key={item.id} item={item} onSelect={setActiveItem} />
              ))}
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
