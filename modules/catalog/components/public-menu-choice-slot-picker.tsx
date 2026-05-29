"use client";

import { useState } from "react";
import type { CatalogChoiceOption, CatalogChoiceSlot, CatalogItem } from "@/modules/catalog/catalog.types";
import {
  choiceKey,
  getChoiceSlotSelectionCount,
} from "@/modules/catalog/components/public-menu-choice-utils";
import { formatPublicMenuMoney } from "@/modules/catalog/components/public-menu-utils";

type ActiveChoicePicker = {
  slot: CatalogChoiceSlot;
  position: number;
} | null;

function getChoiceLabel(option: CatalogChoiceOption | undefined) {
  if (!option) {
    return "Выбрать";
  }

  return [
    option.name,
    option.pizzaSize,
    option.rollSize,
  ].filter(Boolean).join(" · ");
}

export function ProductChoiceSlotPicker({
  item,
  selectedChoices,
  onChoiceChange,
}: {
  item: CatalogItem;
  selectedChoices: Record<string, number>;
  onChoiceChange: (choiceSlotId: number, position: number, selectedCatalogItemId: number) => void;
}) {
  const [activePicker, setActivePicker] = useState<ActiveChoicePicker>(null);

  if (!item.choiceSlots.length) return null;

  return (
    <div className="mt-7 border-t border-[#f3dadd] pt-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-[#241316]">Состав комбо</p>
        <span className="text-xs font-semibold text-[#9b7d83]">Выберите варианты</span>
      </div>
      <div className="mt-3 space-y-3">
        {item.choiceSlots.flatMap((slot) =>
          Array.from({ length: getChoiceSlotSelectionCount(slot.quantity) }, (_, index) => {
            const selectedId = selectedChoices[choiceKey(slot.id, index)];
            const selectedOption = slot.options.find((option) => option.catalogItemId === selectedId);

            return (
              <div key={`${slot.id}-${index}`} className="space-y-1.5">
                <span className="text-sm font-semibold text-[#3a292d]">
                  {slot.name}
                  {getChoiceSlotSelectionCount(slot.quantity) > 1 ? ` #${index + 1}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setActivePicker({ slot, position: index })}
                  className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-[16px] border bg-white px-4 py-2 text-left text-sm font-semibold transition ${
                    selectedOption
                      ? "border-[#ffc3ca] text-[#241316]"
                      : "border-[#f3dadd] text-[#9b7d83] hover:border-[#ffc3ca] hover:bg-[#fff8f8]"
                  }`}
                >
                  <span className="truncate">{getChoiceLabel(selectedOption)}</span>
                  <span className="shrink-0 text-xs font-black text-[#d50014]">
                    Изменить
                  </span>
                </button>
              </div>
            );
          }),
        )}
      </div>

      {activePicker ? (
        <ChoiceOptionDialog
          activePicker={activePicker}
          selectedChoices={selectedChoices}
          onClose={() => setActivePicker(null)}
          onSelect={(selectedCatalogItemId) => {
            onChoiceChange(activePicker.slot.id, activePicker.position, selectedCatalogItemId);
            setActivePicker(null);
          }}
        />
      ) : null}
    </div>
  );
}

function ChoiceOptionDialog({
  activePicker,
  selectedChoices,
  onClose,
  onSelect,
}: {
  activePicker: Exclude<ActiveChoicePicker, null>;
  selectedChoices: Record<string, number>;
  onClose: () => void;
  onSelect: (selectedCatalogItemId: number) => void;
}) {
  const selectedId = selectedChoices[choiceKey(activePicker.slot.id, activePicker.position)];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#211316]/55 px-4 py-5 backdrop-blur-sm" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={activePicker.slot.name}
        className="max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(80,8,16,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#f6e2e5] bg-[#fff8f8] p-5 sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d50014]">Выбор комбо</p>
            <h4 className="mt-2 text-2xl font-black text-[#241316]">
              {activePicker.slot.name}
              {getChoiceSlotSelectionCount(activePicker.slot.quantity) > 1 ? ` #${activePicker.position + 1}` : ""}
            </h4>
          </div>
          <button type="button" onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#f0d9dc] text-xl font-semibold text-[#9b7d83] transition hover:bg-[#fff1f2] hover:text-[#d50014]" aria-label="Закрыть">
            x
          </button>
        </div>

        <div className="grid max-h-[calc(100vh-12rem)] gap-4 overflow-y-auto p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {activePicker.slot.options.map((option) => (
            <button
              key={option.catalogItemId}
              type="button"
              onClick={() => onSelect(option.catalogItemId)}
              className={`group overflow-hidden rounded-[18px] border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#d50014] hover:shadow-[0_18px_42px_rgba(80,8,16,0.14)] ${
                selectedId === option.catalogItemId ? "border-[#d50014] ring-2 ring-[#d50014]/15" : "border-[#f3dadd]"
              }`}
            >
              <span className="block aspect-[3/2] overflow-hidden bg-[#fff7f8]">
                {option.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={option.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs font-black uppercase tracking-[0.16em] text-[#d50014]">
                    FoodLike
                  </span>
                )}
              </span>
              <span className="block p-4">
                <span className="block text-base font-black text-[#241316]">{option.name}</span>
                <span className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold">
                  <span className="text-[#7b5e64]">{option.pizzaSize ?? option.rollSize ?? option.category}</span>
                  <span className="text-[#d50014]">{formatPublicMenuMoney(option.priceCents)}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
