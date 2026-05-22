"use client";

import { useState, type ReactNode } from "react";
import {
  buildPriceDialogEntries,
  DialogCard,
  PizzaGroupCard,
  RollGroupCard,
} from "@/modules/inventory/components/inventory-recipes-dialog-cards";
import {
  getKindMeta,
  type RecipeKind,
} from "@/modules/inventory/components/inventory-recipes-kind-meta";
import type {
  TechCardItem,
  TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

export function KindDialog({
  kind,
  cards,
  products,
  componentOptions,
  canManageInventory,
  onClose,
}: {
  kind: RecipeKind;
  cards: TechCardItem[];
  products: TechCardProductOption[];
  componentOptions: TechCardItem[];
  canManageInventory: boolean;
  onClose: () => void;
}) {
  const meta = getKindMeta(kind);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const productCategoriesById = new Map(products.map((product) => [product.id, product.category]));
  const categoryOptions = getSearchCategoryOptions(kind, cards, productCategoriesById);
  const filteredCards = filterTechCards(kind, cards, query, selectedCategory, productCategoriesById);
  const entries = kind === "price" ? buildPriceDialogEntries(filteredCards) : filteredCards.map((card) => ({
    kind: "single" as const,
    card,
  }));
  const hasFilters = Boolean(query.trim() || selectedCategory);

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть список техкарт" />
      <section role="dialog" aria-modal="true" aria-label={meta.title} className="relative mx-auto max-w-5xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <DialogHeader meta={meta} onClose={onClose} />
        <DialogFilters
          kind={kind}
          query={query}
          selectedCategory={selectedCategory}
          categoryOptions={categoryOptions}
          onQueryChange={setQuery}
          onCategoryChange={setSelectedCategory}
        />
        <div className="mt-3 space-y-2.5">
          {entries.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-red-950/14 bg-white/70 p-5 text-sm leading-6 text-zinc-500">
              {hasFilters ? "По этому запросу техкарты не найдены." : "В этом разделе пока нет технологических карт."}
            </div>
          ) : (
            entries.map((entry) =>
              entry.kind === "pizzaGroup" ? (
                <PizzaGroupCard
                  key={entry.key}
                  cards={entry.cards}
                  products={products}
                  componentOptions={componentOptions}
                  canManageInventory={canManageInventory}
                />
              ) : entry.kind === "rollGroup" ? (
                <RollGroupCard
                  key={entry.key}
                  cards={entry.cards}
                  products={products}
                  componentOptions={componentOptions}
                  canManageInventory={canManageInventory}
                />
              ) : (
                <DialogCard
                  key={entry.card.id}
                  card={entry.card}
                  products={products}
                  componentOptions={componentOptions}
                  canManageInventory={canManageInventory}
                />
              ),
            )
          )}
        </div>
      </section>
    </div>
  );
}

function DialogHeader({
  meta,
  onClose,
}: {
  meta: ReturnType<typeof getKindMeta>;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
          Технологические карты
        </p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-950">{meta.title}</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{meta.description}</p>
      </div>
      <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
        Закрыть
      </button>
    </div>
  );
}

function DialogFilters({
  kind,
  query,
  selectedCategory,
  categoryOptions,
  onQueryChange,
  onCategoryChange,
}: {
  kind: RecipeKind;
  query: string;
  selectedCategory: string;
  categoryOptions: string[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}) {
  return (
    <label className="mt-3 block rounded-[18px] border border-white/70 bg-white/78 px-4 py-3 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl">
      <span className="text-xs font-semibold text-zinc-700">Поиск техкарты</span>
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={getSearchPlaceholder(kind)}
        className="mt-2 h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
      />
      {categoryOptions.length > 0 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <CategoryFilterButton category="" selectedCategory={selectedCategory} onCategoryChange={onCategoryChange}>
            Все категории
          </CategoryFilterButton>
          {categoryOptions.map((category) => (
            <CategoryFilterButton key={category} category={category} selectedCategory={selectedCategory} onCategoryChange={onCategoryChange}>
              {category}
            </CategoryFilterButton>
          ))}
        </div>
      ) : null}
    </label>
  );
}

function CategoryFilterButton({
  category,
  selectedCategory,
  onCategoryChange,
  children,
}: {
  category: string;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  children: ReactNode;
}) {
  const isSelected = selectedCategory === category;

  return (
    <button
      type="button"
      onClick={() => onCategoryChange(category)}
      className={`h-8 shrink-0 rounded-full border px-3 text-xs font-semibold transition ${
        isSelected
          ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/15"
          : "border-red-100 bg-white/90 text-zinc-600 hover:border-red-200 hover:bg-red-50"
      }`}
    >
      {children}
    </button>
  );
}

function getSearchPlaceholder(kind: RecipeKind) {
  if (kind === "ingredient") {
    return "Название заготовки или ингредиент";
  }
  if (kind === "composite") {
    return "Название, категория или вложенная техкарта";
  }
  return "Название, категория, размер или ингредиент";
}

function getSearchCategoryOptions(
  kind: RecipeKind,
  cards: TechCardItem[],
  productCategoriesById: Map<number, string | null>,
) {
  const categories = new Set<string>();

  for (const card of cards) {
    if (kind === "price" || kind === "composite") {
      categories.add(card.category);
      continue;
    }

    for (const ingredient of card.ingredients) {
      const productCategory = productCategoriesById.get(ingredient.productId);

      if (productCategory) {
        categories.add(productCategory);
      }
    }
  }

  return Array.from(categories).sort((left, right) => left.localeCompare(right, "ru"));
}

function filterTechCards(
  kind: RecipeKind,
  cards: TechCardItem[],
  query: string,
  selectedCategory: string,
  productCategoriesById: Map<number, string | null>,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery && !selectedCategory) {
    return cards;
  }

  return cards.filter((card) => {
    const ingredientCategories = card.ingredients
      .map((ingredient) => productCategoriesById.get(ingredient.productId))
      .filter((category): category is string => Boolean(category));
    const componentCategories = card.components.map((component) => component.techCardCategory);
    const matchesCategory =
      !selectedCategory ||
      (kind === "ingredient"
        ? ingredientCategories.includes(selectedCategory)
        : card.category === selectedCategory || componentCategories.includes(selectedCategory));

    if (!matchesCategory) {
      return false;
    }

    const searchableValue = [
      card.name,
      card.category,
      card.pizzaSize ?? "",
      card.rollSize ?? "",
      card.outputUnit,
      card.description ?? "",
      ...componentCategories,
      ...card.components.map((component) => component.techCardName),
      ...ingredientCategories,
      ...card.ingredients.map((ingredient) => ingredient.productName),
    ]
      .join(" ")
      .toLowerCase();

    return searchableValue.includes(normalizedQuery);
  });
}
