"use client";

import type { SelectedIngredient } from "@/modules/tech-cards/components/tech-card-draft";
import type { TechCardProductOption } from "@/modules/tech-cards/tech-cards.types";

export function TechCardIngredientsSection({
  selectedIngredients,
  productsById,
  outputQuantity,
  outputUnit,
  isVisible = true,
  onOpenDialog,
  onQuantityChange,
  onRemove,
}: {
  selectedIngredients: SelectedIngredient[];
  productsById: Map<string, TechCardProductOption>;
  outputQuantity: string;
  outputUnit: "кг" | "шт";
  isVisible?: boolean;
  onOpenDialog: () => void;
  onQuantityChange: (productId: string, quantity: string) => void;
  onRemove: (productId: string) => void;
}) {
  const parsedOutputQuantity = parseDecimal(outputQuantity);

  if (!isVisible) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-[18px] border border-red-950/10 bg-red-50/35 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-950">Ингредиенты</h3>
          <p className="text-xs leading-5 text-zinc-600">
            Добавь состав техкарты и укажи количество списания для каждой позиции.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenDialog}
          className="inline-flex h-9 items-center justify-center rounded-full border border-red-100 bg-white px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white sm:shrink-0"
        >
          Выбрать ингредиенты
        </button>
      </div>

      {selectedIngredients.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-red-950/14 bg-white/75 px-4 py-4 text-sm leading-6 text-zinc-500">
          Пока ингредиенты не выбраны. Открой диалог и добавь позиции со склада.
        </div>
      ) : (
        <div className="space-y-2">
          {selectedIngredients.map((ingredient) => {
            const product = productsById.get(ingredient.productId);
            const normalizedQuantity = getNormalizedIngredientQuantity(
              ingredient.quantity,
              parsedOutputQuantity,
            );

            if (!product) {
              return null;
            }

            return (
              <div
                key={ingredient.productId}
                className="grid gap-3 rounded-[14px] border border-red-950/10 bg-white/86 p-3 shadow-sm shadow-red-950/5 lg:grid-cols-[minmax(0,1fr)_minmax(180px,0.7fr)] lg:items-center"
              >
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold leading-5 text-zinc-950">
                    {product.name}
                  </p>
                  <p className="text-xs leading-5 text-zinc-500">
                    {product.category ? `Категория склада: ${product.category}` : "Категория склада не указана"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full bg-zinc-50 px-2.5 py-1 font-semibold text-zinc-500 ring-1 ring-zinc-200">
                      Склад: {product.unit}
                    </span>
                    <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-800 ring-1 ring-red-100">
                      Техкарта: {ingredient.unit}
                    </span>
                    {normalizedQuantity !== null ? (
                      <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-zinc-700 ring-1 ring-red-100">
                        На 1 {outputUnit}: {formatQuantity(normalizedQuantity)} {ingredient.unit}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold text-zinc-700">Количество</span>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={ingredient.quantity}
                        onChange={(event) => onQuantityChange(ingredient.productId, event.target.value)}
                        className="h-10 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-3 pr-12 text-sm font-semibold text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
                        required
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                        {ingredient.unit}
                      </span>
                    </div>
                  </label>

                  <div className="flex justify-start lg:justify-end">
                    <button
                      type="button"
                      onClick={() => onRemove(ingredient.productId)}
                      className="h-9 w-full rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-700 transition hover:border-red-800 hover:bg-red-800 hover:text-white sm:max-w-[160px]"
                    >
                      Убрать
                    </button>
                  </div>
                </div>

                <input type="hidden" name="ingredientProductId" value={ingredient.productId} />
                <input type="hidden" name="ingredientQuantity" value={ingredient.quantity} />
                <input type="hidden" name="ingredientUnit" value={ingredient.unit} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function parseDecimal(value: string) {
  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getNormalizedIngredientQuantity(quantity: string, outputQuantity: number | null) {
  if (!outputQuantity) {
    return null;
  }

  const parsedQuantity = parseDecimal(quantity);
  if (!parsedQuantity) {
    return null;
  }

  return parsedQuantity / outputQuantity;
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 4,
  }).format(value);
}
