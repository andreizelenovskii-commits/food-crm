"use client";

import { PaginatedList } from "@/components/ui/paginated-list";
import type { SelectedIngredient } from "@/modules/tech-cards/components/tech-card-draft";
import type { TechCardProductOption } from "@/modules/tech-cards/tech-cards.types";

export function TechCardIngredientDialog({
  ingredientQuery,
  selectedCategory,
  availableCategories,
  filteredProducts,
  selectedIngredients,
  pendingIngredientIds,
  onQueryChange,
  onCategoryChange,
  onTogglePending,
  onResetPending,
  onAddPending,
  onClose,
}: {
  ingredientQuery: string;
  selectedCategory: string;
  availableCategories: string[];
  filteredProducts: TechCardProductOption[];
  selectedIngredients: SelectedIngredient[];
  pendingIngredientIds: string[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTogglePending: (productId: string) => void;
  onResetPending: () => void;
  onAddPending: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 px-4 py-4 sm:py-5" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Выбор ингредиентов для технологической карты"
        className="flex max-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/25"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-zinc-200 px-4 py-5 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">Состав техкарты</p>
              <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.02em] text-zinc-950">Выбор ингредиентов</h3>
              <p className="mt-2 max-w-2xl text-[15px] leading-7 text-zinc-600">
                Отмечай несколько позиций подряд и добавляй их в техкарту одним действием.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Закрыть
            </button>
          </div>

          <input
            type="search"
            value={ingredientQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Найти ингредиент по названию или единице"
            className="mt-4 w-full rounded-[22px] border border-zinc-300 px-4 py-3 text-[15px] text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategoryChange("")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !selectedCategory
                  ? "bg-zinc-950 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"
              }`}
              style={!selectedCategory ? { color: "#ffffff" } : undefined}
            >
              Все категории
            </button>
            {availableCategories.map((category) => {
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-red-800 text-white"
                      : "border border-red-100 bg-red-50/70 text-red-800 hover:border-red-200 hover:bg-red-100"
                  }`}
                  style={isActive ? { color: "#ffffff" } : undefined}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-5 sm:px-5">
          <div className="grid gap-3">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
                Ничего не найдено. Попробуй другой запрос.
              </div>
            ) : (
              <PaginatedList itemLabel="товаров" className="grid gap-3">
                {filteredProducts.map((product) => {
                  const isSelected = selectedIngredients.some((ingredient) => ingredient.productId === String(product.id));
                  const isPendingSelected = pendingIngredientIds.includes(String(product.id));

                  return (
                    <IngredientPickerRow
                      key={product.id}
                      product={product}
                      isSelected={isSelected}
                      isPendingSelected={isPendingSelected}
                      onToggle={() => onTogglePending(String(product.id))}
                    />
                  );
                })}
              </PaginatedList>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-4 sm:px-5">
          <p className="text-sm text-zinc-600">
            Отмечено для добавления: <span className="font-medium text-zinc-950">{pendingIngredientIds.length}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onResetPending}
              disabled={pendingIngredientIds.length === 0}
              className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
            >
              Сбросить выбор
            </button>
            <button
              type="button"
              onClick={onAddPending}
              disabled={pendingIngredientIds.length === 0}
              className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              Добавить выбранные
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IngredientPickerRow({
  product,
  isSelected,
  isPendingSelected,
  onToggle,
}: {
  product: TechCardProductOption;
  isSelected: boolean;
  isPendingSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-[12px] border p-4 transition ${
        isPendingSelected ? "border-red-200 bg-red-50/70" : "border-zinc-200 bg-zinc-50"
      }`}
    >
      <label className="flex min-w-0 flex-1 items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected || isPendingSelected}
          disabled={isSelected}
          onChange={onToggle}
          className="mt-1 h-4 w-4 rounded border-zinc-300 text-red-700 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="space-y-1">
          <p className="text-[17px] font-semibold leading-6 tracking-[-0.02em] text-zinc-950">{product.name}</p>
          <p className="text-[13px] leading-5 text-zinc-500">
            {product.category ? `Категория склада: ${product.category}` : "Категория склада не указана"}
          </p>
          <p className="text-[13px] leading-5 text-zinc-400">Единица склада: {product.unit}</p>
        </div>
      </label>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          isSelected
            ? "bg-zinc-200 text-zinc-600"
            : isPendingSelected
              ? "bg-red-800 text-white"
              : "bg-white text-zinc-500 ring-1 ring-zinc-200"
        }`}
        style={isPendingSelected ? { color: "#ffffff" } : undefined}
      >
        {isSelected ? "Уже в техкарте" : isPendingSelected ? "Выбрано" : "Можно выбрать"}
      </span>
    </div>
  );
}
