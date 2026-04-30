export type CatalogFormValues = {
  name: string;
  priceListType: string;
  category: string;
  description: string;
  imageUrl: string;
  price: string;
  technologicalCardId: string;
};

export type CatalogFormState = {
  errorMessage: string | null;
  values: CatalogFormValues;
};
