import {
  WRITEOFF_REASONS,
  type ProductCategory,
  type ProductItem,
  type WriteoffActSummary,
} from "@/modules/inventory/inventory.types";

export function filterInventoryProducts(
  products: ProductItem[],
  selectedCategory: ProductCategory | "",
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }

    return (
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.sku?.toLowerCase().includes(normalizedQuery) ||
      product.category?.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function groupInventoryProducts(products: ProductItem[]) {
  const groups = products.reduce<Record<string, ProductItem[]>>((acc, product) => {
    const key = product.category ?? "Без категории";
    acc[key] = [...(acc[key] ?? []), product];
    return acc;
  }, {});

  return Object.entries(groups).sort(([left], [right]) => left.localeCompare(right, "ru"));
}

export function groupWriteoffActsByReason(completedActs: WriteoffActSummary[]) {
  const groups = completedActs.reduce<Record<string, WriteoffActSummary[]>>((acc, act) => {
    acc[act.reason] = [...(acc[act.reason] ?? []), act];
    return acc;
  }, {});

  return WRITEOFF_REASONS.flatMap((reasonOption) => {
    const reasonActs = groups[reasonOption] ?? [];
    return reasonActs.length === 0 ? [] : [{ reason: reasonOption, acts: reasonActs }];
  });
}
