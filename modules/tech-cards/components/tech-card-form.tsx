"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/modules/inventory/inventory.types";
import {
  addTechCardAction,
  type TechCardFormState,
  updateTechCardAction,
} from "@/modules/tech-cards/tech-cards.actions";
import {
  TECH_CARD_CATEGORIES,
  type TechCardCategory,
  type TechCardItem,
  TECH_CARD_PIZZA_SIZES,
  type TechCardPizzaSize,
  type TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

const OUTPUT_UNITS = ["шт", "кг"] as const;
const TECH_CARD_INGREDIENTS_DRAFT_KEY = "food-crm:tech-card-form:ingredients";
const TECH_CARD_FORM_DRAFT_KEY = "food-crm:tech-card-form:draft";
type OutputUnit = (typeof OUTPUT_UNITS)[number];
type SelectedIngredient = {
  productId: string;
  quantity: string;
  unit: OutputUnit;
};
type TechCardDraft = {
  name: string;
  category: TechCardCategory | "";
  pizzaSize: TechCardPizzaSize | "";
  outputQuantity: string;
  outputUnit: OutputUnit;
  description: string;
};

function readTechCardIngredientsDraft() {
  if (typeof window === "undefined") {
    return [] as SelectedIngredient[];
  }

  const rawValue = window.localStorage.getItem(TECH_CARD_INGREDIENTS_DRAFT_KEY);

  if (!rawValue) {
    return [] as SelectedIngredient[];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [] as SelectedIngredient[];
    }

    return parsedValue
      .filter(
        (ingredient): ingredient is SelectedIngredient =>
          typeof ingredient === "object" &&
          ingredient !== null &&
          typeof ingredient.productId === "string" &&
          typeof ingredient.quantity === "string" &&
          (ingredient.unit === "кг" || ingredient.unit === "шт"),
      )
      .map((ingredient) => ({
        productId: ingredient.productId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }));
  } catch {
    return [] as SelectedIngredient[];
  }
}

function readTechCardFormDraft(): TechCardDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(TECH_CARD_FORM_DRAFT_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (typeof parsedValue !== "object" || parsedValue === null) {
      return null;
    }

    return {
      name: typeof parsedValue.name === "string" ? parsedValue.name : "",
      category: TECH_CARD_CATEGORIES.includes(parsedValue.category as TechCardCategory)
        ? (parsedValue.category as TechCardCategory)
        : "",
      pizzaSize: TECH_CARD_PIZZA_SIZES.includes(parsedValue.pizzaSize as TechCardPizzaSize)
        ? (parsedValue.pizzaSize as TechCardPizzaSize)
        : "",
      outputQuantity:
        typeof parsedValue.outputQuantity === "string" ? parsedValue.outputQuantity : "",
      outputUnit: parsedValue.outputUnit === "кг" ? "кг" : "шт",
      description: typeof parsedValue.description === "string" ? parsedValue.description : "",
    };
  } catch {
    return null;
  }
}

export function TechCardForm({
  products,
  clearDraft = false,
  initialTechCard,
}: {
  products: TechCardProductOption[];
  clearDraft?: boolean;
  initialTechCard?: TechCardItem;
}) {
  const initialState: TechCardFormState = {
    errorMessage: null,
    values: {
      name: initialTechCard?.name ?? "",
      category: initialTechCard?.category ?? "",
      pizzaSize: initialTechCard?.pizzaSize ?? "",
      outputQuantity: initialTechCard ? String(initialTechCard.outputQuantity) : "",
      outputUnit: initialTechCard?.outputUnit ?? "шт",
      ingredients:
        initialTechCard?.ingredients.map((ingredient) => ({
          productId: String(ingredient.productId),
          quantity: String(ingredient.quantity),
          unit: ingredient.unit,
        })) ?? [],
      description: initialTechCard?.description ?? "",
    },
  };
  const action = initialTechCard ? updateTechCardAction : addTechCardAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formStateKey = JSON.stringify(state.values);

  return (
    <TechCardFormContent
      key={formStateKey}
      products={products}
      state={state}
      formAction={formAction}
      isPending={isPending}
      clearDraft={clearDraft}
      initialTechCard={initialTechCard}
    />
  );
}

