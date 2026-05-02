import type { CatalogFormValues } from "@/modules/catalog/catalog.form-types";
import type { CatalogItem } from "@/modules/catalog/catalog.types";
import { TECH_CARD_PIZZA_SIZES, type TechCardPizzaSize } from "@/modules/tech-cards/tech-cards.types";

export const EMPTY_CATALOG_FORM_VALUES: CatalogFormValues = {
  name: "",
  priceListType: "",
  category: "",
  description: "",
  imageUrl: "",
  price: "",
  technologicalCardId: "",
};

export const CATALOG_FIELD_CLASS_NAME =
  "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5";

export type CatalogTechCardOption = {
  id: number;
  name: string;
  category: string;
  pizzaSize: string | null;
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
