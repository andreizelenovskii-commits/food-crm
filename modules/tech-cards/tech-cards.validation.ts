import { ValidationError } from "@/shared/errors/app-error";

function normalizeInput(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export type TechCardIngredientInput = {
  productId: number;
  quantity: number;
};

export type TechCardInput = {
  name: string;
  outputQuantity: number;
  outputUnit: "кг" | "шт";
  description: string | null;
  ingredients: TechCardIngredientInput[];
};

export function parseTechCardInput(formData: FormData): TechCardInput {
  const name = normalizeInput(formData.get("name"));
  const outputQuantity = Number(normalizeInput(formData.get("outputQuantity")));
  const outputUnit = normalizeInput(formData.get("outputUnit"));
  const description = normalizeInput(formData.get("description"));
  const productId = Number(normalizeInput(formData.get("ingredientProductId")));
  const quantity = Number(normalizeInput(formData.get("ingredientQuantity")));

  if (!name || !outputUnit || !Number.isFinite(outputQuantity) || outputQuantity <= 0) {
    throw new ValidationError("Заполните название, выход и единицу измерения техкарты");
  }

  if (outputUnit !== "кг" && outputUnit !== "шт") {
    throw new ValidationError("Единица выхода техкарты должна быть кг или шт");
  }

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new ValidationError("Выберите основной ингредиент для технологической карты");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new ValidationError("Количество ингредиента должно быть положительным числом");
  }

  return {
    name,
    outputQuantity: Math.round(outputQuantity),
    outputUnit,
    description: description || null,
    ingredients: [{ productId, quantity: Math.round(quantity) }],
  };
}
