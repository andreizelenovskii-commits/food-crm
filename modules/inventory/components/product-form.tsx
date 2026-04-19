"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  type ProductFormState,
  submitAddProductAction,
  updateProductAction,
} from "@/modules/inventory/inventory.actions";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  type ProductItem,
} from "@/modules/inventory/inventory.types";

function formatPriceInput(priceCents?: number) {
  if (priceCents === undefined) {
    return "";
  }

  return (priceCents / 100).toFixed(2).replace(/\.00$/, "");
}

const PRODUCT_UNITS = ["кг", "шт"] as const;
type ProductUnit = (typeof PRODUCT_UNITS)[number];

export function ProductForm({ initialProduct }: { initialProduct?: ProductItem }) {
  const title = initialProduct ? "Редактировать товар" : "Добавить товар";
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: ProductFormState = {
    errorMessage: null,
    successMessage: null,
    values: {
      name: initialProduct?.name ?? "",
      category: initialProduct?.category ?? "",
      unit: initialProduct?.unit ?? "",
      stockQuantity: initialProduct ? String(initialProduct.stockQuantity) : "",
      price: formatPriceInput(initialProduct?.priceCents),
      description: initialProduct?.description ?? "",
    },
  };
  const [createState, setCreateState] = useState<ProductFormState>(initialState);
  const [state, formAction, isEditPending] = useActionState(
    updateProductAction,
    initialState,
  );
  const activeState = initialProduct ? state : createState;
  const [isCreatePending, startCreateTransition] = useTransition();
  const isPending = initialProduct ? isEditPending : isCreatePending;
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | "">(
    activeState.values.unit === "кг" || activeState.values.unit === "шт"
      ? activeState.values.unit
      : "",
  );
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">(
    PRODUCT_CATEGORIES.includes(activeState.values.category as ProductCategory)
      ? (activeState.values.category as ProductCategory)
      : "",
  );

  const priceLabel =
    selectedUnit === "кг"
      ? "Цена за кг"
      : selectedUnit === "шт"
        ? "Цена за шт"
        : "Цена";

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = formRef.current;

    if (!form) {
      return;
    }

    startCreateTransition(async () => {
      const result = await submitAddProductAction(new FormData(form));
      setCreateState(result);

      if (!result.errorMessage) {
        form.reset();
        setSelectedCategory("");
        setSelectedUnit("");
        setCreateState({
          errorMessage: null,
          successMessage: null,
          values: {
            name: "",
            category: "",
            unit: "",
            stockQuantity: "",
            price: "",
            description: "",
          },
        });
        router.refresh();
      }
    });
  };

  return (
    <form
      ref={formRef}
      action={initialProduct ? formAction : undefined}
      onSubmit={initialProduct ? undefined : handleCreateSubmit}
      className="space-y-5 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5"
    >
      {initialProduct ? <input type="hidden" name="productId" value={initialProduct.id} /> : null}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Сохраняй товары, их цену и текущий остаток на складе.
        </p>
        <p className="text-xs text-zinc-500">
          Внутренний код присваивается автоматически при создании товара.
          {initialProduct?.sku ? ` Текущий код: ${initialProduct.sku}.` : ""}
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Название</span>
        <input
          name="name"
          type="text"
          defaultValue={activeState.values.name}
          placeholder="Например: Пицца Маргарита"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Категория</span>
        <div className="relative">
          <select
            name="category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value as ProductCategory | "")}
            className={`w-full appearance-none rounded-2xl border px-4 py-3 pr-12 outline-none transition focus:ring-2 ${
              selectedCategory
                ? "border-emerald-200 bg-emerald-50/60 text-zinc-950 focus:border-emerald-400 focus:ring-emerald-500/10"
                : "border-zinc-300 bg-white text-zinc-500 focus:border-zinc-500 focus:ring-zinc-950/5"
            }`}
            required
          >
            <option value="">Выбери категорию товара</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-emerald-700">
            ▾
          </span>
        </div>
        <p className="text-xs text-zinc-500">
          Категория помогает аккуратно вести склад и быстрее находить нужные позиции.
        </p>
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
            defaultValue={activeState.values.stockQuantity}
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
            defaultValue={activeState.values.price}
            placeholder="0"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Описание</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={activeState.values.description}
          placeholder="Состав, особенности, комментарии по хранению"
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
        />
      </label>

      {activeState.errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {activeState.errorMessage}
        </p>
      ) : null}

      {!initialProduct && activeState.successMessage ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {activeState.successMessage}
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
