"use client";

import { ValidationError } from "@/shared/errors/app-error";
import { parseTechCardInput } from "@/modules/tech-cards/tech-cards.validation";
import { browserBackendJson } from "@/shared/api/browser-backend";

export type TechCardFormState = {
  errorMessage: string | null;
  values: {
    name: string;
    category: string;
    pizzaSize: string;
    outputQuantity: string;
    outputUnit: string;
    ingredients: Array<{
      productId: string;
      quantity: string;
      unit: string;
    }>;
    description: string;
  };
};

function getTechCardFormValues(formData: FormData) {
  const read = (name: string) => String(formData.get(name) ?? "").trim();
  const ingredientProductIds = formData.getAll("ingredientProductId");
  const ingredientQuantities = formData.getAll("ingredientQuantity");
  const ingredientUnits = formData.getAll("ingredientUnit");

  return {
    name: read("name"),
    category: read("category"),
    pizzaSize: read("pizzaSize"),
    outputQuantity: read("outputQuantity"),
    outputUnit: read("outputUnit"),
    ingredients: ingredientProductIds.map((productId, index) => ({
      productId: String(productId ?? "").trim(),
      quantity: String(ingredientQuantities[index] ?? "").trim(),
      unit: String(ingredientUnits[index] ?? "").trim(),
    })),
    description: read("description"),
  };
}

export async function addTechCardAction(
  _previousState: TechCardFormState,
  formData: FormData,
): Promise<TechCardFormState> {
  try {
    const input = parseTechCardInput(formData);
    await browserBackendJson("/api/v1/tech-cards", {
      body: input,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        values: getTechCardFormValues(formData),
      };
    }

    throw error;
  }

  window.location.assign("/dashboard/inventory?tab=recipes&draft=cleared");
  return { errorMessage: null, values: getTechCardFormValues(formData) };
}

export async function updateTechCardAction(
  _previousState: TechCardFormState,
  formData: FormData,
): Promise<TechCardFormState> {
  const techCardId = Number(String(formData.get("techCardId") ?? "").trim());

  if (!Number.isInteger(techCardId) || techCardId <= 0) {
    return {
      errorMessage: "Технологическая карта не найдена",
      values: getTechCardFormValues(formData),
    };
  }

  try {
    const input = parseTechCardInput(formData);
    await browserBackendJson(`/api/v1/tech-cards/${techCardId}`, {
      method: "PATCH",
      body: input,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        values: getTechCardFormValues(formData),
      };
    }

    throw error;
  }

  window.location.assign("/dashboard/inventory?tab=recipes");
  return { errorMessage: null, values: getTechCardFormValues(formData) };
}
