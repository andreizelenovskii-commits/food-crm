"use client";

import { createPortal } from "react-dom";
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
  onRemoveSelected,
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
  onRemoveSelected: (productId: string) => void;
  onResetPending: () => void;
  onAddPending: () => void;
  onClose: () => void;
}) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-zinc-950/70 px-4 py-4 backdrop-blur-md" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Выбор ингредиентов для технологической карты"
        className="flex max-h-[min(760px,calc(100dvh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(24,24,27,0.34)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-red-950/10 bg-[linear-gradient(135deg,#fff_0%,#fff6f5_100%)] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Состав техкарты</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">Выбор ингредиентов</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Найди позиции, отметь нужные и добавь их в состав одним действием.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            >
              Закрыть
            </button>
          </div>

          <input
            type="search"
            value={ingredientQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Найти ингредиент по названию или единице"
            className="mt-4 h-11 w-full rounded-[14px] border border-red-950/10 bg-white px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
            autoFocus
          />

          <div className="mt-3 flex gap-2 overflow-x-auto rounded-[14px] border border-red-950/10 bg-white/80 p-1.5">
            <button
              type="button"
              onClick={() => onCategoryChange("")}
              className={`h-8 shrink-0 rounded-[10px] px-3 text-xs font-semibold transition ${
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
                  className={`h-8 shrink-0 rounded-[10px] px-3 text-xs font-semibold transition ${
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

        <div className="min-h-0 flex-1 overflow-y-auto bg-red-50/25 px-4 py-4 sm:px-5">
          {filteredProducts.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-red-950/14 bg-white px-4 py-5 text-sm text-zinc-500">
              Ничего не найдено. Попробуй другой запрос.
            </div>
          ) : (
            <PaginatedList itemLabel="товаров" className="grid gap-2.5" pageSize={7}>
              {filteredProducts.map((product) => {
                const productId = String(product.id);
                const isSelected = selectedIngredients.some((ingredient) => ingredient.productId === productId);
                const isPendingSelected = pendingIngredientIds.includes(productId);

                return (
                  <IngredientPickerRow
                    key={product.id}
                    product={product}
                    isSelected={isSelected}
                    isPendingSelected={isPendingSelected}
                    onToggle={() => onTogglePending(productId)}
                    onRemove={() => onRemoveSelected(productId)}
                  />
                );
              })}
            </PaginatedList>
          )}
        </div>

        <div className="shrink-0 border-t border-red-950/10 bg-white px-4 py-4 sm:px-5">
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
    </div>,
    document.body,
  );
}

function IngredientPickerRow({
  product,
  isSelected,
  isPendingSelected,
  onToggle,
  onRemove,
}: {
  product: TechCardProductOption;
  isSelected: boolean;
  isPendingSelected: boolean;
  onToggle: () => void;
  onRemove: () => void;
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
      {isSelected ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-red-800 ring-1 ring-zinc-200 transition hover:bg-red-800 hover:text-white hover:ring-red-800"
        >
          Убрать
        </button>
      ) : (
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isPendingSelected
              ? "bg-red-800 text-white"
              : "bg-white text-zinc-500 ring-1 ring-red-950/10"
          }`}
        >
          {isPendingSelected ? "Выбрано" : "Можно выбрать"}
        </span>
      )}
    </div>
  );
}
