"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import {
  addCatalogItemAction,
  updateCatalogItemAction,
} from "@/modules/catalog/catalog.actions";
import type { CatalogFormState, CatalogFormValues } from "@/modules/catalog/catalog.form-types";
import {
  type CatalogItem,
  CATALOG_PRICE_LIST_LABELS,
  CATALOG_PRICE_LIST_TYPES,
} from "@/modules/catalog/catalog.types";
import {
  TECH_CARD_CATEGORIES,
  TECH_CARD_PIZZA_SIZES,
  type TechCardPizzaSize,
} from "@/modules/tech-cards/tech-cards.types";

export function CatalogItemForm({
  mode = "create",
  initialItem,
  initialValues,
  submitLabel,
  techCardOptions,
}: {
  mode?: "create" | "edit";
  initialItem?: CatalogItem;
  initialValues?: CatalogFormValues;
  submitLabel?: string;
  techCardOptions: Array<{
    id: number;
    name: string;
    category: string;
    pizzaSize: string | null;
  }>;
}) {
  const action = mode === "edit" ? updateCatalogItemAction : addCatalogItemAction;
  const initialState: CatalogFormState = {
    errorMessage: null,
    values: initialValues ?? {
      name: "",
      priceListType: "",
      category: "",
      description: "",
      price: "",
      technologicalCardId: "",
    },
  };
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [selectedPriceListType, setSelectedPriceListType] = useState(initialState.values.priceListType);
  const [selectedCategory, setSelectedCategory] = useState(initialState.values.category);
  const [selectedTechCardId, setSelectedTechCardId] = useState(
    initialState.values.technologicalCardId,
  );

  const selectedTechCard =
    techCardOptions.find((option) => String(option.id) === selectedTechCardId) ?? null;
  const [selectedPizzaSize, setSelectedPizzaSize] = useState<TechCardPizzaSize | "">(
    selectedTechCard?.pizzaSize && TECH_CARD_PIZZA_SIZES.includes(selectedTechCard.pizzaSize as TechCardPizzaSize)
      ? (selectedTechCard.pizzaSize as TechCardPizzaSize)
      : "",
  );

  const sortedTechCardOptions = useMemo(
    () =>
      [...techCardOptions].sort(
        (left, right) =>
          left.category.localeCompare(right.category, "ru") ||
          left.name.localeCompare(right.name, "ru"),
      ),
    [techCardOptions],
  );
  const filteredTechCardOptions = useMemo(() => {
    return sortedTechCardOptions.filter((option) => {
      if (selectedCategory && option.category !== selectedCategory) {
        return false;
      }

      if (selectedCategory === "Пиццы" && selectedPizzaSize) {
        return option.pizzaSize === selectedPizzaSize;
      }

      return true;
    });
  }, [selectedCategory, selectedPizzaSize, sortedTechCardOptions]);
  const fieldClassName =
    "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5";

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5"
    >
      {initialItem ? <input type="hidden" name="catalogItemId" value={initialItem.id} /> : null}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-950">
          {mode === "edit" ? "Редактировать позицию каталога" : "Новая позиция каталога"}
        </h2>
        <p className="text-sm leading-6 text-zinc-600">
          {mode === "edit"
            ? "Обнови прайс, категорию, цену и привязку к технологической карте."
            : "Добавь позицию в нужный прайс и сразу привяжи её к технологической карте."}
        </p>
      </div>

      <label className="block space-y-2.5">
        <span className="text-sm font-medium text-zinc-700">Название</span>
        <input
          name="name"
          type="text"
          defaultValue={state.values.name}
          placeholder="Например: Пицца Маргарита"
          className={fieldClassName}
          required
        />
      </label>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-zinc-700">Куда добавить позицию</span>
          <span className="text-xs text-zinc-500">Обязательный выбор</span>
        </div>

        <div className="rounded-[22px] border border-zinc-200 bg-zinc-50/90 p-1.5">
          <div className="grid gap-1.5 sm:grid-cols-2">
          {CATALOG_PRICE_LIST_TYPES.map((priceListType) => {
            const isSelected = selectedPriceListType === priceListType;

            return (
              <button
                key={priceListType}
                type="button"
                onClick={() => setSelectedPriceListType(priceListType)}
                className={`rounded-[18px] px-4 py-3 text-left transition ${
                  isSelected
                    ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-950/10"
                    : "bg-transparent text-zinc-600 hover:bg-white/70 hover:text-zinc-950"
                }`}
                aria-pressed={isSelected}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition ${
                      isSelected
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-300 bg-white text-zinc-400"
                    }`}
                  >
                    {priceListType === "CLIENT" ? "C" : "I"}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {CATALOG_PRICE_LIST_LABELS[priceListType]}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      {priceListType === "CLIENT"
                        ? "Для клиентского прайса и внешней витрины."
                        : "Для внутренней работы и служебного прайса."}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
          </div>
        </div>
        <input name="priceListType" type="hidden" value={selectedPriceListType} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="block space-y-2.5">
          <span className="text-sm font-medium text-zinc-700">Категория</span>
          <div className="relative">
            <select
              name="category"
              value={selectedCategory}
              onChange={(event) => {
                const nextCategory = event.target.value;
                setSelectedCategory(nextCategory);
                setSelectedTechCardId("");

                if (nextCategory !== "Пиццы") {
                  setSelectedPizzaSize("");
                }
              }}
              className={`${fieldClassName} appearance-none pr-12`}
              required
            >
              <option value="">Выбери категорию</option>
              {TECH_CARD_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </label>

        <label className="block space-y-2.5">
          <span className="text-sm font-medium text-zinc-700">Цена</span>
          <div className="relative">
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={state.values.price}
              placeholder="0"
              className={`${fieldClassName} pl-11`}
              required
            />
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-zinc-500">
              ₽
            </span>
          </div>
        </label>
      </div>

      {selectedCategory === "Пиццы" ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-700">Размер пиццы</span>
            <span className="text-xs text-zinc-500">Обязательный выбор</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {TECH_CARD_PIZZA_SIZES.map((size) => {
              const isSelected = selectedPizzaSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedPizzaSize(size);
                    setSelectedTechCardId("");
                  }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:text-zinc-950"
                  }`}
                  aria-pressed={isSelected}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4">
        <label className="block space-y-2.5">
          <span className="text-sm font-medium text-zinc-700">Технологическая карта</span>
          <div className="relative">
            <select
              name="technologicalCardId"
              value={selectedTechCardId}
              onChange={(event) => {
                const nextId = event.target.value;
                setSelectedTechCardId(nextId);

                const nextTechCard =
                  techCardOptions.find((option) => String(option.id) === nextId) ?? null;

                if (selectedCategory === "Пиццы") {
                  setSelectedPizzaSize(
                    nextTechCard?.pizzaSize &&
                      TECH_CARD_PIZZA_SIZES.includes(
                        nextTechCard.pizzaSize as TechCardPizzaSize,
                      )
                      ? (nextTechCard.pizzaSize as TechCardPizzaSize)
                      : "",
                  );
                }
              }}
              className={`${fieldClassName} appearance-none pr-12`}
              required
            >
              <option value="">Выбери техкарту</option>
              {filteredTechCardOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} - {option.category}
                  {option.pizzaSize ? ` - ${option.pizzaSize}` : ""}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <p className="text-xs leading-5 text-zinc-500">
            Привязка к техкарте обязательна, чтобы прайс не расходился с производственной логикой.
            {selectedCategory === "Пиццы"
              ? " Для пиццы выбирается техкарта с конкретным размером."
              : ""}
          </p>
        </label>
      </div>

      <label className="block space-y-2.5">
        <span className="text-sm font-medium text-zinc-700">Описание</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={state.values.description}
          placeholder="Короткое описание позиции для сайта"
          className={`${fieldClassName} min-h-[9rem] resize-y`}
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
        {isPending
          ? "Сохраняем..."
          : (submitLabel ?? (mode === "edit" ? "Сохранить изменения" : "Добавить в каталог"))}
      </button>
    </form>
  );
}
