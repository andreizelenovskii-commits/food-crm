import type { CatalogItem, CatalogItemVariant } from "@/modules/catalog/catalog.types";

export type SelectedOrderItem = {
  item: CatalogItem;
  variant: CatalogItemVariant | null;
  quantity: number;
  totalCents: number;
  choices: Record<number, number>;
};
