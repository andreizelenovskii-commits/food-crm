"use client";

import { CATALOG_FIELD_CLASS_NAME } from "@/modules/catalog/components/catalog-item-form.model";
import { CatalogDropdown } from "@/modules/catalog/components/catalog-tech-card-fields";

export type CatalogVariantDraft = {
  technologicalCardId: string;
  label: string;
  price: string;
  isDefault: boolean;
};

export function CatalogVariantsEditor({
  variants,
  options,
  onChange,
}: {
  variants: CatalogVariantDraft[];
  options: Array<{ value: string; label: string }>;
  onChange: (variants: CatalogVariantDraft[]) => void;
}) {
  const updateVariant = (index: number, patch: Partial<CatalogVariantDraft>) => {
    onChange(variants.map((variant, currentIndex) => {
      if (currentIndex !== index) {
        return patch.isDefault ? { ...variant, isDefault: false } : variant;
      }

      return { ...variant, ...patch };
    }));
  };

  return (
    <div className="space-y-3 rounded-[22px] border border-red-950/10 bg-white/62 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-950">Варианты карточки</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Для пиццы добавь 24/26/30 см, для роллов 4/8 шт. Каждый вариант привязан к своей техкарте.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...variants, { technologicalCardId: "", label: "", price: "", isDefault: variants.length === 0 }])}
          className="foodlike-button-secondary min-h-9 px-4"
        >
          Добавить вариант
        </button>
      </div>

      <div className="space-y-3">
        {variants.map((variant, index) => (
          <VariantRow
            key={index}
            index={index}
            variant={variant}
            variants={variants}
            options={options}
            onChange={onChange}
            onUpdate={updateVariant}
          />
        ))}
      </div>
    </div>
  );
}

function VariantRow({
  index,
  variant,
  variants,
  options,
  onChange,
  onUpdate,
}: {
  index: number;
  variant: CatalogVariantDraft;
  variants: CatalogVariantDraft[];
  options: Array<{ value: string; label: string }>;
  onChange: (variants: CatalogVariantDraft[]) => void;
  onUpdate: (index: number, patch: Partial<CatalogVariantDraft>) => void;
}) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_auto] lg:items-end">
        <CatalogDropdown
          name={`variantTechCard-${index}`}
          label="Техкарта"
          placeholder="Выбери техкарту"
          value={variant.technologicalCardId}
          options={options}
          searchable
          onChange={(value) => onUpdate(index, { technologicalCardId: value })}
        />
        <label className="block space-y-2.5">
          <span className="text-sm font-medium text-zinc-700">Подпись</span>
          <input
            type="text"
            value={variant.label}
            onChange={(event) => onUpdate(index, { label: event.target.value })}
            placeholder="30 см"
            className={CATALOG_FIELD_CLASS_NAME}
          />
        </label>
        <label className="block space-y-2.5">
          <span className="text-sm font-medium text-zinc-700">Цена</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={variant.price}
            onChange={(event) => onUpdate(index, { price: event.target.value })}
            placeholder="0"
            className={CATALOG_FIELD_CLASS_NAME}
          />
        </label>
        <VariantActions
          index={index}
          variant={variant}
          variants={variants}
          onChange={onChange}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}

function VariantActions({
  index,
  variant,
  variants,
  onChange,
  onUpdate,
}: {
  index: number;
  variant: CatalogVariantDraft;
  variants: CatalogVariantDraft[];
  onChange: (variants: CatalogVariantDraft[]) => void;
  onUpdate: (index: number, patch: Partial<CatalogVariantDraft>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onUpdate(index, { isDefault: true })}
        className={`min-h-10 rounded-full px-3 text-xs font-semibold transition ${
          variant.isDefault ? "bg-red-800 text-white" : "border border-red-100 bg-white text-red-800"
        }`}
      >
        По умолчанию
      </button>
      <button
        type="button"
        onClick={() => {
          const next = variants.filter((_, currentIndex) => currentIndex !== index);
          onChange(next.length && !next.some((item) => item.isDefault)
            ? next.map((item, currentIndex) => ({ ...item, isDefault: currentIndex === 0 }))
            : next);
        }}
        disabled={variants.length <= 1}
        className="min-h-10 rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 disabled:cursor-not-allowed disabled:opacity-45"
      >
        Удалить
      </button>
    </div>
  );
}
