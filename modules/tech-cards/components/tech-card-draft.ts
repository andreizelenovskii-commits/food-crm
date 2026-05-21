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

export type SelectedComponent = {
  techCardId: string;
  quantity: string;
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
