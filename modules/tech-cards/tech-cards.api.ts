import type { TechCardItem, TechCardProductOption } from "@/modules/tech-cards/tech-cards.types";
import { backendGet } from "@/shared/api/backend";

export async function fetchTechCards(): Promise<TechCardItem[]> {
  return backendGet<TechCardItem[]>("/api/v1/tech-cards");
}

export async function fetchTechCardById(id: number): Promise<TechCardItem | null> {
  return backendGet<TechCardItem | null>(`/api/v1/tech-cards/${id}`);
}

export async function fetchTechCardProductOptions(): Promise<TechCardProductOption[]> {
  return backendGet<TechCardProductOption[]>("/api/v1/tech-cards/product-options");
}

export async function fetchTechCardOptions(): Promise<Array<{ id: number; name: string; category: string; pizzaSize: string | null }>> {
  return backendGet<Array<{ id: number; name: string; category: string; pizzaSize: string | null }>>(
    "/api/v1/tech-cards/options",
  );
}
