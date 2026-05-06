"use client";

import { useActionState } from "react";
import { TechCardFormFooter } from "@/modules/tech-cards/components/tech-card-form-footer";
import { TechCardFormHeader } from "@/modules/tech-cards/components/tech-card-form-header";
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
  type TechCardItem,
  type TechCardProductOption,
} from "@/modules/tech-cards/tech-cards.types";

export type TechCardFormKind = "price" | "ingredient";

export function TechCardForm({
  products,
  clearDraft = false,
  initialTechCard,
  cardKind = initialTechCard?.category === INGREDIENT_TECH_CARD_CATEGORY ? "ingredient" : "price",
}: {
  products: TechCardProductOption[];
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
      cardKind={cardKind}
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
  cardKind,
}: {
  products: TechCardProductOption[];
  state: TechCardFormState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  clearDraft: boolean;
  initialTechCard?: TechCardItem;
  cardKind: TechCardFormKind;
}) {
  const isEditMode = Boolean(initialTechCard);
  const form = useTechCardFormState({ products, state, clearDraft, isEditMode, cardKind });

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
          outputQuantity={form.outputQuantity}
          outputUnit={form.selectedUnit}
          onNameChange={form.setName}
          onCategoryChange={form.setSelectedTechCardCategory}
          onPizzaSizeChange={form.setSelectedPizzaSize}
          onOutputQuantityChange={form.setOutputQuantity}
          onOutputUnitChange={form.setSelectedUnit}
          cardKind={cardKind}
        />
        <TechCardIngredientsSection
          selectedIngredients={form.selectedIngredients}
          productsById={form.productsById}
          onOpenDialog={() => {
            form.setIngredientQuery("");
            form.setSelectedCategory("");
            form.setPendingIngredientIds([]);
            form.setIsIngredientDialogOpen(true);
          }}
          onQuantityChange={form.handleIngredientQuantityChange}
          onRemove={form.handleRemoveIngredient}
        />
        <TechCardFormFooter
          description={form.description}
          isPending={isPending}
          isEditMode={Boolean(initialTechCard)}
          onDescriptionChange={form.setDescription}
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
          onResetPending={() => form.setPendingIngredientIds([])}
          onAddPending={form.handleAddPendingIngredients}
          onClose={() => {
            form.setPendingIngredientIds([]);
            form.setIsIngredientDialogOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
