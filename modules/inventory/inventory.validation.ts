import { ValidationError } from "@/shared/errors/app-error";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/modules/inventory/inventory.types";

function normalizeInput(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export type ProductInput = {
  name: string;
  category: ProductCategory;
  unit: "кг" | "шт";
  stockQuantity: number;
  priceCents: number;
  description: string | null;
};

export type InventoryAuditEntryInput = {
  productId: number;
  actualQuantity: number;
};

export type CreateInventorySessionInput = {
  responsibleEmployeeId: number;
  notes: string | null;
  productIds: number[];
};

function parsePriceToCents(value: string) {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(",", ".");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new ValidationError("Цена должна быть неотрицательным числом");
  }

  return Math.round(amount * 100);
}

export function parseProductInput(formData: FormData): ProductInput {
  const name = normalizeInput(formData.get("name"));
  const category = normalizeInput(formData.get("category"));
  const unit = normalizeInput(formData.get("unit"));
  const stockQuantityRaw = normalizeInput(formData.get("stockQuantity"));
  const priceRaw = normalizeInput(formData.get("price"));
  const description = normalizeInput(formData.get("description"));

  if (!name || !category || !unit) {
    throw new ValidationError("Заполните название, категорию и единицу измерения");
  }

  if (!PRODUCT_CATEGORIES.includes(category as ProductCategory)) {
    throw new ValidationError("Выберите категорию товара из списка");
  }

  if (unit !== "кг" && unit !== "шт") {
    throw new ValidationError("Выберите единицу измерения: кг или шт");
  }

  const stockQuantity = Number(stockQuantityRaw || "0");

  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new ValidationError("Остаток должен быть неотрицательным целым числом");
  }

  return {
    name,
    category: category as ProductCategory,
    unit,
    stockQuantity,
    priceCents: parsePriceToCents(priceRaw),
    description: description || null,
  };
}

export function parseInventoryAuditInput(formData: FormData): InventoryAuditEntryInput[] {
  const productIds = formData
    .getAll("productId")
    .map((value) => Number(String(value ?? "").trim()));
  const actualQuantities = formData
    .getAll("actualQuantity")
    .map((value) => String(value ?? "").trim());

  if (productIds.length === 0 || actualQuantities.length === 0 || productIds.length !== actualQuantities.length) {
    throw new ValidationError("Не удалось прочитать данные инвентаризации");
  }

  const uniqueProductIds = new Set<number>();
  const entries = productIds.flatMap((productId, index) => {
    const actualQuantityRaw = actualQuantities[index];

    if (!actualQuantityRaw) {
      return [];
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      throw new ValidationError("В списке инвентаризации найден некорректный товар");
    }

    if (uniqueProductIds.has(productId)) {
      throw new ValidationError("Один и тот же товар нельзя добавить в инвентаризацию дважды");
    }

    const actualQuantity = Number(actualQuantityRaw.replace(",", "."));

    if (!Number.isInteger(actualQuantity) || actualQuantity < 0) {
      throw new ValidationError("Фактический остаток должен быть неотрицательным целым числом");
    }

    uniqueProductIds.add(productId);

    return [{ productId, actualQuantity }];
  });

  if (entries.length === 0) {
    throw new ValidationError("Укажи фактический остаток хотя бы для одной позиции");
  }

  return entries;
}

export function parseCreateInventorySessionInput(formData: FormData): CreateInventorySessionInput {
  const responsibleEmployeeId = Number(normalizeInput(formData.get("responsibleEmployeeId")));
  const notes = normalizeInput(formData.get("notes"));
  const productIds = formData
    .getAll("productId")
    .map((value) => Number(String(value ?? "").trim()))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!Number.isInteger(responsibleEmployeeId) || responsibleEmployeeId <= 0) {
    throw new ValidationError("Выбери ответственного за инвентаризацию");
  }

  if (productIds.length === 0) {
    throw new ValidationError("Добавь хотя бы один товар в лист инвентаризации");
  }

  const uniqueProductIds = new Set<number>();

  for (const productId of productIds) {
    if (uniqueProductIds.has(productId)) {
      throw new ValidationError("Один и тот же товар нельзя добавить в лист дважды");
    }

    uniqueProductIds.add(productId);
  }

  return {
    responsibleEmployeeId,
    notes: notes || null,
    productIds,
  };
}
