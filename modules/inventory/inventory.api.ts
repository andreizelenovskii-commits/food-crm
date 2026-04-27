import type {
  IncomingActSummary,
  InventoryResponsibleOption,
  InventorySessionSummary,
  ProductItem,
  WriteoffActSummary,
} from "@/modules/inventory/inventory.types";
import { backendGet } from "@/shared/api/backend";

export async function fetchProducts(): Promise<ProductItem[]> {
  return backendGet<ProductItem[]>("/api/v1/inventory/products");
}

export async function fetchInventoryResponsibleOptions(): Promise<InventoryResponsibleOption[]> {
  return backendGet<InventoryResponsibleOption[]>("/api/v1/inventory/responsible-options");
}

export async function fetchIncomingActs(): Promise<IncomingActSummary[]> {
  return backendGet<IncomingActSummary[]>("/api/v1/inventory/incoming-acts");
}

export async function fetchIncomingActById(actId: number): Promise<IncomingActSummary | null> {
  return backendGet<IncomingActSummary | null>(`/api/v1/inventory/incoming-acts/${actId}`);
}

export async function fetchInventorySessions(): Promise<InventorySessionSummary[]> {
  return backendGet<InventorySessionSummary[]>("/api/v1/inventory/sessions");
}

export async function fetchInventorySessionById(sessionId: number): Promise<InventorySessionSummary | null> {
  return backendGet<InventorySessionSummary | null>(`/api/v1/inventory/sessions/${sessionId}`);
}

export async function fetchWriteoffActs(): Promise<WriteoffActSummary[]> {
  return backendGet<WriteoffActSummary[]>("/api/v1/inventory/writeoff-acts");
}

export async function fetchProductById(productId: number): Promise<ProductItem | null> {
  return backendGet<ProductItem | null>(`/api/v1/inventory/products/${productId}`);
}
