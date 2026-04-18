"use client";

import { useActionState, useState } from "react";
import {
  addTechCardAction,
  type TechCardFormState,
} from "@/modules/tech-cards/tech-cards.actions";
import type { TechCardProductOption } from "@/modules/tech-cards/tech-cards.types";

const OUTPUT_UNITS = ["шт", "кг"] as const;
type OutputUnit = (typeof OUTPUT_UNITS)[number];

export function TechCardForm({ products }: { products: TechCardProductOption[] }) {
  const initialState: TechCardFormState = {
    errorMessage: null,
    values: {
      name: "",
      outputQuantity: "",
      outputUnit: "шт",
      ingredientProductId: "",
      ingredientQuantity: "",
      description: "",
    },
  };
  const [state, formAction, isPending] = useActionState(addTechCardAction, initialState);
  const [selectedUnit, setSelectedUnit] = useState<OutputUnit>(
    state.values.outputUnit === "кг" ? "кг" : "шт",
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">Новая техкарта</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Создай базовую технологическую карту и привяжи к ней основной ингредиент.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Название техкарты</span>
        <input
          name="name"
          type="text"
          defaultValue={state.values.name}
          placeholder="Например: Пицца Маргарита 30 см"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Выход</span>
          <input
            name="outputQuantity"
            type="number"
            min="1"
            step="1"
            defaultValue={state.values.outputQuantity}
            placeholder="1"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
        </label>

        <div className="space-y-3">
          <span className="text-sm font-medium text-zinc-700">Ед. выхода</span>
          <div className="grid grid-cols-2 gap-2">
            {OUTPUT_UNITS.map((unit) => {
              const isSelected = selectedUnit === unit;

              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setSelectedUnit(unit)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                      : "border-zinc-300 bg-white text-zinc-950 hover:border-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  {unit}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="outputUnit" value={selectedUnit} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Основной ингредиент</span>
          <select
            name="ingredientProductId"
            defaultValue={state.values.ingredientProductId}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          >
            <option value="">Выбери товар склада</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {product.unit}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Количество ингредиента</span>
          <input
            name="ingredientQuantity"
            type="number"
            min="1"
            step="1"
            defaultValue={state.values.ingredientQuantity}
            placeholder="1"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Описание</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={state.values.description}
          placeholder="Комментарий по техкарте, составу и приготовлению"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
        />
      </label>

      {state.errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
      >
        {isPending ? "Сохраняем..." : "Добавить техкарту"}
      </button>
    </form>
  );
}
