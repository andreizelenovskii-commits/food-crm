import type { CatalogFormValues } from "@/modules/catalog/catalog.form-types";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { TECH_CARD_PIZZA_SIZES, type TechCardPizzaSize } from "@/modules/tech-cards/tech-cards.types";

export const EMPTY_CATALOG_FORM_VALUES: CatalogFormValues = {
  name: "",
  priceListType: "",
  category: "",
  kitchenZone: "",
  kitchenZones: "[]",
  description: "",
  imageUrl: "",
  price: "",
  technologicalCardId: "",
  variants: "[]",
  excludedIngredients: "[]",
};

export const CATALOG_FIELD_CLASS_NAME =
  "foodlike-field";

export type CatalogTechCardOption = {
  id: number;
  name: string;
  category: string;
  pizzaSize: string | null;
  rollSize: string | null;
  ingredients: Array<{
    productId: number;
    productName: string;
    productUnit: string;
  }>;
};

export type CatalogItemFormProps = {
  mode?: "create" | "edit";
  initialItem?: CatalogItem;
  initialValues?: CatalogFormValues;
  submitLabel?: string;
  techCardOptions: CatalogTechCardOption[];
};

export function resolveInitialPizzaSize(pizzaSize: string | null | undefined) {
  return pizzaSize && TECH_CARD_PIZZA_SIZES.includes(pizzaSize as TechCardPizzaSize)
    ? (pizzaSize as TechCardPizzaSize)
    : "";
}
