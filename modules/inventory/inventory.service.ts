import type {
  InventoryResponsibleOption,
  InventorySession,
  InventorySessionSummary,
  ProductItem,
} from "@/modules/inventory/inventory.types";
import type {
  CreateInventorySessionInput,
  InventoryAuditEntryInput,
  ProductInput,
} from "@/modules/inventory/inventory.validation";
import {
  applyInventoryAudit,
  createInventorySession,
  createProduct,
  deleteProduct,
  getInventoryResponsibleOptions,
  getInventorySessions,
  getProductById,
  getProducts,
  type InventoryAuditResult,
  updateProduct,
} from "@/modules/inventory/inventory.repository";

export async function fetchProducts(): Promise<ProductItem[]> {
  return getProducts();
}

export async function fetchInventoryResponsibleOptions(): Promise<InventoryResponsibleOption[]> {
  return getInventoryResponsibleOptions();
}

export async function fetchInventorySessions(): Promise<InventorySessionSummary[]> {
  return getInventorySessions();
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

export async function applyInventoryAuditService(
  entries: InventoryAuditEntryInput[],
): Promise<InventoryAuditResult> {
  return applyInventoryAudit(entries);
}

export async function createInventorySessionService(
  input: CreateInventorySessionInput,
): Promise<InventorySession> {
  return createInventorySession(input);
}
