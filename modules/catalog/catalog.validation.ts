import { ValidationError } from "@/shared/errors/app-error";

function normalizeInput(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export type CatalogItemInput = {
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  priceCents: number;
  isPublished: boolean;
  displayOrder: number;
  technologicalCardId: number;
};

export function parseCatalogItemInput(formData: FormData): CatalogItemInput {
  const name = normalizeInput(formData.get("name"));
  const slug = normalizeInput(formData.get("slug")).toLowerCase();
  const category = normalizeInput(formData.get("category"));
  const description = normalizeInput(formData.get("description"));
  const price = Number(normalizeInput(formData.get("price")));
  const displayOrder = Number(normalizeInput(formData.get("displayOrder")) || "0");
  const technologicalCardId = Number(normalizeInput(formData.get("technologicalCardId")));
  const isPublished = normalizeInput(formData.get("isPublished")) === "on";

  if (!name || !slug || !Number.isFinite(price) || price < 0) {
    throw new ValidationError("Заполните название, slug и цену позиции каталога");
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new ValidationError("Slug должен содержать только латиницу, цифры и дефисы");
  }

  if (!Number.isInteger(displayOrder) || displayOrder < 0) {
    throw new ValidationError("Порядок вывода должен быть неотрицательным целым числом");
  }

  if (!Number.isInteger(technologicalCardId) || technologicalCardId <= 0) {
    throw new ValidationError("Позиция каталога должна быть привязана к технологической карте");
  }

  return {
    name,
    slug,
    category: category || null,
    description: description || null,
    priceCents: Math.round(price * 100),
    isPublished,
    displayOrder,
    technologicalCardId,
  };
}
