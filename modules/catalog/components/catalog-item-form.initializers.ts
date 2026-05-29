import type { CatalogFormState } from "@/modules/catalog/catalog.form-types";
import type { CatalogItemFormProps } from "@/modules/catalog/components/catalog-item-form.model";
import type { CatalogExcludedIngredientDraft } from "@/modules/catalog/components/catalog-excluded-ingredients-editor";
import type { CatalogVariantDraft } from "@/modules/catalog/components/catalog-variants-editor";

export function buildInitialExcludedIngredients(
  initialItem: CatalogItemFormProps["initialItem"],
  values: CatalogFormState["values"],
): CatalogExcludedIngredientDraft[] {
  if (initialItem?.excludedIngredients.length) {
    return initialItem.excludedIngredients.map((ingredient) => ({
      productId: String(ingredient.productId),
      label: ingredient.label,
    }));
  }

  try {
    const parsed = JSON.parse(values.excludedIngredients) as Array<{ productId: number | string; label: string }>;
    return parsed.map((ingredient) => ({
      productId: String(ingredient.productId),
      label: String(ingredient.label ?? ""),
    }));
  } catch {
    return [];
  }
}

export function buildInitialVariants(
  initialItem: CatalogItemFormProps["initialItem"],
  values: CatalogFormState["values"],
): CatalogVariantDraft[] {
  if (initialItem?.variants.length) {
    return initialItem.variants.map((variant) => ({
      technologicalCardId: String(variant.technologicalCardId),
      label: variant.label,
      price: String(variant.priceCents / 100),
      isDefault: variant.isDefault,
    }));
  }

  return [{
    technologicalCardId: values.technologicalCardId,
    label: "Стандарт",
    price: values.price,
    isDefault: true,
  }];
}
