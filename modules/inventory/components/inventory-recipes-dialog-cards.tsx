"use client";

import { useState } from "react";
import {
  InventoryRecipeDeleteButton,
  InventoryRecipeEditButton,
} from "@/modules/inventory/components/inventory-recipes-edit-button";
import {
  formatQuantity,
  IngredientsPreview,
} from "@/modules/inventory/components/inventory-recipes-preview";
import type {
  TechCardItem,
  TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

type RecipeDialogEntry =
  | { kind: "single"; card: TechCardItem }
  | { kind: "pizzaGroup"; key: string; cards: TechCardItem[] }
  | { kind: "rollGroup"; key: string; cards: TechCardItem[] };

const PIZZA_SIZE_ORDER = ["30 см", "26 см", "24 см"] as const;
const ROLL_SIZE_ORDER = ["8 шт", "4 шт"] as const;

export function buildPriceDialogEntries(cards: TechCardItem[]): RecipeDialogEntry[] {
  const pizzaGroups = new Map<string, TechCardItem[]>();
  const rollGroups = new Map<string, TechCardItem[]>();
  const entries: RecipeDialogEntry[] = [];

  for (const card of cards) {
    if (card.category === "Пиццы") {
      const key = normalizeRecipeName(card.name);
      pizzaGroups.set(key, [...(pizzaGroups.get(key) ?? []), card]);
    } else if (card.category === "Роллы") {
      const key = normalizeRecipeName(card.name);
      rollGroups.set(key, [...(rollGroups.get(key) ?? []), card]);
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

  const groupedRolls = Array.from(rollGroups.entries())
    .map(([key, groupCards]) => ({
      kind: "rollGroup" as const,
      key,
      cards: sortRollCards(groupCards),
    }))
    .sort((left, right) => left.cards[0].name.localeCompare(right.cards[0].name, "ru"));

  return [...groupedPizzas, ...groupedRolls, ...entries];
}

export function PizzaGroupCard({
  cards,
  products,
  componentOptions = [],
  canManageInventory,
}: {
  cards: TechCardItem[];
  products: TechCardProductOption[];
  componentOptions?: TechCardItem[];
  canManageInventory: boolean;
}) {
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];

  return (
    <article className="rounded-[14px] border border-red-950/10 bg-white/84 px-3 py-2.5 shadow-sm shadow-red-950/5">
      <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_minmax(260px,0.95fr)_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-red-100">
              Пицца
            </span>
            <h3 className="truncate text-[15px] font-semibold leading-5 text-zinc-950">{selectedCard.name}</h3>
          </div>
          <p className="mt-1 text-xs font-semibold text-zinc-400">
            {cards.length} размера · выбран {selectedCard.pizzaSize} · {selectedCard.ingredients.length} инг.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {cards.map((card) => {
            const isSelected = card.id === selectedCard.id;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCardId(card.id)}
                className={`h-10 rounded-full border px-2 text-xs font-bold transition ${
                  isSelected
                    ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                    : "border-red-950/10 bg-white/82 text-zinc-600 hover:border-red-200 hover:bg-red-50/70"
                }`}
              >
                {card.pizzaSize ?? "Размер"}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="h-9 rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Скрыть состав" : "Состав"}
          </button>
          {canManageInventory ? (
            <>
              <InventoryRecipeEditButton card={selectedCard} products={products} componentOptions={componentOptions} />
              <InventoryRecipeDeleteButton card={selectedCard} />
            </>
          ) : null}
        </div>
      </div>

      {isExpanded ? <IngredientsPreview card={selectedCard} compact /> : null}
    </article>
  );
}

export function RollGroupCard({
  cards,
  products,
  componentOptions = [],
  canManageInventory,
}: {
  cards: TechCardItem[];
  products: TechCardProductOption[];
  componentOptions?: TechCardItem[];
  canManageInventory: boolean;
}) {
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];

  return (
    <article className="rounded-[14px] border border-red-950/10 bg-white/84 px-3 py-2.5 shadow-sm shadow-red-950/5">
      <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_minmax(180px,0.7fr)_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-red-100">
              Ролл
            </span>
            <h3 className="truncate text-[15px] font-semibold leading-5 text-zinc-950">{selectedCard.name}</h3>
          </div>
          <p className="mt-1 text-xs font-semibold text-zinc-400">
            {cards.length} варианта · выбран {selectedCard.rollSize} · {selectedCard.ingredients.length} инг.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {cards.map((card) => {
            const isSelected = card.id === selectedCard.id;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCardId(card.id)}
                className={`h-10 rounded-full border px-2 text-xs font-bold transition ${
                  isSelected
                    ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
                    : "border-red-950/10 bg-white/82 text-zinc-600 hover:border-red-200 hover:bg-red-50/70"
                }`}
              >
                {card.rollSize ?? "Кол-во"}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="h-9 rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Скрыть состав" : "Состав"}
          </button>
          {canManageInventory ? (
            <>
              <InventoryRecipeEditButton card={selectedCard} products={products} componentOptions={componentOptions} />
              <InventoryRecipeDeleteButton card={selectedCard} />
            </>
          ) : null}
        </div>
      </div>

      {isExpanded ? <IngredientsPreview card={selectedCard} compact /> : null}
    </article>
  );
}

export function DialogCard({
  card,
  products,
  componentOptions = [],
  canManageInventory,
}: {
  card: TechCardItem;
  products: TechCardProductOption[];
  componentOptions?: TechCardItem[];
  canManageInventory: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

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
            {card.rollSize ? (
              <span className="rounded-full bg-red-800 px-3 py-0.5 text-[12px] font-bold text-white shadow-sm shadow-red-950/15">
                {card.rollSize}
              </span>
            ) : null}
            <span className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 ring-1 ring-zinc-200">
              Выход: {formatQuantity(card.outputQuantity)} {card.outputUnit}
            </span>
          </div>
          <h3 className="mt-1.5 truncate text-[15px] font-semibold leading-5 text-zinc-950">{card.name}</h3>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <span className="text-xs font-semibold text-zinc-400">
            Состав: {card.ingredients.length + card.components.length}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="h-9 rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Скрыть состав" : "Состав"}
          </button>
          {canManageInventory ? (
            <div className="flex flex-wrap items-center gap-2">
              <InventoryRecipeEditButton card={card} products={products} componentOptions={componentOptions} />
              <InventoryRecipeDeleteButton card={card} />
            </div>
          ) : null}
        </div>
      </div>

      {isExpanded ? <IngredientsPreview card={card} /> : null}
    </article>
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

function sortRollCards(cards: TechCardItem[]) {
  return [...cards].sort((left, right) => {
    const leftIndex = ROLL_SIZE_ORDER.indexOf(left.rollSize as never);
    const rightIndex = ROLL_SIZE_ORDER.indexOf(right.rollSize as never);
    const safeLeftIndex = leftIndex === -1 ? ROLL_SIZE_ORDER.length : leftIndex;
    const safeRightIndex = rightIndex === -1 ? ROLL_SIZE_ORDER.length : rightIndex;

    return safeLeftIndex - safeRightIndex || left.id - right.id;
  });
}
