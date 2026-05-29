export type CatalogFormValues = {
  name: string;
  priceListType: string;
  category: string;
  kitchenZone: string;
  kitchenZones: string;
  description: string;
  imageUrl: string;
  price: string;
  technologicalCardId: string;
  variants: string;
  excludedIngredients: string;
};

export type CatalogFormState = {
  errorMessage: string | null;
  values: CatalogFormValues;
};
