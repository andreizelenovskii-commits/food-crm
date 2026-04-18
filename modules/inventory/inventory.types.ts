export type ProductItem = {
  id: number;
  name: string;
  sku: string | null;
  unit: string;
  stockQuantity: number;
  priceCents: number;
  description: string | null;
  orderItemsCount: number;
  createdAt: string;
};
