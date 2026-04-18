import type { ProductItem } from "@/modules/inventory/inventory.types";
import type { ProductInput } from "@/modules/inventory/inventory.validation";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "@/modules/inventory/inventory.repository";

export async function fetchProducts(): Promise<ProductItem[]> {
  return getProducts();
}

export async function fetchProductById(productId: number): Promise<ProductItem | null> {
  return getProductById(productId);
}

export async function addProduct(input: ProductInput): Promise<ProductItem> {
  return createProduct(input);
}

export async function updateProductService(
  productId: number,
  input: ProductInput,
): Promise<ProductItem | null> {
  return updateProduct(productId, input);
}

export async function deleteProductService(productId: number): Promise<boolean> {
  return deleteProduct(productId);
}
