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
  type TechCardItem,
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
  const isEditMode = Boolean(initialTechCard);
  const form = useTechCardFormState({ products, state, clearDraft, isEditMode });

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
