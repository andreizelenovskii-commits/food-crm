"use client";

import { useActionState, useMemo, useState } from "react";
import {
  addCatalogItemAction,
  updateCatalogItemAction,
  uploadCatalogImageAction,
} from "@/modules/catalog/catalog.actions";
import { CatalogItemImageField } from "@/modules/catalog/components/catalog-item-image-field";
import {
  CatalogExcludedIngredientsEditor,
  type CatalogExcludedIngredientDraft,
} from "@/modules/catalog/components/catalog-excluded-ingredients-editor";
import {
  buildInitialExcludedIngredients,
  buildInitialVariants,
} from "@/modules/catalog/components/catalog-item-form.initializers";
import { CatalogPriceListPicker } from "@/modules/catalog/components/catalog-price-list-picker";
import { CatalogDropdown } from "@/modules/catalog/components/catalog-tech-card-fields";
import {
  ComboKitchenZonePicker,
  parseInitialKitchenZones,
  resolveKitchenZoneByCategory,
} from "@/modules/catalog/components/catalog-combo-kitchen-zone-picker";
import {
  CatalogVariantsEditor,
  type CatalogVariantDraft,
} from "@/modules/catalog/components/catalog-variants-editor";
import {
  CATALOG_FIELD_CLASS_NAME,
  type CatalogItemFormProps,
  EMPTY_CATALOG_FORM_VALUES,
} from "@/modules/catalog/components/catalog-item-form.model";
import type { CatalogFormState } from "@/modules/catalog/catalog.form-types";
import { CATALOG_SITE_CATEGORIES, type CatalogPriceListType } from "@/modules/catalog/catalog.types";
import { KITCHEN_ZONE_LABELS, KITCHEN_ZONES, type KitchenZone } from "@/modules/inventory/inventory.types";

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
  const initialKitchenZones = parseInitialKitchenZones(initialItem, initialState.values);
  const [selectedKitchenZone, setSelectedKitchenZone] = useState<KitchenZone | "">(
    (initialState.values.kitchenZone as KitchenZone | "") || initialKitchenZones[0] || "",
  );
  const [selectedKitchenZones, setSelectedKitchenZones] = useState<KitchenZone[]>(initialKitchenZones);
  const [variants, setVariants] = useState<CatalogVariantDraft[]>(() => buildInitialVariants(initialItem, initialState.values));
  const [excludedIngredients, setExcludedIngredients] = useState<CatalogExcludedIngredientDraft[]>(() =>
    buildInitialExcludedIngredients(initialItem, initialState.values),
  );
  const [imageUrl, setImageUrl] = useState(initialState.values.imageUrl);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
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
    return sortedTechCardOptions;
  }, [sortedTechCardOptions]);
  const techCardDropdownOptions = filteredTechCardOptions.map((option) => ({
    value: String(option.id),
    label: [
      option.name,
      option.category,
      option.pizzaSize,
      option.rollSize,
    ].filter(Boolean).join(" - "),
  }));
  const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];
  const categoryOptions = CATALOG_SITE_CATEGORIES.map((category) => ({ value: category, label: category }));
  const isComboCategory = selectedCategory === "Комбо";
  const kitchenZoneOptions = KITCHEN_ZONES.map((zone) => ({
    value: zone,
    label: KITCHEN_ZONE_LABELS[zone],
  }));
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

  function setCategory(value: string) {
    const resolvedKitchenZone = resolveKitchenZoneByCategory(value);

    setSelectedCategory(value);

    if (value === "Комбо") {
      const currentZones = selectedKitchenZones.length
        ? selectedKitchenZones
        : resolvedKitchenZone
          ? [resolvedKitchenZone]
          : [];
      setSelectedKitchenZones(currentZones);
      setSelectedKitchenZone(currentZones[0] ?? "");
      return;
    }

    setSelectedKitchenZone(resolvedKitchenZone);
    setSelectedKitchenZones(resolvedKitchenZone ? [resolvedKitchenZone] : []);
  }

  function setSingleKitchenZone(value: KitchenZone | "") {
    setSelectedKitchenZone(value);
    setSelectedKitchenZones(value ? [value] : []);
  }

  function toggleComboKitchenZone(zone: KitchenZone) {
    setSelectedKitchenZones((current) => {
      const next = current.includes(zone)
        ? current.filter((currentZone) => currentZone !== zone)
        : [...current, zone];

      setSelectedKitchenZone(next[0] ?? "");
      return next;
    });
  }

  return (
    <form
      action={formAction}
      className="foodlike-panel space-y-5 p-4 sm:p-5"
    >
      {initialItem ? <input type="hidden" name="catalogItemId" value={initialItem.id} /> : null}
      <div className="space-y-3">
        <p className="foodlike-kicker">Каталог</p>
        <h2 className="foodlike-title-sm">
          {mode === "edit" ? "Редактировать позицию каталога" : "Новая позиция каталога"}
        </h2>
        <p className="text-sm leading-6 text-zinc-600">
          {mode === "edit"
            ? "Обнови прайс, категорию, кухонную зону и варианты карточки."
            : "Добавь одну карточку и привяжи к ней варианты: размеры пиццы или роллы 8/4."}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <CatalogDropdown
          name="category"
          label="Категория на сайте"
          placeholder="Выбери категорию сайта"
          value={selectedCategory}
          options={categoryOptions}
          onChange={setCategory}
        />
        {isComboCategory ? (
          <ComboKitchenZonePicker
            selectedZones={selectedKitchenZones}
            onToggle={toggleComboKitchenZone}
          />
        ) : (
          <CatalogDropdown
            name="kitchenZone"
            label="Кухонная зона"
            placeholder="Выбери зону"
            value={selectedKitchenZone}
            options={kitchenZoneOptions}
            onChange={(value) => setSingleKitchenZone(value as KitchenZone | "")}
          />
        )}
      </div>

      {isComboCategory ? <input type="hidden" name="kitchenZone" value={selectedKitchenZone} /> : null}
      <input type="hidden" name="kitchenZones" value={JSON.stringify(selectedKitchenZones)} />
      <input type="hidden" name="technologicalCardId" value={defaultVariant?.technologicalCardId ?? ""} />
      <input type="hidden" name="price" value={defaultVariant?.price ?? ""} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="excludedIngredients" value={JSON.stringify(excludedIngredients)} />

      <CatalogVariantsEditor
        variants={variants}
        options={techCardDropdownOptions}
        onChange={setVariants}
      />

      <CatalogExcludedIngredientsEditor
        exclusions={excludedIngredients}
        techCardOptions={techCardOptions}
        variants={variants}
        onChange={setExcludedIngredients}
      />

      <label className="block space-y-2.5">
        <span className="text-sm font-medium text-zinc-700">Описание</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={state.values.description}
          placeholder="Короткое описание позиции для сайта"
          className={`${CATALOG_FIELD_CLASS_NAME} foodlike-textarea resize-y`}
        />
      </label>

      {state.errorMessage ? (
        <p className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || isImageUploading}
        className="foodlike-button-primary w-full"
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
