"use client";

import { useState } from "react";
import type { CatalogChoiceSlot, CatalogItem, CatalogItemVariant } from "@/modules/catalog/catalog.types";
import {
  choiceKey,
  getChoiceSlotSelectionCount,
  type PublicMenuChoiceSelection,
} from "@/modules/catalog/components/public-menu-choice-utils";
import { ProductChoiceSlotPicker } from "@/modules/catalog/components/public-menu-choice-slot-picker";
import { PublicCatalogImage } from "@/modules/catalog/components/public-catalog-image";
import {
  describePublicMenuItem,
  formatPublicMenuMoney,
  resolvePublicMenuVariant,
} from "@/modules/catalog/components/public-menu-utils";

export function PublicMenuProductModal({
  item,
  onAdd,
  onClose,
}: {
  item: CatalogItem;
  onAdd: (
    item: CatalogItem,
    variant: CatalogItemVariant,
    quantity: number,
    excludedIngredientIds: number[],
    choices: PublicMenuChoiceSelection[],
  ) => void;
  onClose: () => void;
}) {
  const initialVariant = resolvePublicMenuVariant(item);
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant.id);
  const [quantity, setQuantity] = useState(1);
  const [excludedIngredientIds, setExcludedIngredientIds] = useState<number[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const selectedVariant = resolvePublicMenuVariant(item, selectedVariantId);
  const choices = buildChoiceSelections(item.choiceSlots, selectedChoices);
  const isChoiceComplete = areChoiceSlotsComplete(item.choiceSlots, selectedChoices);
  const isSet = isSetCategory(item.category);

  const toggleExcludedIngredient = (id: number) => {
    setExcludedIngredientIds((current) =>
      current.includes(id) ? current.filter((ingredientId) => ingredientId !== id) : [...current, id],
    );
  };

  const setChoice = (choiceSlotId: number, position: number, selectedCatalogItemId: number) => {
    setSelectedChoices((current) => ({
      ...current,
      [choiceKey(choiceSlotId, position)]: selectedCatalogItemId,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 px-4 py-5 backdrop-blur-sm" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        className={`grid max-h-[calc(100vh-2rem)] w-full overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(80,8,16,0.24)] ${
          isSet ? "max-w-7xl md:grid-cols-[1.25fr_0.75fr]" : "max-w-6xl md:grid-cols-[0.9fr_1.1fr]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <ProductModalImage item={item} />
        <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
          <ProductModalHeader item={item} onClose={onClose} />
          <ProductModalControls
            isAddDisabled={!isChoiceComplete}
            quantity={quantity}
            selectedVariant={selectedVariant}
            setQuantity={setQuantity}
            onAdd={() => onAdd(item, selectedVariant, quantity, excludedIngredientIds, choices)}
          />
          <ProductVariantPicker
            item={item}
            selectedVariant={selectedVariant}
            onSelect={setSelectedVariantId}
          />
          <ProductChoiceSlotPicker
            item={item}
            selectedChoices={selectedChoices}
            onChoiceChange={setChoice}
          />
          <ExcludedIngredientPicker
            excludedIngredientIds={excludedIngredientIds}
            item={item}
            onToggle={toggleExcludedIngredient}
          />
        </div>
      </section>
    </div>
  );
}

function buildChoiceSelections(
  slots: CatalogChoiceSlot[],
  selectedChoices: Record<string, number>,
): PublicMenuChoiceSelection[] {
  return slots.flatMap((slot) =>
    Array.from({ length: getChoiceSlotSelectionCount(slot.quantity) }, (_, index) => ({
      choiceSlotId: slot.id,
      position: index,
      selectedCatalogItemId: selectedChoices[choiceKey(slot.id, index)],
      selectedCatalogItemVariantId: slot.options.find(
        (option) => option.catalogItemId === selectedChoices[choiceKey(slot.id, index)],
      )?.catalogItemVariantId ?? undefined,
    })).filter((choice) => Number.isInteger(choice.selectedCatalogItemId) && choice.selectedCatalogItemId > 0),
  );
}

function areChoiceSlotsComplete(slots: CatalogChoiceSlot[], selectedChoices: Record<string, number>) {
  return slots.every((slot) =>
    Array.from({ length: getChoiceSlotSelectionCount(slot.quantity) }, (_, index) =>
      Number.isInteger(selectedChoices[choiceKey(slot.id, index)]),
    ).every(Boolean),
  );
}

function isSetCategory(category: string | null) {
  return category === "Сеты";
}

function ProductModalImage({ item }: { item: CatalogItem }) {
  const isSet = isSetCategory(item.category);

  return (
    <div className={`flex items-center justify-center bg-[#faf6f2] ${isSet ? "min-h-[420px] p-3 sm:p-4" : "min-h-[300px] p-4 sm:p-7"}`}>
      <div className={`w-full border border-[#eadfd8] bg-[#fffdfb] shadow-[0_24px_70px_rgba(43,24,19,0.12)] ${isSet ? "max-w-[820px] rounded-[24px] p-2" : "max-w-[590px] rounded-[30px] p-3"}`}>
        <div className={`overflow-hidden bg-[#f4eee9] ${isSet ? "rounded-[18px]" : "rounded-[22px]"}`}>
          <PublicCatalogImage item={item} className="aspect-[3/2] w-full" />
        </div>
      </div>
    </div>
  );
}

function ProductModalHeader({ item, onClose }: { item: CatalogItem; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d50014]">{item.category ?? "Меню"}</p>
        <h3 className="mt-2 text-3xl font-semibold leading-tight text-[#241316]">{item.name}</h3>
        <p className="mt-2 text-sm leading-6 text-[#6b5960]">{describePublicMenuItem(item)}</p>
      </div>
      <button type="button" onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#f0d9dc] text-xl font-semibold text-[#9b7d83] transition hover:bg-[#fff1f2] hover:text-[#d50014]" aria-label="Закрыть">
        x
      </button>
    </div>
  );
}

function ProductModalControls({
  isAddDisabled,
  selectedVariant,
  quantity,
  setQuantity,
  onAdd,
}: {
  isAddDisabled: boolean;
  selectedVariant: CatalogItemVariant;
  quantity: number;
  setQuantity: (getNext: (current: number) => number) => void;
  onAdd: () => void;
}) {
  const totalCents = selectedVariant.priceCents * quantity;

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_9.5rem] lg:grid-cols-[minmax(0,1fr)_9.5rem_auto] lg:items-center">
      <div className="min-w-0">
        <p className="text-3xl font-semibold text-[#241316]">{formatPublicMenuMoney(totalCents)}</p>
        {quantity > 1 ? (
          <p className="mt-1 text-xs font-semibold text-[#9b7d83]">
            {quantity} × {formatPublicMenuMoney(selectedVariant.priceCents)}
          </p>
        ) : null}
      </div>
      <div className="grid h-12 w-[9.5rem] grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center rounded-full bg-[#fff5f6] p-1">
        <QuantityButton label="-" onClick={() => setQuantity((current) => Math.max(current - 1, 1))} />
        <span className="text-center text-base font-semibold tabular-nums text-[#241316]">{quantity}</span>
        <QuantityButton label="+" onClick={() => setQuantity((current) => current + 1)} />
      </div>
      <button type="button" onClick={onAdd} disabled={isAddDisabled} className="min-h-12 rounded-full bg-[#d50014] px-8 text-sm font-semibold text-white transition hover:bg-[#b90012] disabled:cursor-not-allowed disabled:bg-[#f0c4c9] sm:col-span-2 lg:col-span-1">
        Добавить
      </button>
    </div>
  );
}

function QuantityButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex size-10 items-center justify-center rounded-full text-xl font-semibold text-[#b00012] transition hover:bg-white">
      {label}
    </button>
  );
}

function ProductVariantPicker({
  item,
  selectedVariant,
  onSelect,
}: {
  item: CatalogItem;
  selectedVariant: CatalogItemVariant;
  onSelect: (id: number) => void;
}) {
  if (item.variants.length <= 1) return null;

  return (
    <div className="mt-7 border-t border-[#f3dadd] pt-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-[#241316]">Размер</p>
        <span className="text-xs font-semibold text-[#9b7d83]">Выберите один</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.variants.map((variant) => (
          <button key={variant.id} type="button" onClick={() => onSelect(variant.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedVariant.id === variant.id ? "border-[#d50014] bg-[#d50014] text-white" : "border-[#ffd7dc] bg-white text-[#b00012] hover:bg-[#fff1f2]"}`}>
            {variant.label} · {formatPublicMenuMoney(variant.priceCents)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExcludedIngredientPicker({
  item,
  excludedIngredientIds,
  onToggle,
}: {
  item: CatalogItem;
  excludedIngredientIds: number[];
  onToggle: (id: number) => void;
}) {
  if (!item.excludedIngredients.length) return null;

  return (
    <div className="mt-7 border-t border-[#f3dadd] pt-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-[#241316]">Исключить ингредиенты</p>
        <span className="text-xs font-semibold text-[#9b7d83]">Можно выбрать несколько</span>
      </div>
      <div className="mt-3 space-y-2">
        {item.excludedIngredients.map((ingredient) => (
          <label key={ingredient.id} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-[#f3dadd] bg-[#fffafa] px-4 py-2 transition hover:border-[#ffc3ca] hover:bg-[#fff1f2]">
            <span className="text-sm font-semibold text-[#3a292d]">Убрать {ingredient.label}</span>
            <input type="checkbox" checked={excludedIngredientIds.includes(ingredient.id)} onChange={() => onToggle(ingredient.id)} className="size-5 accent-[#d50014]" />
          </label>
        ))}
      </div>
    </div>
  );
}
