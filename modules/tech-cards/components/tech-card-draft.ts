import {
  TECH_CARD_CATEGORIES,
  TECH_CARD_PIZZA_SIZES,
  type TechCardCategory,
  type TechCardPizzaSize,
} from "@/modules/tech-cards/tech-cards.types";
import type { OutputUnit } from "@/modules/tech-cards/components/tech-card-main-fields";

const LEGACY_TECH_CARD_INGREDIENTS_DRAFT_KEY = "food-crm:tech-card-form:ingredients";
const LEGACY_TECH_CARD_FORM_DRAFT_KEY = "food-crm:tech-card-form:draft";

export const TECH_CARD_INGREDIENTS_DRAFT_KEY = "food-crm:tech-card-form:v2:ingredients";
export const TECH_CARD_FORM_DRAFT_KEY = "food-crm:tech-card-form:v2:draft";

export type SelectedIngredient = {
  productId: string;
  quantity: string;
  unit: OutputUnit;
};

export type TechCardDraft = {
  name: string;
  category: TechCardCategory | "";
  pizzaSize: TechCardPizzaSize | "";
  autoCreatePizzaVariants: boolean;
  outputQuantity: string;
  outputUnit: OutputUnit;
  description: string;
};

export function clearTechCardDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TECH_CARD_INGREDIENTS_DRAFT_KEY);
  window.localStorage.removeItem(TECH_CARD_FORM_DRAFT_KEY);
  window.localStorage.removeItem(LEGACY_TECH_CARD_INGREDIENTS_DRAFT_KEY);
  window.localStorage.removeItem(LEGACY_TECH_CARD_FORM_DRAFT_KEY);
}

export function readTechCardIngredientsDraft() {
  if (typeof window === "undefined") {
    return [] as SelectedIngredient[];
  }

  const rawValue = window.localStorage.getItem(TECH_CARD_INGREDIENTS_DRAFT_KEY);

  if (!rawValue) {
    return [] as SelectedIngredient[];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [] as SelectedIngredient[];
    }

    return parsedValue
      .filter(
        (ingredient): ingredient is SelectedIngredient =>
          typeof ingredient === "object" &&
          ingredient !== null &&
          typeof ingredient.productId === "string" &&
          typeof ingredient.quantity === "string" &&
          (ingredient.unit === "кг" || ingredient.unit === "шт"),
      )
      .map((ingredient) => ({
        productId: ingredient.productId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }));
  } catch {
    return [] as SelectedIngredient[];
  }
}

export function readTechCardFormDraft(): TechCardDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(TECH_CARD_FORM_DRAFT_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (typeof parsedValue !== "object" || parsedValue === null) {
      return null;
    }

    return {
      name: typeof parsedValue.name === "string" ? parsedValue.name : "",
      category: TECH_CARD_CATEGORIES.includes(parsedValue.category as TechCardCategory)
        ? (parsedValue.category as TechCardCategory)
        : "",
      pizzaSize: TECH_CARD_PIZZA_SIZES.includes(parsedValue.pizzaSize as TechCardPizzaSize)
        ? (parsedValue.pizzaSize as TechCardPizzaSize)
        : "",
      autoCreatePizzaVariants: parsedValue.autoCreatePizzaVariants !== false,
      outputQuantity:
        typeof parsedValue.outputQuantity === "string" ? parsedValue.outputQuantity : "",
      outputUnit: parsedValue.outputUnit === "кг" ? "кг" : "шт",
      description: typeof parsedValue.description === "string" ? parsedValue.description : "",
    };
  } catch {
    return null;
  }
}
