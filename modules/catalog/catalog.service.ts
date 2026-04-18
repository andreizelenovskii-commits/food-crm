import { createCatalogItem, getCatalogItems } from "@/modules/catalog/catalog.repository";
import type { CatalogItemInput } from "@/modules/catalog/catalog.validation";

export async function fetchCatalogItems() {
  return getCatalogItems();
}

export async function addCatalogItem(input: CatalogItemInput) {
  return createCatalogItem(input);
}
