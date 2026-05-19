"use client";

import { useState } from "react";
import {
  InventoryRecipeDeleteButton,
  InventoryRecipeEditButton,
} from "@/modules/inventory/components/inventory-recipes-edit-button";
import type {
  TechCardItem,
  TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

type RecipeDialogEntry =
  | { kind: "single"; card: TechCardItem }
  | { kind: "pizzaGroup"; key: string; cards: TechCardItem[] };

const PIZZA_SIZE_ORDER = ["30 см", "26 см", "24 см"] as const;

export function buildPriceDialogEntries(cards: TechCardItem[]): RecipeDialogEntry[] {
  const pizzaGroups = new Map<string, TechCardItem[]>();
  const entries: RecipeDialogEntry[] = [];

  for (const card of cards) {
    if (card.category === "Пиццы") {
      const key = normalizeRecipeName(card.name);
      pizzaGroups.set(key, [...(pizzaGroups.get(key) ?? []), card]);
    } else {
      entries.push({ kind: "single", card });
    }
  }

  const groupedPizzas = Array.from(pizzaGroups.entries())
    .map(([key, groupCards]) => ({
      kind: "pizzaGroup" as const,
      key,
      cards: sortPizzaCards(groupCards),
    }))
    .sort((left, right) => left.cards[0].name.localeCompare(right.cards[0].name, "ru"));

  return [...groupedPizzas, ...entries];
}

export function PizzaGroupCard({
  cards,
  products,
  canManageInventory,
}: {
  cards: TechCardItem[];
  products: TechCardProductOption[];
  canManageInventory: boolean;
}) {
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? 0);
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];

  return (
    <article className="rounded-[16px] border border-red-950/10 bg-white/84 px-4 py-3 shadow-sm shadow-red-950/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-red-100">
              Пиццы
            </span>
            <span className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 ring-1 ring-zinc-200">
              Размеров: {cards.length}
            </span>
          </div>
          <h3 className="mt-1.5 truncate text-[15px] font-semibold leading-5 text-zinc-950">{selectedCard.name}</h3>
        </div>
        {canManageInventory ? (
          <div className="flex flex-wrap items-center gap-2">
            <InventoryRecipeEditButton card={selectedCard} products={products} />
            <InventoryRecipeDeleteButton card={selectedCard} />
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {cards.map((card) => {
          const isSelected = card.id === selectedCard.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedCardId(card.id)}
              className={`rounded-[14px] border px-3 py-2 text-left transition ${
                isSelected
                  ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                  : "border-red-950/10 bg-white/82 text-zinc-700 hover:border-red-200 hover:bg-red-50/70"
              }`}
            >
              <span className="block text-sm font-bold">{card.pizzaSize ?? "Размер"}</span>
              <span className={`mt-1 block text-[11px] font-semibold ${isSelected ? "text-white/75" : "text-zinc-400"}`}>
                {card.ingredients.length} инг. · выход {formatQuantity(card.outputQuantity)} {card.outputUnit}
              </span>
            </button>
          );
        })}
      </div>

      <IngredientsPreview card={selectedCard} />
    </article>
  );
}

export function DialogCard({
  card,
  products,
  canManageInventory,
}: {
  card: TechCardItem;
  products: TechCardProductOption[];
  canManageInventory: boolean;
}) {
  return (
    <article className="rounded-[16px] border border-red-950/10 bg-white/84 px-4 py-3 shadow-sm shadow-red-950/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-red-100">
              {card.category}
            </span>
            {card.pizzaSize ? (
              <span className="rounded-full bg-red-800 px-3 py-0.5 text-[12px] font-bold text-white shadow-sm shadow-red-950/15">
                {card.pizzaSize}
              </span>
            ) : null}
            <span className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 ring-1 ring-zinc-200">
              Выход: {formatQuantity(card.outputQuantity)} {card.outputUnit}
            </span>
          </div>
          <h3 className="mt-1.5 truncate text-[15px] font-semibold leading-5 text-zinc-950">{card.name}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-400">Ингредиентов: {card.ingredients.length}</span>
          {canManageInventory ? (
            <div className="flex flex-wrap items-center gap-2">
              <InventoryRecipeEditButton card={card} products={products} />
              <InventoryRecipeDeleteButton card={card} />
            </div>
          ) : null}
        </div>
      </div>

      <IngredientsPreview card={card} />
    </article>
  );
}

function IngredientsPreview({ card }: { card: TechCardItem }) {
  return card.ingredients.length > 0 ? (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {card.ingredients.map((ingredient) => (
        <div
          key={ingredient.id}
          className="rounded-[12px] border border-red-950/10 bg-white/82 px-3 py-2 text-xs shadow-sm shadow-red-950/5"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold leading-5 text-zinc-800">{ingredient.productName}</span>
            <span className="shrink-0 font-semibold text-red-800">
              {formatQuantity(ingredient.quantity)} {ingredient.unit}
            </span>
          </div>
          <p className="mt-1 font-semibold text-zinc-400">
            На 1 {card.outputUnit}: {formatQuantity(ingredient.quantity / card.outputQuantity)} {ingredient.unit}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <div className="mt-3 rounded-[12px] border border-dashed border-red-950/14 bg-white/64 px-3 py-2 text-xs font-medium text-zinc-500">
      Состав не заполнен. Открой редактирование и добавь ингредиенты.
    </div>
  );
}

function normalizeRecipeName(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function sortPizzaCards(cards: TechCardItem[]) {
  return [...cards].sort((left, right) => {
    const leftIndex = PIZZA_SIZE_ORDER.indexOf(left.pizzaSize as never);
    const rightIndex = PIZZA_SIZE_ORDER.indexOf(right.pizzaSize as never);
    const safeLeftIndex = leftIndex === -1 ? PIZZA_SIZE_ORDER.length : leftIndex;
    const safeRightIndex = rightIndex === -1 ? PIZZA_SIZE_ORDER.length : rightIndex;

    return safeLeftIndex - safeRightIndex || left.id - right.id;
  });
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 4,
  }).format(value);
}
