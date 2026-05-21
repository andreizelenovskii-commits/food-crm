"use client";

import { useActionState } from "react";
import { TechCardFormFooter } from "@/modules/tech-cards/components/tech-card-form-footer";
import { TechCardFormHeader } from "@/modules/tech-cards/components/tech-card-form-header";
import { TechCardComponentDialog } from "@/modules/tech-cards/components/tech-card-component-dialog";
import { TechCardComponentsSection } from "@/modules/tech-cards/components/tech-card-components-section";
import { TechCardIngredientDialog } from "@/modules/tech-cards/components/tech-card-ingredient-dialog";
import { TechCardIngredientsSection } from "@/modules/tech-cards/components/tech-card-ingredients-section";
import { TechCardMainFields } from "@/modules/tech-cards/components/tech-card-main-fields";
import { useTechCardFormState } from "@/modules/tech-cards/components/use-tech-card-form-state";
import {
  addTechCardAction,
  type TechCardFormState,
  updateTechCardAction,
} from "@/modules/tech-cards/tech-cards.actions";
import {
  INGREDIENT_TECH_CARD_CATEGORY,
  COMPOSITE_TECH_CARD_CATEGORIES,
  type TechCardItem,
  type TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

export type TechCardFormKind = "price" | "ingredient" | "composite";

export function TechCardForm({
  products,
  componentOptions = [],
  clearDraft = false,
  initialTechCard,
  cardKind = resolveTechCardFormKind(initialTechCard),
}: {
  products: TechCardProductOption[];
  componentOptions?: TechCardItem[];
  clearDraft?: boolean;
  initialTechCard?: TechCardItem;
  cardKind?: TechCardFormKind;
}) {
  const initialState: TechCardFormState = {
    errorMessage: null,
    values: {
      name: initialTechCard?.name ?? "",
      category: initialTechCard?.category ?? (cardKind === "ingredient" ? INGREDIENT_TECH_CARD_CATEGORY : ""),
      pizzaSize: initialTechCard?.pizzaSize ?? "",
      rollSize: initialTechCard?.rollSize ?? "",
      autoCreatePizzaVariants: "true",
      autoCreateRollVariants: "true",
      outputQuantity: initialTechCard ? String(initialTechCard.outputQuantity) : "",
      outputUnit: initialTechCard?.outputUnit ?? "шт",
      ingredients:
        initialTechCard?.ingredients.map((ingredient) => ({
          productId: String(ingredient.productId),
          quantity: String(ingredient.quantity),
          unit: ingredient.unit,
        })) ?? [],
      components:
        initialTechCard?.components.map((component) => ({
          techCardId: String(component.techCardId),
          quantity: String(component.quantity),
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
      componentOptions={componentOptions}
      state={state}
      formAction={formAction}
      isPending={isPending}
      clearDraft={clearDraft}
      initialTechCard={initialTechCard}
      cardKind={cardKind}
    />
  );
}

function TechCardFormContent({
  products,
  componentOptions,
  state,
  formAction,
  isPending,
  clearDraft,
  initialTechCard,
  cardKind,
}: {
  products: TechCardProductOption[];
  componentOptions: TechCardItem[];
  state: TechCardFormState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  clearDraft: boolean;
  initialTechCard?: TechCardItem;
  cardKind: TechCardFormKind;
}) {
  const isEditMode = Boolean(initialTechCard);
  const form = useTechCardFormState({ products, componentOptions, state, clearDraft, isEditMode, cardKind });

  return (
    <div>
      <form
        action={formAction}
        className="space-y-4 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5"
      >
        {initialTechCard ? <input type="hidden" name="techCardId" value={initialTechCard.id} /> : null}
        <TechCardFormHeader
          isEditMode={Boolean(initialTechCard)}
          errorMessage={state.errorMessage}
          cardKind={cardKind}
        />

        <TechCardMainFields
          name={form.name}
          category={form.selectedTechCardCategory}
          pizzaSize={form.selectedPizzaSize}
          rollSize={form.selectedRollSize}
          autoCreatePizzaVariants={form.autoCreatePizzaVariants}
          autoCreateRollVariants={form.autoCreateRollVariants}
          outputQuantity={form.outputQuantity}
          outputUnit={form.selectedUnit}
          onNameChange={form.setName}
          onCategoryChange={form.setSelectedTechCardCategory}
          onPizzaSizeChange={form.setSelectedPizzaSize}
          onRollSizeChange={form.setSelectedRollSize}
          onAutoCreatePizzaVariantsChange={form.setAutoCreatePizzaVariants}
          onAutoCreateRollVariantsChange={form.setAutoCreateRollVariants}
          onOutputQuantityChange={form.setOutputQuantity}
          onOutputUnitChange={form.setSelectedUnit}
          cardKind={cardKind}
          isEditMode={isEditMode}
        />
        <TechCardIngredientsSection
          selectedIngredients={form.selectedIngredients}
          productsById={form.productsById}
          outputQuantity={form.outputQuantity}
          outputUnit={form.selectedUnit}
          isVisible={cardKind !== "composite"}
          onOpenDialog={() => {
            form.setIngredientQuery("");
            form.setSelectedCategory("");
            form.setPendingIngredientIds([]);
            form.setIsIngredientDialogOpen(true);
          }}
          onQuantityChange={form.handleIngredientQuantityChange}
          onRemove={form.handleRemoveIngredient}
        />
        <TechCardComponentsSection
          selectedComponents={form.selectedComponents}
          componentsById={form.componentsById}
          outputQuantity={form.outputQuantity}
          outputUnit={form.selectedUnit}
          isVisible={cardKind === "composite"}
          onOpenDialog={() => {
            form.setComponentQuery("");
            form.setSelectedComponentCategory("");
            form.setPendingComponentIds([]);
            form.setIsComponentDialogOpen(true);
          }}
          onQuantityChange={form.handleComponentQuantityChange}
          onRemove={form.handleRemoveComponent}
        />
        <TechCardFormFooter
          isPending={isPending}
          isEditMode={Boolean(initialTechCard)}
        />
      </form>

      {form.isIngredientDialogOpen ? (
        <TechCardIngredientDialog
          ingredientQuery={form.ingredientQuery}
          selectedCategory={form.selectedCategory}
          availableCategories={form.availableCategories}
          filteredProducts={form.filteredProducts}
          selectedIngredients={form.selectedIngredients}
          pendingIngredientIds={form.pendingIngredientIds}
          onQueryChange={form.setIngredientQuery}
          onCategoryChange={form.setSelectedCategory}
          onTogglePending={form.handleTogglePendingIngredient}
          onRemoveSelected={form.handleRemoveIngredient}
          onResetPending={() => form.setPendingIngredientIds([])}
          onAddPending={form.handleAddPendingIngredients}
          onClose={() => {
            form.setPendingIngredientIds([]);
            form.setIsIngredientDialogOpen(false);
          }}
        />
      ) : null}
      {form.isComponentDialogOpen ? (
        <TechCardComponentDialog
          componentQuery={form.componentQuery}
          selectedCategory={form.selectedComponentCategory}
          availableCategories={form.availableComponentCategories}
          filteredComponents={form.filteredComponents}
          selectedComponents={form.selectedComponents}
          pendingComponentIds={form.pendingComponentIds}
          onQueryChange={form.setComponentQuery}
          onCategoryChange={form.setSelectedComponentCategory}
          onTogglePending={form.handleTogglePendingComponent}
          onRemoveSelected={form.handleRemoveComponent}
          onResetPending={() => form.setPendingComponentIds([])}
          onAddPending={form.handleAddPendingComponents}
          onClose={() => {
            form.setPendingComponentIds([]);
            form.setIsComponentDialogOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function resolveTechCardFormKind(initialTechCard?: TechCardItem): TechCardFormKind {
  if (initialTechCard?.category === INGREDIENT_TECH_CARD_CATEGORY) {
    return "ingredient";
  }

  if (
    initialTechCard?.category &&
    COMPOSITE_TECH_CARD_CATEGORIES.includes(initialTechCard.category as never)
  ) {
    return "composite";
  }

  return "price";
}
