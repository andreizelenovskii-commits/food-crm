"use client";

import { useActionState, useMemo, useState } from "react";
import {
  addCatalogItemAction,
  updateCatalogItemAction,
  uploadCatalogImageAction,
} from "@/modules/catalog/catalog.actions";
import { CatalogItemImageField } from "@/modules/catalog/components/catalog-item-image-field";
import { CatalogPriceListPicker } from "@/modules/catalog/components/catalog-price-list-picker";
import { CatalogTechCardFields } from "@/modules/catalog/components/catalog-tech-card-fields";
import {
  CATALOG_FIELD_CLASS_NAME,
  type CatalogItemFormProps,
  EMPTY_CATALOG_FORM_VALUES,
  resolveInitialPizzaSize,
} from "@/modules/catalog/components/catalog-item-form.model";
import type { CatalogFormState } from "@/modules/catalog/catalog.form-types";
import type { CatalogPriceListType } from "@/modules/catalog/catalog.types";
import type { TechCardPizzaSize } from "@/modules/tech-cards/tech-cards.types";

export function CatalogItemForm({
  mode = "create",
  initialItem,
  initialValues,
  submitLabel,
  techCardOptions,
}: CatalogItemFormProps) {
  const action = mode === "edit" ? updateCatalogItemAction : addCatalogItemAction;
  const initialState: CatalogFormState = {
    errorMessage: null,
    values: initialValues ?? EMPTY_CATALOG_FORM_VALUES,
  };
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [selectedPriceListType, setSelectedPriceListType] = useState<CatalogPriceListType | "">(
    initialState.values.priceListType === "CLIENT" || initialState.values.priceListType === "INTERNAL"
      ? initialState.values.priceListType
      : "",
  );
  const [selectedCategory, setSelectedCategory] = useState(initialState.values.category);
  const [selectedTechCardId, setSelectedTechCardId] = useState(
    initialState.values.technologicalCardId,
  );
  const [imageUrl, setImageUrl] = useState(initialState.values.imageUrl);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const selectedTechCard =
    techCardOptions.find((option) => String(option.id) === selectedTechCardId) ?? null;
  const [selectedPizzaSize, setSelectedPizzaSize] = useState<TechCardPizzaSize | "">(
    resolveInitialPizzaSize(selectedTechCard?.pizzaSize),
  );

  const sortedTechCardOptions = useMemo(
    () =>
      [...techCardOptions].sort(
        (left, right) =>
          left.category.localeCompare(right.category, "ru") ||
          left.name.localeCompare(right.name, "ru"),
      ),
    [techCardOptions],
  );
  const filteredTechCardOptions = useMemo(() => {
    return sortedTechCardOptions.filter((option) => {
      if (selectedCategory && option.category !== selectedCategory) {
        return false;
      }

      if (selectedCategory === "Пиццы" && selectedPizzaSize) {
        return option.pizzaSize === selectedPizzaSize;
      }

      return true;
    });
  }, [selectedCategory, selectedPizzaSize, sortedTechCardOptions]);
  const uploadImage = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setImageUploadError(null);
    setIsImageUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const upload = await uploadCatalogImageAction(formData);
      setImageUrl(upload.imageUrl);
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : "Не удалось загрузить фото");
    } finally {
      setIsImageUploading(false);
    }
  };

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5"
    >
      {initialItem ? <input type="hidden" name="catalogItemId" value={initialItem.id} /> : null}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-950">
          {mode === "edit" ? "Редактировать позицию каталога" : "Новая позиция каталога"}
        </h2>
        <p className="text-sm leading-6 text-zinc-600">
          {mode === "edit"
            ? "Обнови прайс, категорию, цену и привязку к технологической карте."
            : "Добавь позицию в нужный прайс и сразу привяжи её к технологической карте."}
        </p>
      </div>

      <label className="block space-y-2.5">
        <span className="text-sm font-medium text-zinc-700">Название</span>
        <input
          name="name"
          type="text"
          defaultValue={state.values.name}
          placeholder="Например: Пицца Маргарита"
          className={CATALOG_FIELD_CLASS_NAME}
          required
        />
      </label>

      <CatalogItemImageField
        imageUrl={imageUrl}
        imageUploadError={imageUploadError}
        isImageUploading={isImageUploading}
        onImageUrlChange={setImageUrl}
        onUploadImage={(file) => {
          void uploadImage(file);
        }}
      />

      <CatalogPriceListPicker
        selectedPriceListType={selectedPriceListType}
        onChange={setSelectedPriceListType}
      />

      <CatalogTechCardFields
        priceDefaultValue={state.values.price}
        selectedCategory={selectedCategory}
        selectedPizzaSize={selectedPizzaSize}
        selectedTechCardId={selectedTechCardId}
        techCardOptions={techCardOptions}
        filteredTechCardOptions={filteredTechCardOptions}
        onCategoryChange={setSelectedCategory}
        onPizzaSizeChange={setSelectedPizzaSize}
        onTechCardIdChange={setSelectedTechCardId}
      />

      <label className="block space-y-2.5">
        <span className="text-sm font-medium text-zinc-700">Описание</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={state.values.description}
          placeholder="Короткое описание позиции для сайта"
          className={`${CATALOG_FIELD_CLASS_NAME} min-h-[9rem] resize-y`}
        />
      </label>

      {state.errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || isImageUploading}
        className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
      >
        {isImageUploading
          ? "Загружаем фото..."
          : isPending
            ? "Сохраняем..."
            : (submitLabel ?? (mode === "edit" ? "Сохранить изменения" : "Добавить в каталог"))}
      </button>
    </form>
  );
}
