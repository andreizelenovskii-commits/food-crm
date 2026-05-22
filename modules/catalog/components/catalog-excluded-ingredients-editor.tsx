"use client";

import { CATALOG_FIELD_CLASS_NAME, type CatalogTechCardOption } from "@/modules/catalog/components/catalog-item-form.model";
import type { CatalogVariantDraft } from "@/modules/catalog/components/catalog-variants-editor";

export type CatalogExcludedIngredientDraft = {
  productId: string;
  label: string;
};

export function CatalogExcludedIngredientsEditor({
  exclusions,
  techCardOptions,
  variants,
  onChange,
}: {
  exclusions: CatalogExcludedIngredientDraft[];
  techCardOptions: CatalogTechCardOption[];
  variants: CatalogVariantDraft[];
  onChange: (exclusions: CatalogExcludedIngredientDraft[]) => void;
}) {
  const ingredientOptions = buildIngredientOptions(techCardOptions, variants);
  const availableOptions = ingredientOptions.filter(
    (option) => !exclusions.some((exclusion) => exclusion.productId === String(option.productId)),
  );

  const addIngredient = (productId: string) => {
    const option = ingredientOptions.find((ingredient) => String(ingredient.productId) === productId);

    if (!option) {
      return;
    }

    onChange([...exclusions, { productId, label: option.productName }]);
  };

  return (
    <div className="space-y-3 rounded-[22px] border border-red-950/10 bg-white/62 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-950">Исключить ингредиенты</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Покажи на сайте, что можно убрать из блюда. Списание склада пропустит выбранный гостем ингредиент.
          </p>
        </div>
        <select
          value=""
          onChange={(event) => addIngredient(event.target.value)}
          className="foodlike-field min-h-10 w-full max-w-xs"
          disabled={!availableOptions.length}
        >
          <option value="">{availableOptions.length ? "Добавить ингредиент" : "Нет доступных ингредиентов"}</option>
          {availableOptions.map((ingredient) => (
            <option key={ingredient.productId} value={ingredient.productId}>
              {ingredient.productName}
            </option>
          ))}
        </select>
      </div>

      {exclusions.length ? (
        <div className="space-y-2">
          {exclusions.map((exclusion, index) => {
            const option = ingredientOptions.find((ingredient) => String(ingredient.productId) === exclusion.productId);

            return (
              <div key={exclusion.productId} className="grid gap-3 rounded-[18px] border border-red-950/10 bg-white/78 p-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto] md:items-end">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Ингредиент из техкарты</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-950">{option?.productName ?? "Ингредиент"}</p>
                </div>
                <label className="block space-y-2.5">
                  <span className="text-sm font-medium text-zinc-700">Подпись на сайте</span>
                  <input
                    type="text"
                    value={exclusion.label}
                    onChange={(event) => onChange(exclusions.map((item, currentIndex) =>
                      currentIndex === index ? { ...item, label: event.target.value } : item,
                    ))}
                    placeholder="Например: сыр"
                    className={CATALOG_FIELD_CLASS_NAME}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onChange(exclusions.filter((_, currentIndex) => currentIndex !== index))}
                  className="min-h-10 rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                >
                  Удалить
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-[16px] border border-dashed border-red-100 bg-white/70 p-4 text-sm text-zinc-500">
          Добавь ингредиенты, которые клиент сможет убрать в карточке товара.
        </p>
      )}
    </div>
  );
}

function buildIngredientOptions(
  techCardOptions: CatalogTechCardOption[],
  variants: CatalogVariantDraft[],
) {
  const selectedTechCardIds = new Set(
    variants
      .map((variant) => Number(variant.technologicalCardId))
      .filter((id) => Number.isInteger(id) && id > 0),
  );
  const ingredientsByProductId = new Map<number, { productId: number; productName: string; productUnit: string }>();

  for (const option of techCardOptions) {
    if (!selectedTechCardIds.has(option.id)) {
      continue;
    }

    for (const ingredient of option.ingredients) {
      ingredientsByProductId.set(ingredient.productId, ingredient);
    }
  }

  return Array.from(ingredientsByProductId.values()).sort((left, right) =>
    left.productName.localeCompare(right.productName, "ru"),
  );
}
