"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { OutputUnit } from "@/modules/tech-cards/components/tech-card-main-fields";
import type { TechCardFormState } from "@/modules/tech-cards/tech-cards.actions";
import {
  TECH_CARD_CATEGORIES,
  TECH_CARD_PIZZA_SIZES,
  type TechCardCategory,
  type TechCardPizzaSize,
  type TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

export function useTechCardFormState({
  products,
  state,
  clearDraft,
  isEditMode,
}: {
  products: TechCardProductOption[];
  state: TechCardFormState;
  clearDraft: boolean;
  isEditMode: boolean;
}) {
  const router = useRouter();
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
    if (
      isEditMode ||
      clearDraft ||
      normalizedStateIngredients.length > 0 ||
      selectedIngredients.length > 0
    ) {
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
    if (
      isEditMode ||
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
        { productId, quantity: defaultUnit === "кг" ? "0.1" : "1", unit: defaultUnit },
      ];
    });
  };

  const handleAddPendingIngredients = () => {
    if (pendingIngredientIds.length === 0) {
      return;
    }

    pendingIngredientIds.forEach((productId) => handleAddIngredient(productId));
    setPendingIngredientIds([]);
    setIngredientQuery("");
    setSelectedCategory("");
    setIsIngredientDialogOpen(false);
  };

  return {
    name,
    selectedTechCardCategory,
    selectedPizzaSize,
    selectedUnit,
    outputQuantity,
    description,
    isIngredientDialogOpen,
    ingredientQuery,
    selectedCategory,
    pendingIngredientIds,
    selectedIngredients,
    productsById,
    availableCategories,
    filteredProducts,
    setName,
    setSelectedTechCardCategory,
    setSelectedPizzaSize,
    setSelectedUnit,
    setOutputQuantity,
    setDescription,
    setIngredientQuery,
    setSelectedCategory,
    setPendingIngredientIds,
    setIsIngredientDialogOpen,
    handleAddPendingIngredients,
    handleTogglePendingIngredient: (productId: string) => {
      setPendingIngredientIds((current) =>
        current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId],
      );
    },
    handleIngredientQuantityChange: (productId: string, quantity: string) => {
      setSelectedIngredients((current) =>
        current.map((ingredient) =>
          ingredient.productId === productId ? { ...ingredient, quantity } : ingredient,
        ),
      );
    },
    handleRemoveIngredient: (productId: string) => {
      setSelectedIngredients((current) =>
        current.filter((ingredient) => ingredient.productId !== productId),
      );
    },
  };
}
