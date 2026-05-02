"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/modules/inventory/inventory.types";
import {
  TECH_CARD_FORM_DRAFT_KEY,
  TECH_CARD_INGREDIENTS_DRAFT_KEY,
  type SelectedIngredient,
  type TechCardDraft,
  readTechCardFormDraft,
  readTechCardIngredientsDraft,
} from "@/modules/tech-cards/components/tech-card-draft";
import { TechCardFormFooter } from "@/modules/tech-cards/components/tech-card-form-footer";
import { TechCardFormHeader } from "@/modules/tech-cards/components/tech-card-form-header";
import { TechCardIngredientDialog } from "@/modules/tech-cards/components/tech-card-ingredient-dialog";
import { TechCardIngredientsSection } from "@/modules/tech-cards/components/tech-card-ingredients-section";
import { TechCardMainFields, type OutputUnit } from "@/modules/tech-cards/components/tech-card-main-fields";
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
        className="space-y-5 rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:p-5"
      >
        {initialTechCard ? <input type="hidden" name="techCardId" value={initialTechCard.id} /> : null}
        <TechCardFormHeader
          isEditMode={Boolean(initialTechCard)}
          errorMessage={state.errorMessage}
        />

        <TechCardMainFields
          name={name}
          category={selectedTechCardCategory}
          pizzaSize={selectedPizzaSize}
          outputQuantity={outputQuantity}
          outputUnit={selectedUnit}
          onNameChange={setName}
          onCategoryChange={setSelectedTechCardCategory}
          onPizzaSizeChange={setSelectedPizzaSize}
          onOutputQuantityChange={setOutputQuantity}
          onOutputUnitChange={setSelectedUnit}
        />
        <TechCardIngredientsSection
          selectedIngredients={selectedIngredients}
          productsById={productsById}
          onOpenDialog={() => {
            setIngredientQuery("");
            setSelectedCategory("");
            setPendingIngredientIds([]);
            setIsIngredientDialogOpen(true);
          }}
          onQuantityChange={handleIngredientQuantityChange}
          onRemove={handleRemoveIngredient}
        />
        <TechCardFormFooter
          description={description}
          isPending={isPending}
          isEditMode={Boolean(initialTechCard)}
          onDescriptionChange={setDescription}
        />
      </form>

      {isIngredientDialogOpen ? (
        <TechCardIngredientDialog
          ingredientQuery={ingredientQuery}
          selectedCategory={selectedCategory}
          availableCategories={availableCategories}
          filteredProducts={filteredProducts}
          selectedIngredients={selectedIngredients}
          pendingIngredientIds={pendingIngredientIds}
          onQueryChange={setIngredientQuery}
          onCategoryChange={setSelectedCategory}
          onTogglePending={handleTogglePendingIngredient}
          onResetPending={() => setPendingIngredientIds([])}
          onAddPending={handleAddPendingIngredients}
          onClose={() => {
            setPendingIngredientIds([]);
            setIsIngredientDialogOpen(false);
          }}
        />
      ) : null}    </div>
  );
}
