"use client";

import { useActionState, useState } from "react";
import {
  addProductAction,
  type ProductFormState,
  updateProductAction,
} from "@/modules/inventory/inventory.actions";
import type { ProductItem } from "@/modules/inventory/inventory.types";

function formatPriceInput(priceCents?: number) {
  if (priceCents === undefined) {
    return "";
  }

  return (priceCents / 100).toFixed(2).replace(/\.00$/, "");
}

const PRODUCT_UNITS = ["кг", "шт"] as const;
type ProductUnit = (typeof PRODUCT_UNITS)[number];

export function ProductForm({ initialProduct }: { initialProduct?: ProductItem }) {
  const action = initialProduct ? updateProductAction : addProductAction;
  const title = initialProduct ? "Редактировать товар" : "Добавить товар";
  const initialState: ProductFormState = {
    errorMessage: null,
    values: {
      name: initialProduct?.name ?? "",
      sku: initialProduct?.sku ?? "",
      unit: initialProduct?.unit ?? "",
      stockQuantity: initialProduct ? String(initialProduct.stockQuantity) : "",
      price: formatPriceInput(initialProduct?.priceCents),
      description: initialProduct?.description ?? "",
    },
  };
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | "">(
    state.values.unit === "кг" || state.values.unit === "шт" ? state.values.unit : "",
  );

  const priceLabel =
    selectedUnit === "кг"
      ? "Цена за кг"
      : selectedUnit === "шт"
        ? "Цена за шт"
        : "Цена";

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5"
    >
      {initialProduct ? <input type="hidden" name="productId" value={initialProduct.id} /> : null}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Сохраняй товары, их цену и текущий остаток на складе.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Название</span>
        <input
          name="name"
          type="text"
          defaultValue={state.values.name}
          placeholder="Например: Пицца Маргарита"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Внутренний код</span>
        <input
          name="sku"
          type="text"
          defaultValue={state.values.sku}
          placeholder="Артикул или внутренний код"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="block space-y-3">
          <span className="text-sm font-medium text-zinc-700">Ед. изм.</span>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_UNITS.map((unit) => {
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
                  aria-pressed={isSelected}
                >
                  {unit}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="unit" value={selectedUnit} />
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Остаток</span>
          <input
            name="stockQuantity"
            type="number"
            min="0"
            step="1"
            defaultValue={state.values.stockQuantity}
            placeholder="0"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">{priceLabel}</span>
          <input
            name="price"
            type="text"
            inputMode="decimal"
            defaultValue={state.values.price}
            placeholder="0"
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
          placeholder="Состав, особенности, комментарии по хранению"
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
        {isPending ? "Сохраняем..." : title}
      </button>
    </form>
  );
}
