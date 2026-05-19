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
    <div
      role="region"
      aria-label="Выбор ингредиентов для технологической карты"
      className="overflow-hidden rounded-[18px] border border-red-950/10 bg-white/82 shadow-sm shadow-red-950/5"
    >
      <div className="border-b border-red-950/10 bg-white px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-zinc-950">Каталог ингредиентов</p>
            <p className="mt-0.5 text-xs text-zinc-500">Отметь позиции и добавь их в состав техкарты.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Свернуть
          </button>
        </div>

        <input
          type="search"
          value={ingredientQuery}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Найти ингредиент по названию или единице"
          className="mt-3 h-10 w-full rounded-[13px] border border-red-950/10 bg-white/90 px-4 text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
        />

        <div className="mt-3 flex gap-2 overflow-x-auto rounded-[14px] border border-red-950/10 bg-red-50/40 p-1">
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

      <div className="px-3 py-3 sm:px-4">
        {filteredProducts.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-red-950/14 bg-white/70 px-4 py-5 text-sm text-zinc-500">
            Ничего не найдено. Попробуй другой запрос.
          </div>
        ) : (
          <PaginatedList itemLabel="товаров" className="grid gap-2" pageSize={6}>
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

      <div className="border-t border-red-950/10 bg-white px-3 py-3 sm:px-4">
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
