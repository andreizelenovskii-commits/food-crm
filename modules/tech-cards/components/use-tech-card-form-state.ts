"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/modules/inventory/inventory.types";
import {
  clearTechCardDraft,
  type SelectedIngredient,
} from "@/modules/tech-cards/components/tech-card-draft";
import type { TechCardFormKind } from "@/modules/tech-cards/components/tech-card-form";
import type { OutputUnit } from "@/modules/tech-cards/components/tech-card-main-fields";
import type { TechCardFormState } from "@/modules/tech-cards/tech-cards.actions";
import {
  INGREDIENT_TECH_CARD_CATEGORY,
  TECH_CARD_CATEGORIES,
  TECH_CARD_PIZZA_SIZES,
  TECH_CARD_ROLL_SIZES,
  type TechCardCategory,
  type TechCardPizzaSize,
  type TechCardRollSize,
  type TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

export function useTechCardFormState({
  products,
  state,
  clearDraft,
  isEditMode,
  cardKind,
}: {
  products: TechCardProductOption[];
  state: TechCardFormState;
  clearDraft: boolean;
  isEditMode: boolean;
  cardKind: TechCardFormKind;
}) {
  const router = useRouter();
  const [name, setName] = useState(state.values.name);
  const [selectedTechCardCategory, setSelectedTechCardCategory] = useState<TechCardCategory | "">(
    cardKind === "ingredient"
      ? INGREDIENT_TECH_CARD_CATEGORY
      : TECH_CARD_CATEGORIES.includes(state.values.category as TechCardCategory)
      ? (state.values.category as TechCardCategory)
      : "",
  );
  const [selectedPizzaSize, setSelectedPizzaSize] = useState<TechCardPizzaSize | "">(
    TECH_CARD_PIZZA_SIZES.includes(state.values.pizzaSize as TechCardPizzaSize)
      ? (state.values.pizzaSize as TechCardPizzaSize)
      : "",
  );
  const [selectedRollSize, setSelectedRollSize] = useState<TechCardRollSize | "">(
    TECH_CARD_ROLL_SIZES.includes(state.values.rollSize as TechCardRollSize)
      ? (state.values.rollSize as TechCardRollSize)
      : "",
  );
  const [selectedUnit, setSelectedUnit] = useState<OutputUnit>(
    state.values.outputUnit === "кг" ? "кг" : "шт",
  );
  const [outputQuantity, setOutputQuantity] = useState(state.values.outputQuantity);
  const [autoCreatePizzaVariants, setAutoCreatePizzaVariants] = useState(state.values.autoCreatePizzaVariants !== "false");
  const [autoCreateRollVariants, setAutoCreateRollVariants] = useState(state.values.autoCreateRollVariants !== "false");
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
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>(normalizedStateIngredients);
  const productsById = useMemo(() => new Map(products.map((product) => [String(product.id), product])), [products]);
  const availableCategories = useMemo(() => {
    const categorySet = new Set(products.map((product) => product.category).filter((category): category is string => Boolean(category)));

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

    return product.name.toLowerCase().includes(query) || product.unit.toLowerCase().includes(query) || product.category?.toLowerCase().includes(query);
  });

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    clearTechCardDraft();

    if (clearDraft) {
      router.replace("/dashboard/inventory?tab=recipes", { scroll: false });
    }
  }, [clearDraft, isEditMode, router]);

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
    selectedRollSize,
    autoCreatePizzaVariants,
    autoCreateRollVariants,
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
    setSelectedRollSize,
    setAutoCreatePizzaVariants,
    setAutoCreateRollVariants,
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
      const normalizedProductId = String(productId);

      setSelectedIngredients((current) =>
        current.filter((ingredient) => String(ingredient.productId) !== normalizedProductId),
      );
      setPendingIngredientIds((current) => current.filter((id) => String(id) !== normalizedProductId));
    },
  };
}
