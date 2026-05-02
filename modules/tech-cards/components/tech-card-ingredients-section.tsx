"use client";

import type { SelectedIngredient } from "@/modules/tech-cards/components/tech-card-draft";
import type { TechCardProductOption } from "@/modules/tech-cards/tech-cards.types";

export function TechCardIngredientsSection({
  selectedIngredients,
  productsById,
  onOpenDialog,
  onQuantityChange,
  onRemove,
}: {
  selectedIngredients: SelectedIngredient[];
  productsById: Map<string, TechCardProductOption>;
  onOpenDialog: () => void;
  onQuantityChange: (productId: string, quantity: string) => void;
  onRemove: (productId: string) => void;
}) {
  return (
    <section className="space-y-5 rounded-[30px] border border-zinc-200 bg-zinc-50/80 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h3 className="text-[1.45rem] font-semibold tracking-[-0.02em] text-zinc-950">Ингредиенты</h3>
          <p className="max-w-2xl text-[15px] leading-7 text-zinc-600">
            Добавь состав техкарты и укажи количество списания для каждой позиции.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenDialog}
          className="rounded-[22px] bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 lg:shrink-0"
        >
          Выбрать ингредиенты
        </button>
      </div>

      {selectedIngredients.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-zinc-300 bg-white px-5 py-5 text-[15px] leading-7 text-zinc-500">
          Пока ингредиенты не выбраны. Открой диалог и добавь позиции со склада.
        </div>
      ) : (
        <div className="space-y-4">
          {selectedIngredients.map((ingredient) => {
            const product = productsById.get(ingredient.productId);

            if (!product) {
              return null;
            }

            return (
              <div
                key={ingredient.productId}
                className="grid gap-4 rounded-[12px] border border-zinc-200 bg-white p-4 lg:grid-cols-[minmax(180px,0.82fr)_minmax(0,1.18fr)] lg:items-center"
              >
                <div className="space-y-2">
                  <p className="text-[1.35rem] font-semibold leading-[1.1] tracking-[-0.02em] text-zinc-950">
                    {product.name}
                  </p>
                  <p className="text-[13px] leading-5 text-zinc-500">
                    {product.category ? `Категория склада: ${product.category}` : "Категория склада не указана"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[13px]">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600 ring-1 ring-zinc-200">
                      Склад: {product.unit}
                    </span>
                    <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-800 ring-1 ring-red-200">
                      Техкарта: {ingredient.unit}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block space-y-3">
                    <span className="text-[14px] font-semibold text-zinc-800">Количество</span>
                    <div className="relative">
                      <input
                        type="number"
                        min={ingredient.unit === "кг" ? "0.001" : "1"}
                        step={ingredient.unit === "кг" ? "0.001" : "1"}
                        value={ingredient.quantity}
                        onChange={(event) => onQuantityChange(ingredient.productId, event.target.value)}
                        className="w-full rounded-[20px] border border-zinc-300 px-5 py-3 pr-16 text-[1rem] font-medium text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
                        required
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-sm font-semibold uppercase tracking-[0.08em] text-zinc-500">
                        {ingredient.unit}
                      </span>
                    </div>
                  </label>

                  <div className="flex justify-start lg:justify-end">
                    <button
                      type="button"
                      onClick={() => onRemove(ingredient.productId)}
                      className="w-full rounded-[20px] border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:border-red-200 hover:bg-red-50 sm:max-w-[200px]"
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
