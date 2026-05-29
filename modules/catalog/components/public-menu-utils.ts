import type { CatalogItem } from "@/modules/catalog/catalog.types";

const PIZZA_SIZE_ORDER = ["24 см", "26 см", "30 см"] as const;
const ROLL_SIZE_ORDER = ["4 шт", "8 шт"] as const;
const ROLL_CATEGORY_NAMES = ["Роллы", "Холодные роллы", "Запеченные роллы", "Теплые роллы"] as const;

export function formatPublicMenuMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function describePublicMenuItem(item: CatalogItem) {
  if (item.category === "Напитки" && !item.description) {
    return "";
  }

  const variant = item.pizzaSize ?? item.rollSize;
  return item.description ?? `Позиция из меню${variant ? `, вариант ${variant}` : ""}.`;
}

export function resolvePublicMenuVariant(item: CatalogItem, selectedVariantId?: number) {
  return (
    item.variants.find((variant) => variant.id === selectedVariantId) ??
    item.variants.find((variant) => variant.isDefault) ??
    item.variants[0] ??
    {
      id: 0,
      label: item.pizzaSize ?? item.rollSize ?? "Стандарт",
      priceCents: item.priceCents,
      isDefault: true,
      displayOrder: 0,
      technologicalCardId: item.technologicalCardId,
      technologicalCardName: item.technologicalCardName,
      pizzaSize: item.pizzaSize,
      rollSize: item.rollSize,
    }
  );
}

export function getPublicMenuCardPrice(item: CatalogItem) {
  const variant = resolvePublicMenuVariant(item);
  const isSizedItem = item.category === "Пицца" || item.category === "Пиццы" || isRollCategory(item.category);

  if (!isSizedItem || item.variants.length <= 1) {
    return {
      label: `от ${formatPublicMenuMoney(variant.priceCents)}`,
      hint: null,
    };
  }

  const baseVariant = findBaseSizedVariant(item) ?? variant;

  return {
    label: `от ${formatPublicMenuMoney(baseVariant.priceCents)}`,
    hint: baseVariant.label,
  };
}

function findBaseSizedVariant(item: CatalogItem) {
  if (item.category === "Пицца" || item.category === "Пиццы") {
    return [...item.variants].sort((left, right) => {
      const leftIndex = PIZZA_SIZE_ORDER.indexOf(left.label as never);
      const rightIndex = PIZZA_SIZE_ORDER.indexOf(right.label as never);
      return normalizeSortIndex(leftIndex, PIZZA_SIZE_ORDER.length) - normalizeSortIndex(rightIndex, PIZZA_SIZE_ORDER.length);
    })[0];
  }

  if (isRollCategory(item.category)) {
    return [...item.variants].sort((left, right) => {
      const leftIndex = ROLL_SIZE_ORDER.indexOf(left.label as never);
      const rightIndex = ROLL_SIZE_ORDER.indexOf(right.label as never);
      return normalizeSortIndex(leftIndex, ROLL_SIZE_ORDER.length) - normalizeSortIndex(rightIndex, ROLL_SIZE_ORDER.length);
    })[0];
  }

  return null;
}

function isRollCategory(category: string | null) {
  return ROLL_CATEGORY_NAMES.includes(category as (typeof ROLL_CATEGORY_NAMES)[number]);
}

function normalizeSortIndex(index: number, fallback: number) {
  return index === -1 ? fallback : index;
}
