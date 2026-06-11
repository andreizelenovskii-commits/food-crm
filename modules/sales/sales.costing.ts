import type { CatalogItem } from "@/modules/catalog/catalog.types";
import type { ProductItem } from "@/modules/inventory/inventory.types";
import type { OrderItemSummary } from "@/modules/orders/orders.types";
import type { TechCardItem } from "@/modules/tech-cards/tech-cards.types";

type CostingMaps = {
  catalogById: Map<number, CatalogItem>;
  productsById: Map<number, ProductItem>;
  techCardsById: Map<number, TechCardItem>;
};

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((sum, item) => sum + getValue(item), 0);
}

function buildCostingMaps(
  catalogItems: CatalogItem[],
  products: ProductItem[],
  techCards: TechCardItem[],
): CostingMaps {
  return {
    catalogById: new Map(catalogItems.map((item) => [item.id, item])),
    productsById: new Map(products.map((product) => [product.id, product])),
    techCardsById: new Map(techCards.map((card) => [card.id, card])),
  };
}

function getCardTotalCostCents(
  card: TechCardItem,
  maps: CostingMaps,
  visited = new Set<number>(),
): number {
  if (visited.has(card.id)) {
    return 0;
  }

  const nextVisited = new Set(visited).add(card.id);
  const ingredientCostCents = sumBy(card.ingredients, (ingredient) => {
    const product = maps.productsById.get(ingredient.productId);
    return product ? ingredient.quantity * product.priceCents : 0;
  });
  const componentCostCents = sumBy(card.components, (component) => {
    const componentCard = maps.techCardsById.get(component.techCardId);
    if (!componentCard) {
      return 0;
    }

    return getCardUnitCostCents(componentCard, maps, nextVisited) * component.quantity;
  });

  return ingredientCostCents + componentCostCents;
}

function getCardUnitCostCents(
  card: TechCardItem,
  maps: CostingMaps,
  visited = new Set<number>(),
) {
  const outputQuantity = Math.max(card.outputQuantity || 1, 1);
  return getCardTotalCostCents(card, maps, visited) / outputQuantity;
}

function getOrderItemTechCard(item: OrderItemSummary, maps: CostingMaps) {
  if (!item.catalogItemId) {
    return null;
  }

  const catalogItem = maps.catalogById.get(item.catalogItemId);
  const variant = catalogItem?.variants.find((candidate) => candidate.id === item.catalogItemVariantId);
  const techCardId = variant?.technologicalCardId ?? catalogItem?.technologicalCardId;

  return techCardId ? maps.techCardsById.get(techCardId) ?? null : null;
}

function getExcludedIngredientCostCents(
  item: OrderItemSummary,
  card: TechCardItem,
  maps: CostingMaps,
) {
  const excludedProductIds = new Set(item.excludedIngredients.map((ingredient) => ingredient.productId));

  return sumBy(card.ingredients, (ingredient) => {
    if (!excludedProductIds.has(ingredient.productId)) {
      return 0;
    }

    const product = maps.productsById.get(ingredient.productId);
    const outputQuantity = Math.max(card.outputQuantity || 1, 1);
    return product ? (ingredient.quantity * product.priceCents * item.quantity) / outputQuantity : 0;
  });
}

export function buildOrderItemCostEstimator({
  catalogItems,
  products,
  techCards,
}: {
  catalogItems: CatalogItem[];
  products: ProductItem[];
  techCards: TechCardItem[];
}) {
  const maps = buildCostingMaps(catalogItems, products, techCards);

  return (item: OrderItemSummary) => {
    const card = getOrderItemTechCard(item, maps);
    if (!card) {
      return 0;
    }

    const baseCostCents = getCardUnitCostCents(card, maps) * item.quantity;
    return Math.max(0, Math.round(baseCostCents - getExcludedIngredientCostCents(item, card, maps)));
  };
}
