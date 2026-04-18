export type TechCardIngredientItem = {
  id: number;
  productId: number;
  productName: string;
  productUnit: string;
  quantity: number;
};

export type TechCardItem = {
  id: number;
  name: string;
  outputQuantity: number;
  outputUnit: string;
  description: string | null;
  createdAt: string;
  ingredients: TechCardIngredientItem[];
};

export type TechCardProductOption = {
  id: number;
  name: string;
  unit: string;
};
