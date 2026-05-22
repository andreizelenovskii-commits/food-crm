export type CatalogFormValues = {
  name: string;
  priceListType: string;
  category: string;
  kitchenZone: string;
  description: string;
  imageUrl: string;
  price: string;
  technologicalCardId: string;
  variants: string;
};

export type CatalogFormState = {
  errorMessage: string | null;
  values: CatalogFormValues;
};
