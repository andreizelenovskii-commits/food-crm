export type PublicMenuChoiceSelection = {
  choiceSlotId: number;
  position: number;
  selectedCatalogItemId: number;
  selectedCatalogItemVariantId?: number;
};

export function choiceKey(choiceSlotId: number, position: number) {
  return `${choiceSlotId}:${position}`;
}

export function getChoiceSlotSelectionCount(quantity: number) {
  return Number.isInteger(quantity) && quantity > 1 ? quantity : 1;
}

export function cartKey(
  itemId: number,
  variantId: number,
  excludedIngredientIds: number[] = [],
  choices: PublicMenuChoiceSelection[] = [],
) {
  const exclusions = [...excludedIngredientIds].sort((left, right) => left - right).join(".");
  const selectedChoices = [...choices]
    .sort((left, right) => left.choiceSlotId - right.choiceSlotId || left.position - right.position)
    .map((choice) => `${choice.choiceSlotId}.${choice.position}.${choice.selectedCatalogItemId}`)
    .join(".");

  return `${itemId}:${variantId}:${exclusions}:${selectedChoices}`;
}