function TechCardFormContent({
  products,
  state,
  formAction,
  isPending,
  clearDraft,
  initialTechCard,
}: {
  products: TechCardProductOption[];
  state: TechCardFormState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  clearDraft: boolean;
  initialTechCard?: TechCardItem;
}) {
  const router = useRouter();
  const isEditMode = Boolean(initialTechCard);
  const [name, setName] = useState(state.values.name);
  const [selectedTechCardCategory, setSelectedTechCardCategory] = useState<TechCardCategory | "">(
    TECH_CARD_CATEGORIES.includes(state.values.category as TechCardCategory)
      ? (state.values.category as TechCardCategory)
      : "",
  );
  const [selectedPizzaSize, setSelectedPizzaSize] = useState<TechCardPizzaSize | "">(
    TECH_CARD_PIZZA_SIZES.includes(state.values.pizzaSize as TechCardPizzaSize)
      ? (state.values.pizzaSize as TechCardPizzaSize)
      : "",
  );
  const [selectedUnit, setSelectedUnit] = useState<OutputUnit>(
    state.values.outputUnit === "кг" ? "кг" : "шт",
  );
  const [outputQuantity, setOutputQuantity] = useState(state.values.outputQuantity);
  const [description, setDescription] = useState(state.values.description);
  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pendingIngredientIds, setPendingIngredientIds] = useState<string[]>([]);
  const normalizedStateIngredients = useMemo<SelectedIngredient[]>(
    () =>
      state.values.ingredients.map((ingredient) => ({
        productId: ingredient.productId,
        quantity: ingredient.quantity,
        unit: ingredient.unit === "кг" ? "кг" : "шт",
      })),
    [state.values.ingredients],
  );
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>(
    normalizedStateIngredients,
  );
  const productsById = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products],
  );
  const availableCategories = useMemo(() => {
    const categorySet = new Set(
      products
        .map((product) => product.category)
        .filter((category): category is string => Boolean(category)),
    );

    return PRODUCT_CATEGORIES.filter((category) => categorySet.has(category));
  }, [products]);
  const filteredProducts = products.filter((product) => {
    const query = ingredientQuery.trim().toLowerCase();
    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(query) ||
      product.unit.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    if (clearDraft) {
      window.localStorage.removeItem(TECH_CARD_INGREDIENTS_DRAFT_KEY);
      window.localStorage.removeItem(TECH_CARD_FORM_DRAFT_KEY);
      router.replace("/dashboard/inventory?tab=recipes", { scroll: false });
    }
  }, [clearDraft, isEditMode, router]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    if (clearDraft || normalizedStateIngredients.length > 0 || selectedIngredients.length > 0) {
      return;
    }

    const draftIngredients = readTechCardIngredientsDraft().filter((ingredient) =>
      productsById.has(ingredient.productId),
    );

    if (draftIngredients.length > 0) {
      const frameId = window.requestAnimationFrame(() => {
        setSelectedIngredients(draftIngredients);
      });

      return () => window.cancelAnimationFrame(frameId);
    }
  }, [clearDraft, isEditMode, normalizedStateIngredients.length, productsById, selectedIngredients.length]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    if (
      clearDraft ||
      state.values.name ||
      state.values.category ||
      state.values.pizzaSize ||
      state.values.outputQuantity ||
      state.values.description
    ) {
      return;
    }

    const draft = readTechCardFormDraft();

    if (!draft) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setName(draft.name);
      setSelectedTechCardCategory(draft.category);
      setSelectedPizzaSize(draft.pizzaSize);
      setOutputQuantity(draft.outputQuantity);
      setSelectedUnit(draft.outputUnit);
      setDescription(draft.description);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [
    clearDraft,
    isEditMode,
    state.values.name,
    state.values.category,
    state.values.pizzaSize,
    state.values.outputQuantity,
    state.values.description,
  ]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    if (selectedIngredients.length === 0) {
      window.localStorage.removeItem(TECH_CARD_INGREDIENTS_DRAFT_KEY);
      return;
    }

    window.localStorage.setItem(
      TECH_CARD_INGREDIENTS_DRAFT_KEY,
      JSON.stringify(selectedIngredients),
    );
  }, [isEditMode, selectedIngredients]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const draft: TechCardDraft = {
      name,
      category: selectedTechCardCategory,
      pizzaSize: selectedPizzaSize,
      outputQuantity,
      outputUnit: selectedUnit,
      description,
    };

    const hasDraft =
      draft.name ||
      draft.category ||
      draft.pizzaSize ||
      draft.outputQuantity ||
      draft.description ||
      draft.outputUnit !== "шт";

    if (!hasDraft) {
      window.localStorage.removeItem(TECH_CARD_FORM_DRAFT_KEY);
      return;
    }

    window.localStorage.setItem(TECH_CARD_FORM_DRAFT_KEY, JSON.stringify(draft));
  }, [description, isEditMode, name, outputQuantity, selectedPizzaSize, selectedTechCardCategory, selectedUnit]);

  const handleAddIngredient = (productId: string) => {
    setSelectedIngredients((current) => {
      if (current.some((ingredient) => ingredient.productId === productId)) {
        return current;
      }

      const product = productsById.get(productId);
      const defaultUnit: OutputUnit = product?.unit === "кг" ? "кг" : "шт";

      return [
        ...current,
        {
          productId,
          quantity: defaultUnit === "кг" ? "0.1" : "1",
          unit: defaultUnit,
        },
      ];
    });
  };

  const handleTogglePendingIngredient = (productId: string) => {
    setPendingIngredientIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const handleAddPendingIngredients = () => {
    if (pendingIngredientIds.length === 0) {
      return;
    }

    pendingIngredientIds.forEach((productId) => {
      handleAddIngredient(productId);
    });
    setPendingIngredientIds([]);
    setIngredientQuery("");
    setSelectedCategory("");
    setIsIngredientDialogOpen(false);
  };

  const handleIngredientQuantityChange = (productId: string, quantity: string) => {
    setSelectedIngredients((current) =>
      current.map((ingredient) =>
        ingredient.productId === productId ? { ...ingredient, quantity } : ingredient,
      ),
    );
  };

  const handleRemoveIngredient = (productId: string) => {
    setSelectedIngredients((current) =>
      current.filter((ingredient) => ingredient.productId !== productId),
    );
  };

  return (
    <div>
      <form
        action={formAction}
        className="space-y-6 rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 xl:p-7"
      >
        {initialTechCard ? <input type="hidden" name="techCardId" value={initialTechCard.id} /> : null}
        <div className="space-y-2">
          <h2 className="text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.02em] text-zinc-950">
            {initialTechCard ? "Редактирование техкарты" : "Новая техкарта"}
          </h2>
          <p className="max-w-2xl text-[15px] leading-7 text-zinc-600">
            {initialTechCard
              ? "Обнови категорию, состав и нормы расхода по каждому ингредиенту."
              : "Создай техкарту, собери состав в диалоге и задай нормы расхода по каждому ингредиенту."}
          </p>
        </div>

        {state.errorMessage ? (
          <p className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.errorMessage}
          </p>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Название техкарты</span>
          <input
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например: Пицца Маргарита 30 см"
            className="w-full rounded-[24px] border border-zinc-300 px-5 py-3.5 text-[15px] text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Категория техкарты</span>
          <div className="relative">
            <select
              name="category"
              value={selectedTechCardCategory}
              onChange={(event) => {
                const nextCategory = event.target.value as TechCardCategory | "";
                setSelectedTechCardCategory(nextCategory);

                if (nextCategory !== "Пиццы") {
                  setSelectedPizzaSize("");
                }
              }}
              className={`w-full appearance-none rounded-[24px] border px-5 py-3.5 pr-12 text-[15px] outline-none transition focus:ring-2 ${
                selectedTechCardCategory
                  ? "border-emerald-200 bg-emerald-50/60 text-zinc-950 focus:border-emerald-400 focus:ring-emerald-500/10"
                  : "border-zinc-300 bg-white text-zinc-500 focus:border-zinc-500 focus:ring-zinc-950/5"
              }`}
              required
            >
              <option value="">Выбери категорию техкарты</option>
              {TECH_CARD_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-emerald-700">
              ▾
            </span>
          </div>
        </label>

        {selectedTechCardCategory === "Пиццы" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Размер пиццы</span>
            <div className="relative">
              <select
                name="pizzaSize"
                value={selectedPizzaSize}
                onChange={(event) => setSelectedPizzaSize(event.target.value as TechCardPizzaSize | "")}
                className={`w-full appearance-none rounded-[24px] border px-5 py-3.5 pr-12 text-[15px] outline-none transition focus:ring-2 ${
                  selectedPizzaSize
                    ? "border-emerald-200 bg-emerald-50/60 text-zinc-950 focus:border-emerald-400 focus:ring-emerald-500/10"
                    : "border-zinc-300 bg-white text-zinc-500 focus:border-zinc-500 focus:ring-zinc-950/5"
                }`}
                required
              >
                <option value="">Выбери размер пиццы</option>
                {TECH_CARD_PIZZA_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-emerald-700">
                ▾
              </span>
            </div>
          </label>
        ) : (
          <input type="hidden" name="pizzaSize" value="" />
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Выход</span>
            <input
              name="outputQuantity"
              type="number"
              min="1"
              step="1"
              value={outputQuantity}
              onChange={(event) => setOutputQuantity(event.target.value)}
              placeholder="1"
              className="w-full rounded-[24px] border border-zinc-300 px-5 py-3.5 text-[15px] text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
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
                    className={`rounded-[24px] border px-4 py-3.5 text-sm font-medium transition ${
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
              onClick={() => {
                setIngredientQuery("");
                setSelectedCategory("");
                setPendingIngredientIds([]);
                setIsIngredientDialogOpen(true);
              }}
              className="rounded-[22px] bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 lg:shrink-0"
            >
              Выбрать ингредиенты
            </button>
          </div>

          {selectedIngredients.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white px-5 py-5 text-[15px] leading-7 text-zinc-500">
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
                    className="grid gap-4 rounded-[24px] border border-zinc-200 bg-white p-4 lg:grid-cols-[minmax(180px,0.82fr)_minmax(0,1.18fr)] lg:items-center"
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
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-200">
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
                            onChange={(event) =>
                              handleIngredientQuantityChange(ingredient.productId, event.target.value)
                            }
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
                          onClick={() => handleRemoveIngredient(ingredient.productId)}
                          className="w-full rounded-[20px] border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 sm:max-w-[200px]"
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

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Описание</span>
          <textarea
            name="description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Комментарий по техкарте, составу и приготовлению"
            className="w-full rounded-[24px] border border-zinc-300 px-5 py-4 text-[15px] text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[24px] bg-zinc-950 px-4 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          {isPending ? "Сохраняем..." : initialTechCard ? "Сохранить изменения" : "Добавить техкарту"}
        </button>
      </form>

      {isIngredientDialogOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/45 px-4 py-6"
          onClick={() => {
            setPendingIngredientIds([]);
            setIsIngredientDialogOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Выбор ингредиентов для технологической карты"
            className="flex max-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/25"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-zinc-200 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                    Состав техкарты
                  </p>
                  <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.02em] text-zinc-950">
                    Выбор ингредиентов
                  </h3>
                  <p className="mt-2 max-w-2xl text-[15px] leading-7 text-zinc-600">
                    Отмечай несколько позиций подряд и добавляй их в техкарту одним действием.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPendingIngredientIds([]);
                    setIsIngredientDialogOpen(false);
                  }}
                  className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Закрыть
                </button>
              </div>

              <input
                type="search"
                value={ingredientQuery}
                onChange={(event) => setIngredientQuery(event.target.value)}
                placeholder="Найти ингредиент по названию или единице"
                className="mt-4 w-full rounded-[22px] border border-zinc-300 px-4 py-3 text-[15px] text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
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
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "border border-emerald-100 bg-emerald-50/70 text-emerald-800 hover:border-emerald-200 hover:bg-emerald-100"
                      }`}
                      style={isActive ? { color: "#ffffff" } : undefined}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <div className="grid gap-3">
                {filteredProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
                    Ничего не найдено. Попробуй другой запрос.
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = selectedIngredients.some(
                      (ingredient) => ingredient.productId === String(product.id),
                    );
                    const isPendingSelected = pendingIngredientIds.includes(String(product.id));

                    return (
                      <div
                        key={product.id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-[24px] border p-4 transition ${
                          isPendingSelected
                            ? "border-emerald-300 bg-emerald-50/70"
                            : "border-zinc-200 bg-zinc-50"
                        }`}
                      >
                        <label className="flex min-w-0 flex-1 items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected || isPendingSelected}
                            disabled={isSelected}
                            onChange={() => handleTogglePendingIngredient(String(product.id))}
                            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                          <div className="space-y-1">
                            <p className="text-[17px] font-semibold leading-6 tracking-[-0.02em] text-zinc-950">
                              {product.name}
                            </p>
                            <p className="text-[13px] leading-5 text-zinc-500">
                              {product.category ? `Категория склада: ${product.category}` : "Категория склада не указана"}
                            </p>
                            <p className="text-[13px] leading-5 text-zinc-400">
                              Единица склада: {product.unit}
                            </p>
                          </div>
                        </label>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            isSelected
                              ? "bg-zinc-200 text-zinc-600"
                              : isPendingSelected
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-zinc-500 ring-1 ring-zinc-200"
                          }`}
                          style={isPendingSelected ? { color: "#ffffff" } : undefined}
                        >
                          {isSelected ? "Уже в техкарте" : isPendingSelected ? "Выбрано" : "Можно выбрать"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-6 py-4">
              <p className="text-sm text-zinc-600">
                Отмечено для добавления: <span className="font-medium text-zinc-950">{pendingIngredientIds.length}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPendingIngredientIds([])}
                  disabled={pendingIngredientIds.length === 0}
                  className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
                >
                  Сбросить выбор
                </button>
                <button
                  type="button"
                  onClick={handleAddPendingIngredients}
                  disabled={pendingIngredientIds.length === 0}
                  className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Добавить выбранные
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
