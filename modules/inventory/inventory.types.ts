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

export type InventoryResponsibleOption = {
  id: number;
  name: string;
  role: string;
};

export type InventorySessionItem = {
  id: number;
  productId: number;
  productName: string;
  productCategory: string | null;
  productUnit: string;
  stockQuantity: number;
};

export type InventorySessionItemSummary = {
  id: number;
  productId: number;
  productName: string;
  productCategory: string | null;
  productUnit: string;
  stockQuantity: number;
};

export type InventorySession = {
  id: number;
  responsibleEmployeeId: number;
  responsibleEmployeeName: string;
  responsibleEmployeeRole: string;
  notes: string | null;
  createdAt: string;
  items: InventorySessionItem[];
};

export type InventorySessionSummary = {
  id: number;
  responsibleEmployeeId: number;
  responsibleEmployeeName: string;
  responsibleEmployeeRole: string;
  notes: string | null;
  createdAt: string;
  itemsCount: number;
  totalQuantity: number;
  categories: string[];
  items: InventorySessionItemSummary[];
};
