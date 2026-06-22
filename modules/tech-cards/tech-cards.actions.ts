"use client";

import { ValidationError } from "@/shared/errors/app-error";
import { clearTechCardDraft } from "@/modules/tech-cards/components/tech-card-draft";
import { parseTechCardInput } from "@/modules/tech-cards/tech-cards.validation";
import { browserBackendJson } from "@/shared/api/browser-backend";
import { navigateWithinWorkspace } from "@/modules/navigation/client-workspace-navigation";

export type TechCardFormState = {
  errorMessage: string | null;
  values: {
    name: string;
    category: string;
    pizzaSize: string;
    rollSize: string;
    autoCreatePizzaVariants: string;
    autoCreateRollVariants: string;
    outputQuantity: string;
    outputUnit: string;
    ingredients: Array<{
      productId: string;
      quantity: string;
      unit: string;
    }>;
    components: Array<{
      techCardId: string;
      quantity: string;
    }>;
    choiceSlots: Array<{
      name: string;
      category: string;
      allowedPizzaSizes: string;
      quantity: string;
    }>;
    description: string;
  };
};

const EMPTY_TECH_CARD_FORM_VALUES: TechCardFormState["values"] = {
  name: "",
  category: "",
  pizzaSize: "",
  rollSize: "",
  autoCreatePizzaVariants: "true",
  autoCreateRollVariants: "true",
  outputQuantity: "",
  outputUnit: "шт",
  ingredients: [],
  components: [],
  choiceSlots: [],
  description: "",
};

function getTechCardFormValues(formData: FormData) {
  const read = (name: string) => String(formData.get(name) ?? "").trim();
  const ingredientProductIds = formData.getAll("ingredientProductId");
  const ingredientQuantities = formData.getAll("ingredientQuantity");
  const ingredientUnits = formData.getAll("ingredientUnit");
  const componentTechCardIds = formData.getAll("componentTechCardId");
  const componentQuantities = formData.getAll("componentQuantity");
  const choiceSlotNames = formData.getAll("choiceSlotName");
  const choiceSlotCategories = formData.getAll("choiceSlotCategory");
  const choiceSlotAllowedPizzaSizes = formData.getAll("choiceSlotAllowedPizzaSizes");
  const choiceSlotQuantities = formData.getAll("choiceSlotQuantity");

  return {
    name: read("name"),
    category: read("category"),
    pizzaSize: read("pizzaSize"),
    rollSize: read("rollSize"),
    autoCreatePizzaVariants: read("autoCreatePizzaVariants") === "false" ? "false" : "true",
    autoCreateRollVariants: read("autoCreateRollVariants") === "false" ? "false" : "true",
    outputQuantity: read("outputQuantity"),
    outputUnit: read("outputUnit"),
    ingredients: ingredientProductIds.map((productId, index) => ({
      productId: String(productId ?? "").trim(),
      quantity: String(ingredientQuantities[index] ?? "").trim(),
      unit: String(ingredientUnits[index] ?? "").trim(),
    })),
    components: componentTechCardIds.map((techCardId, index) => ({
      techCardId: String(techCardId ?? "").trim(),
      quantity: String(componentQuantities[index] ?? "").trim(),
    })),
    choiceSlots: choiceSlotNames.map((slotName, index) => ({
      name: String(slotName ?? "").trim(),
      category: String(choiceSlotCategories[index] ?? "").trim(),
      allowedPizzaSizes: String(choiceSlotAllowedPizzaSizes[index] ?? "").trim(),
      quantity: String(choiceSlotQuantities[index] ?? "").trim(),
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

  clearTechCardDraft();
  navigateWithinWorkspace("/dashboard/inventory?tab=recipes&draft=cleared");
  return { errorMessage: null, values: EMPTY_TECH_CARD_FORM_VALUES };
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

  navigateWithinWorkspace("/dashboard/inventory?tab=recipes");
  return { errorMessage: null, values: getTechCardFormValues(formData) };
}

export async function deleteTechCardAction(formData: FormData): Promise<{ errorMessage: string | null }> {
  const techCardId = Number(String(formData.get("techCardId") ?? "").trim());

  if (!Number.isInteger(techCardId) || techCardId <= 0) {
    return { errorMessage: "Технологическая карта не найдена" };
  }

  try {
    await browserBackendJson(`/api/v1/tech-cards/${techCardId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Backend request failed: 404") {
        return { errorMessage: "Не удалось найти API удаления техкарты. Обнови страницу и попробуй ещё раз." };
      }

      return { errorMessage: error.message };
    }

    throw error;
  }

  navigateWithinWorkspace("/dashboard/inventory?tab=recipes");
  return { errorMessage: null };
}
