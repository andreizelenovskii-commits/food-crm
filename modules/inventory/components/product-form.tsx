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
      ? "Средняя закупочная цена за кг"
      : selectedUnit === "шт"
        ? "Средняя закупочная цена за шт"
        : "Средняя закупочная цена";

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
      noValidate
      className="space-y-3 rounded-[22px] border border-white/70 bg-white/72 p-3.5 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl"
    >
      {initialProduct ? <input type="hidden" name="productId" value={initialProduct.id} /> : null}

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
          Товар
        </p>
        <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
        <p className="text-[11px] leading-5 text-zinc-500">
          Сохраняй товары, их среднюю закупочную цену и текущий остаток на складе.
        </p>
        <p className="text-[11px] leading-4 text-zinc-500">
          Внутренний код присваивается автоматически при создании товара.
          {initialProduct?.sku ? ` Текущий код: ${initialProduct.sku}.` : ""}
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-700">Название</span>
        <input
          name="name"
          type="text"
          defaultValue={activeState.values.name}
          placeholder="Например: Пицца Маргарита"
          className="h-9 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          required
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-700">Категория</span>
        <div className="relative">
          <select
            name="category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value as ProductCategory | "")}
            className={`h-9 w-full appearance-none rounded-full border px-4 pr-12 text-xs font-medium outline-none transition focus:ring-2 ${
              selectedCategory
                ? "border-red-100 bg-red-50/60 text-zinc-950 focus:border-red-300 focus:ring-red-800/10"
                : "border-red-950/10 bg-white/85 text-zinc-500 focus:border-red-300 focus:ring-red-800/10"
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
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-red-800">
            ▾
          </span>
        </div>
        <p className="text-[11px] leading-4 text-zinc-500">
          Категория помогает аккуратно вести склад и быстрее находить нужные позиции.
        </p>
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-700">Ед. изм.</span>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_UNITS.map((unit) => {
              const isSelected = selectedUnit === unit;

              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setSelectedUnit(unit)}
                  className={`h-9 rounded-full border px-4 text-xs font-semibold transition ${
                    isSelected
                      ? "border-red-800 bg-red-800 text-white shadow-sm shadow-red-950/20"
                      : "border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
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

        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-700">Остаток</span>
          <input
            name="stockQuantity"
            type="number"
            min="0"
            step="0.01"
            defaultValue={activeState.values.stockQuantity}
            placeholder="0"
            className="h-9 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-700">{priceLabel}</span>
          <input
            name="price"
            type="text"
            inputMode="decimal"
            defaultValue={activeState.values.price}
            placeholder="0"
            className="h-9 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-700">Описание</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={activeState.values.description}
          placeholder="Состав, особенности, комментарии по хранению"
          className="w-full rounded-[18px] border border-red-950/10 bg-white/85 px-4 py-2.5 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
        />
      </label>

      {activeState.errorMessage ? (
        <p className="rounded-[18px] border border-red-100 bg-red-50/80 px-4 py-3 text-xs font-semibold leading-5 text-red-800 shadow-sm shadow-red-950/5">
          {activeState.errorMessage}
        </p>
      ) : null}

      {!initialProduct && activeState.successMessage ? (
        <p className="rounded-[18px] border border-red-100 bg-red-50/80 px-4 py-3 text-xs font-semibold leading-5 text-red-800 shadow-sm shadow-red-950/5">
          {activeState.successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-9 w-full items-center justify-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-sm hover:shadow-red-950/20 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-white disabled:hover:shadow-none"
      >
        {isPending ? "Сохраняем..." : title}
      </button>
    </form>
  );
}
