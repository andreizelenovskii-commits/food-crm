"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearTechCardDraft,
  type SelectedChoiceSlot,
  type SelectedComponent,
  type SelectedIngredient,
} from "@/modules/tech-cards/components/tech-card-draft";
import type { TechCardFormKind } from "@/modules/tech-cards/components/tech-card-form";
import {
  filterComponents,
  filterProducts,
  getAvailableProductCategories,
  normalizeStateChoiceSlots,
  normalizeStateComponents,
  normalizeStateIngredients,
} from "@/modules/tech-cards/components/tech-card-form-state-utils";
import type { OutputUnit } from "@/modules/tech-cards/components/tech-card-main-fields";
import type { TechCardFormState } from "@/modules/tech-cards/tech-cards.actions";
import {
  INGREDIENT_TECH_CARD_CATEGORY,
  TECH_CARD_CATEGORIES,
  TECH_CARD_PIZZA_SIZES,
  TECH_CARD_ROLL_SIZES,
  type TechCardCategory,
  type TechCardItem,
  type TechCardPizzaSize,
  type TechCardRollSize,
  type TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

export function useTechCardFormState({
  products,
  componentOptions,
  state,
  clearDraft,
  isEditMode,
  cardKind,
}: {
  products: TechCardProductOption[];
  componentOptions: TechCardItem[];
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
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [componentQuery, setComponentQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedComponentCategory, setSelectedComponentCategory] = useState("");
  const [pendingIngredientIds, setPendingIngredientIds] = useState<string[]>([]);
  const [pendingComponentIds, setPendingComponentIds] = useState<string[]>([]);
  const normalizedStateIngredients = useMemo<SelectedIngredient[]>(
    () =>
      normalizeStateIngredients(state.values.ingredients),
    [state.values.ingredients],
  );
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>(normalizedStateIngredients);
  const normalizedStateComponents = useMemo<SelectedComponent[]>(
    () =>
      normalizeStateComponents(state.values.components),
    [state.values.components],
  );
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>(normalizedStateComponents);
  const normalizedStateChoiceSlots = useMemo<SelectedChoiceSlot[]>(
    () =>
      normalizeStateChoiceSlots(state.values.choiceSlots),
    [state.values.choiceSlots],
  );
  const [selectedChoiceSlots, setSelectedChoiceSlots] = useState<SelectedChoiceSlot[]>(normalizedStateChoiceSlots);
  const productsById = useMemo(() => new Map(products.map((product) => [String(product.id), product])), [products]);
  const componentsById = useMemo(
    () => new Map(componentOptions.map((component) => [String(component.id), component])),
    [componentOptions],
  );
  const availableCategories = useMemo(() => {
    return getAvailableProductCategories(products);
  }, [products]);
  const filteredProducts = filterProducts(products, ingredientQuery, selectedCategory);
  const availableComponentCategories = useMemo(
    () =>
      Array.from(new Set(componentOptions.map((component) => component.category))).sort((left, right) =>
        left.localeCompare(right, "ru"),
      ),
    [componentOptions],
  );
  const filteredComponents = filterComponents(componentOptions, componentQuery, selectedComponentCategory);

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
  const handleAddComponent = (techCardId: string) => {
    setSelectedComponents((current) => {
      if (current.some((component) => component.techCardId === techCardId)) {
        return current;
      }

      return [...current, { techCardId, quantity: "1" }];
    });
  };

  const handleAddPendingComponents = () => {
    if (pendingComponentIds.length === 0) {
      return;
    }

    pendingComponentIds.forEach((techCardId) => handleAddComponent(techCardId));
    setPendingComponentIds([]);
    setComponentQuery("");
    setSelectedComponentCategory("");
    setIsComponentDialogOpen(false);
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
    isComponentDialogOpen,
    ingredientQuery,
    componentQuery,
    selectedCategory,
    selectedComponentCategory,
    pendingIngredientIds,
    pendingComponentIds,
    selectedIngredients,
    selectedComponents,
    selectedChoiceSlots,
    productsById,
    componentsById,
    availableCategories,
    availableComponentCategories,
    filteredProducts,
    filteredComponents,
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
    setComponentQuery,
    setSelectedCategory,
    setSelectedComponentCategory,
    setPendingIngredientIds,
    setPendingComponentIds,
    setIsIngredientDialogOpen,
    setIsComponentDialogOpen,
    handleAddPendingIngredients,
    handleAddPendingComponents,
    handleAddChoiceSlot: () => {
      setSelectedChoiceSlots((current) => [
        ...current,
        {
          id: `${Date.now()}-${current.length}`,
          name: "Пицца на выбор",
          category: "Пиццы",
          allowedPizzaSizes: ["26 см", "30 см"],
          quantity: "1",
        },
      ]);
    },
    handleChoiceSlotChange: (slotId: string, nextSlot: Partial<SelectedChoiceSlot>) => {
      setSelectedChoiceSlots((current) =>
        current.map((slot) => (slot.id === slotId ? { ...slot, ...nextSlot } : slot)),
      );
    },
    handleRemoveChoiceSlot: (slotId: string) => {
      setSelectedChoiceSlots((current) => current.filter((slot) => slot.id !== slotId));
    },
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
    handleTogglePendingComponent: (techCardId: string) => {
      setPendingComponentIds((current) =>
        current.includes(techCardId)
          ? current.filter((id) => id !== techCardId)
          : [...current, techCardId],
      );
    },
    handleComponentQuantityChange: (techCardId: string, quantity: string) => {
      setSelectedComponents((current) =>
        current.map((component) =>
          component.techCardId === techCardId ? { ...component, quantity } : component,
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
    handleRemoveComponent: (techCardId: string) => {
      const normalizedTechCardId = String(techCardId);

      setSelectedComponents((current) =>
        current.filter((component) => String(component.techCardId) !== normalizedTechCardId),
      );
      setPendingComponentIds((current) => current.filter((id) => String(id) !== normalizedTechCardId));
    },
  };
}
