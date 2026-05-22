import { PRODUCT_CATEGORIES } from "@/modules/inventory/inventory.types";
import type {
  SelectedChoiceSlot,
  SelectedComponent,
  SelectedIngredient,
} from "@/modules/tech-cards/components/tech-card-draft";
import {
  TECH_CARD_CATEGORIES,
  TECH_CARD_PIZZA_SIZES,
  type TechCardCategory,
  type TechCardItem,
  type TechCardProductOption,
  type TechCardPizzaSize,
} from "@/modules/tech-cards/tech-cards.types";

export function normalizeStateIngredients(
  ingredients: Array<{ productId: string; quantity: string; unit: string }>,
): SelectedIngredient[] {
  return ingredients.map((ingredient) => ({
    productId: ingredient.productId,
    quantity: ingredient.quantity,
    unit: ingredient.unit === "кг" ? "кг" : "шт",
  }));
}

export function normalizeStateComponents(
  components: Array<{ techCardId: string; quantity: string }>,
): SelectedComponent[] {
  return components.map((component) => ({
    techCardId: component.techCardId,
    quantity: component.quantity,
  }));
}

export function normalizeStateChoiceSlots(
  slots: Array<{
    name: string;
    category: string;
    allowedPizzaSizes: string;
    quantity: string;
  }>,
): SelectedChoiceSlot[] {
  return slots.map((slot, index) => ({
    id: `${index}-${slot.name}`,
    name: slot.name,
    category: TECH_CARD_CATEGORIES.includes(slot.category as TechCardCategory)
      ? slot.category
      : "Пиццы",
    allowedPizzaSizes: slot.allowedPizzaSizes
      .split(",")
      .map((size) => size.trim())
      .filter((size) => TECH_CARD_PIZZA_SIZES.includes(size as TechCardPizzaSize)),
    quantity: slot.quantity,
  }));
}

export function getAvailableProductCategories(products: TechCardProductOption[]) {
  const categorySet = new Set(
    products.map((product) => product.category).filter((category): category is string => Boolean(category)),
  );

  return PRODUCT_CATEGORIES.filter((category) => categorySet.has(category));
}

export function filterProducts(
  products: TechCardProductOption[],
  queryValue: string,
  selectedCategory: string,
) {
  const query = queryValue.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!query) {
      return true;
    }

    return product.name.toLowerCase().includes(query) || product.unit.toLowerCase().includes(query) || product.category?.toLowerCase().includes(query);
  });
}

export function filterComponents(
  componentOptions: TechCardItem[],
  queryValue: string,
  selectedComponentCategory: string,
) {
  const query = queryValue.trim().toLowerCase();

  return componentOptions.filter((component) => {
    const matchesCategory = !selectedComponentCategory || component.category === selectedComponentCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      component.name,
      component.category,
      component.pizzaSize ?? "",
      component.rollSize ?? "",
      component.outputUnit,
      component.description ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}
