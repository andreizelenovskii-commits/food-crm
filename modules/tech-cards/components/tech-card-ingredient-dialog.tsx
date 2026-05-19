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
    <div className="fixed inset-0 z-90 flex items-start justify-center overflow-y-auto bg-zinc-950/35 px-4 py-3 backdrop-blur-sm sm:py-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Выбор ингредиентов для технологической карты"
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:max-h-[min(720px,calc(100dvh-2rem))]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-red-950/10 bg-white/68 px-4 py-3 backdrop-blur-2xl sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Состав техкарты</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Выбор ингредиентов</h3>
              <p className="mt-1 hidden max-w-2xl text-xs leading-5 text-zinc-600 sm:block">
                Отмечай несколько позиций подряд и добавляй их в техкарту одним действием.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            >
              Закрыть
            </button>
          </div>

          <input
            type="search"
            value={ingredientQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Найти ингредиент по названию или единице"
            className="mt-2.5 h-9 w-full rounded-[13px] border border-red-950/10 bg-white/90 px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />

          <div className="mt-2.5 flex gap-2 overflow-x-auto rounded-[14px] border border-red-950/10 bg-white/62 p-1">
            <button
              type="button"
              onClick={() => onCategoryChange("")}
              className={`h-7 shrink-0 rounded-[10px] px-3 text-xs font-semibold transition ${
                !selectedCategory
                  ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
                  : "text-zinc-500 hover:bg-red-50 hover:text-red-900"
              }`}
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
                  className={`h-7 shrink-0 rounded-[10px] px-3 text-xs font-semibold transition ${
                    isActive
                      ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
                      : "text-zinc-500 hover:bg-red-50 hover:text-red-900"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2.5 sm:px-5">
          {filteredProducts.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-red-950/14 bg-white/70 px-4 py-5 text-sm text-zinc-500">
              Ничего не найдено. Попробуй другой запрос.
            </div>
          ) : (
            <PaginatedList itemLabel="товаров" className="grid gap-2" pageSize={5}>
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

        <div className="shrink-0 border-t border-red-950/10 bg-white/72 px-4 py-2.5 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-600">
            Отмечено для добавления: <span className="font-semibold text-zinc-950">{pendingIngredientIds.length}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onResetPending}
              disabled={pendingIngredientIds.length === 0}
              className="h-10 rounded-full border border-red-100 bg-white px-4 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Сбросить выбор
            </button>
            <button
              type="button"
              onClick={onAddPending}
              disabled={pendingIngredientIds.length === 0}
              className="h-10 rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              Добавить выбранные
            </button>
          </div>
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
      className={`flex flex-wrap items-center justify-between gap-2.5 rounded-[14px] border px-3 py-2 shadow-sm shadow-red-950/5 transition ${
        isPendingSelected ? "border-red-200 bg-red-50/80" : "border-red-950/10 bg-white/84 hover:border-red-100"
      }`}
    >
      <label className="flex min-w-0 flex-1 items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected || isPendingSelected}
          disabled={isSelected}
          onChange={onToggle}
          className="mt-0.5 h-4 w-4 rounded border-red-200 text-red-700 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold leading-5 text-zinc-950">{product.name}</p>
          <p className="text-xs leading-4 text-zinc-500">
            {product.category ? `Категория склада: ${product.category}` : "Категория склада не указана"}
          </p>
          <p className="text-xs leading-4 text-zinc-400">Единица склада: {product.unit}</p>
        </div>
      </label>
      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          isSelected
            ? "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"
            : isPendingSelected
              ? "bg-red-800 text-white"
              : "bg-white text-zinc-500 ring-1 ring-red-950/10"
        }`}
      >
        {isSelected ? "Уже в техкарте" : isPendingSelected ? "Выбрано" : "Можно выбрать"}
      </span>
    </div>
  );
}
