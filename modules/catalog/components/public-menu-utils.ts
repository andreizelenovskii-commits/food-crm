import type { CatalogItem } from "@/modules/catalog/catalog.types";

export function formatPublicMenuMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function describePublicMenuItem(item: CatalogItem) {
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
