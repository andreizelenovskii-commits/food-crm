"use client";

import type { SelectedComponent } from "@/modules/tech-cards/components/tech-card-draft";
import type { TechCardItem } from "@/modules/tech-cards/tech-cards.types";

export function TechCardComponentsSection({
  selectedComponents,
  componentsById,
  outputQuantity,
  outputUnit,
  isVisible,
  onOpenDialog,
  onQuantityChange,
  onRemove,
}: {
  selectedComponents: SelectedComponent[];
  componentsById: Map<string, TechCardItem>;
  outputQuantity: string;
  outputUnit: "кг" | "шт";
  isVisible: boolean;
  onOpenDialog: () => void;
  onQuantityChange: (techCardId: string, quantity: string) => void;
  onRemove: (techCardId: string) => void;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-[18px] border border-red-950/10 bg-red-50/35 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-950">Компоненты</h3>
          <p className="text-xs leading-5 text-zinc-600">
            Собери комбо или сет из готовых технологических карт.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenDialog}
          className="inline-flex h-9 items-center justify-center rounded-full border border-red-100 bg-white px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white sm:shrink-0"
        >
          Выбрать техкарты
        </button>
      </div>

      {selectedComponents.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-red-950/14 bg-white/75 px-4 py-4 text-sm leading-6 text-zinc-500">
          Пока техкарты не выбраны. Открой диалог и добавь готовые позиции.
        </div>
      ) : (
        <div className="space-y-2">
          {selectedComponents.map((item) => {
            const component = componentsById.get(item.techCardId);

            if (!component) {
              return null;
            }

            return (
              <div
                key={item.techCardId}
                className="grid gap-3 rounded-[14px] border border-red-950/10 bg-white/86 p-3 shadow-sm shadow-red-950/5 lg:grid-cols-[minmax(0,1fr)_minmax(180px,0.7fr)] lg:items-center"
              >
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold leading-5 text-zinc-950">{component.name}</p>
                  <p className="text-xs leading-5 text-zinc-500">
                    Категория: {component.category}
                    {component.pizzaSize ? ` · ${component.pizzaSize}` : ""}
                    {component.rollSize ? ` · ${component.rollSize}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full bg-zinc-50 px-2.5 py-1 font-semibold text-zinc-500 ring-1 ring-zinc-200">
                      Выход: {formatQuantity(component.outputQuantity)} {component.outputUnit}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-zinc-700 ring-1 ring-red-100">
                      На {outputQuantity || "1"} {outputUnit}: {item.quantity} {component.outputUnit}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold text-zinc-700">Количество</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.quantity}
                      onChange={(event) => onQuantityChange(item.techCardId, event.target.value)}
                      className="h-10 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-3 text-sm font-semibold text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
                      required
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onRemove(item.techCardId)}
                    className="h-9 w-full rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-700 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                  >
                    Убрать
                  </button>
                </div>

                <input type="hidden" name="componentTechCardId" value={item.techCardId} />
                <input type="hidden" name="componentQuantity" value={item.quantity} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 4,
  }).format(value);
}
