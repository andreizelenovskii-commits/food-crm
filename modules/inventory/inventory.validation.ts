import { ValidationError } from "@/shared/errors/app-error";

function normalizeInput(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export type ProductInput = {
  name: string;
  sku: string;
  unit: "кг" | "шт";
  stockQuantity: number;
  priceCents: number;
  description: string | null;
};

function parsePriceToCents(value: string) {
  const normalized = value.replace(",", ".");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new ValidationError("Цена должна быть неотрицательным числом");
  }

  return Math.round(amount * 100);
}

export function parseProductInput(formData: FormData): ProductInput {
  const name = normalizeInput(formData.get("name"));
  const sku = normalizeInput(formData.get("sku"));
  const unit = normalizeInput(formData.get("unit"));
  const stockQuantityRaw = normalizeInput(formData.get("stockQuantity"));
  const priceRaw = normalizeInput(formData.get("price"));
  const description = normalizeInput(formData.get("description"));

  if (!name || !sku || !unit || !priceRaw) {
    throw new ValidationError("Заполните название, внутренний код, единицу измерения и цену");
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
    sku,
    unit,
    stockQuantity,
    priceCents: parsePriceToCents(priceRaw),
    description: description || null,
  };
}
