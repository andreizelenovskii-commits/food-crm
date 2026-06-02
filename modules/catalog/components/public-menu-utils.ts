import type { CatalogItem } from "@/modules/catalog/catalog.types";

const PIZZA_SIZE_ORDER = ["24 см", "26 см", "30 см"] as const;
const ROLL_SIZE_ORDER = ["4 шт", "8 шт"] as const;
const ROLL_CATEGORY_NAMES = ["Роллы", "Холодные роллы", "Запеченные роллы", "Теплые роллы"] as const;
const DESCRIPTIONLESS_CATEGORIES = ["Комбо", "Сеты"] as const;

export function formatPublicMenuMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function describePublicMenuItem(item: CatalogItem) {
  if (isDescriptionlessCategory(item.category) || (item.category === "Напитки" && !item.description)) {
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
      outputQuantity: item.outputQuantity,
      outputUnit: item.outputUnit,
    }
  );
}

export function getPublicMenuCardPrice(item: CatalogItem) {
  const variant = resolvePublicMenuVariant(item);
  const isSizedItem = item.category === "Пицца" || item.category === "Пиццы" || isRollCategory(item.category);
  const hasVariantChoice = item.variants.length > 1;

  if (!hasVariantChoice) {
    return {
      label: formatPublicMenuMoney(variant.priceCents),
      hint: formatSingleVariantHint(variant),
    };
  }

  const baseVariant = (isSizedItem ? findBaseSizedVariant(item) : findLowestPriceVariant(item)) ?? variant;

  return {
    label: `от ${formatPublicMenuMoney(baseVariant.priceCents)}`,
    hint: baseVariant.label || null,
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

function isDescriptionlessCategory(category: string | null) {
  return DESCRIPTIONLESS_CATEGORIES.includes(category as (typeof DESCRIPTIONLESS_CATEGORIES)[number]);
}

function findLowestPriceVariant(item: CatalogItem) {
  return [...item.variants].sort((left, right) =>
    left.priceCents - right.priceCents || left.displayOrder - right.displayOrder,
  )[0] ?? null;
}

function formatSingleVariantHint(variant: ReturnType<typeof resolvePublicMenuVariant>) {
  return variant.rollSize ?? variant.pizzaSize ?? getMeaningfulVariantLabel(variant.label) ?? formatPublicMenuOutput(variant.outputQuantity, variant.outputUnit);
}

function getMeaningfulVariantLabel(label: string) {
  const normalizedLabel = label.trim();
  return normalizedLabel && normalizedLabel.toLowerCase() !== "стандарт" ? normalizedLabel : null;
}

function normalizeSortIndex(index: number, fallback: number) {
  return index === -1 ? fallback : index;
}

function formatPublicMenuOutput(quantity: number, unit: string) {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  if (unit === "кг") {
    const grams = quantity * 1000;
    const roundedGrams = Number.isInteger(grams) ? grams : Math.round(grams);
    return `${roundedGrams} г`;
  }

  const normalizedQuantity = Number.isInteger(quantity)
    ? quantity.toString()
    : quantity.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  return `${normalizedQuantity} ${unit}`;
}
