import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { backendGet } from "@/shared/api/backend";

export async function fetchCatalogItems(): Promise<CatalogItem[]> {
  return backendGet<CatalogItem[]>("/api/v1/catalog");
}

export async function fetchCatalogItemById(id: number): Promise<CatalogItem | null> {
  return backendGet<CatalogItem | null>(`/api/v1/catalog/${id}`);
}
