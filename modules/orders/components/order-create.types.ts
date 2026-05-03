import type { CatalogItem } from "@/modules/catalog/catalog.types";

export type SelectedOrderItem = {
  item: CatalogItem;
  quantity: number;
  totalCents: number;
};
