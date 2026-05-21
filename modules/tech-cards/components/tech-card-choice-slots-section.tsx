"use client";

import type { SelectedChoiceSlot } from "@/modules/tech-cards/components/tech-card-draft";
import {
  TECH_CARD_CATEGORIES,
  TECH_CARD_PIZZA_SIZES,
} from "@/modules/tech-cards/tech-cards.types";

export function TechCardChoiceSlotsSection({
  selectedChoiceSlots,
  isVisible,
  onAdd,
  onChange,
  onRemove,
}: {
  selectedChoiceSlots: SelectedChoiceSlot[];
  isVisible: boolean;
  onAdd: () => void;
  onChange: (slotId: string, nextSlot: Partial<SelectedChoiceSlot>) => void;
  onRemove: (slotId: string) => void;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-[18px] border border-red-950/10 bg-white/70 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-950">Выбор гостя</h3>
          <p className="text-xs leading-5 text-zinc-600">
            Добавь слот, если в комбо нужна любая позиция из категории: например, пицца 26 или 30 см.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 items-center justify-center rounded-full border border-red-100 bg-white px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
        >
          Добавить выбор
        </button>
      </div>

      {selectedChoiceSlots.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-red-950/14 bg-white/75 px-4 py-4 text-sm leading-6 text-zinc-500">
          Слотов выбора пока нет. Комбо будет состоять только из фиксированных компонентов.
        </div>
      ) : (
        <div className="space-y-2">
          {selectedChoiceSlots.map((slot) => (
            <div
              key={slot.id}
              className="grid gap-3 rounded-[14px] border border-red-950/10 bg-white/86 p-3 shadow-sm shadow-red-950/5 lg:grid-cols-[minmax(0,1fr)_minmax(170px,0.5fr)_auto] lg:items-end"
            >
              <label className="block space-y-2">
                <span className="text-xs font-semibold text-zinc-700">Название выбора</span>
                <input
                  type="text"
                  value={slot.name}
                  onChange={(event) => onChange(slot.id, { name: event.target.value })}
                  className="h-10 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-3 text-sm font-semibold text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold text-zinc-700">Категория</span>
                <select
                  value={slot.category}
                  onChange={(event) => onChange(slot.id, { category: event.target.value, allowedPizzaSizes: [] })}
                  className="h-10 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-3 text-sm font-semibold text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
                >
                  {TECH_CARD_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold text-zinc-700">Количество</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={slot.quantity}
                  onChange={(event) => onChange(slot.id, { quantity: event.target.value })}
                  className="h-10 w-28 rounded-[14px] border border-red-950/10 bg-white/90 px-3 text-sm font-semibold text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
                  required
                />
              </label>

              {slot.category === "Пиццы" ? (
                <div className="lg:col-span-3">
                  <p className="mb-2 text-xs font-semibold text-zinc-700">Размеры пиццы</p>
                  <div className="flex flex-wrap gap-2">
                    {TECH_CARD_PIZZA_SIZES.map((size) => {
                      const isChecked = slot.allowedPizzaSizes.includes(size);
                      return (
                        <label key={size} className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-800">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              onChange(slot.id, {
                                allowedPizzaSizes: isChecked
                                  ? slot.allowedPizzaSizes.filter((entry) => entry !== size)
                                  : [...slot.allowedPizzaSizes, size],
                              })
                            }
                          />
                          {size}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => onRemove(slot.id)}
                className="h-9 rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-700 transition hover:border-red-800 hover:bg-red-800 hover:text-white lg:col-span-3"
              >
                Убрать выбор
              </button>
              <input type="hidden" name="choiceSlotName" value={slot.name} />
              <input type="hidden" name="choiceSlotCategory" value={slot.category} />
              <input type="hidden" name="choiceSlotAllowedPizzaSizes" value={slot.allowedPizzaSizes.join(",")} />
              <input type="hidden" name="choiceSlotQuantity" value={slot.quantity} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
