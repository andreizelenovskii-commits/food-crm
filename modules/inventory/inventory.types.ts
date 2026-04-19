export const PRODUCT_CATEGORIES = [
  "Молокосодержащая продукция",
  "Мясная и куриная продукция",
  "Соуса",
  "Сиропы",
  "Овощи и фрукты",
  "Колбасная продукция",
  "Морепродукты",
  "Приправы и специи",
  "Упаковка",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type ProductItem = {
  id: number;
  name: string;
  sku: string | null;
  category: ProductCategory | null;
  unit: string;
  stockQuantity: number;
  priceCents: number;
  description: string | null;
  orderItemsCount: number;
  createdAt: string;
};
