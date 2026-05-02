"use client";

import { parseCreateIncomingActInput } from "@/modules/inventory/inventory.validation";
import type { ProductFormValues } from "@/modules/inventory/actions/inventory-action.types";

type IncomingActInput = ReturnType<typeof parseCreateIncomingActInput>;

export function getProductFormValues(formData: FormData): ProductFormValues {
  const read = (name: string) => String(formData.get(name) ?? "").trim();

  return {
    name: read("name"),
    category: read("category"),
    unit: read("unit"),
    stockQuantity: read("stockQuantity"),
    price: read("price"),
    description: read("description"),
  };
}

export function getEmptyProductFormValues(): ProductFormValues {
  return {
    name: "",
    category: "",
    unit: "",
    stockQuantity: "",
    price: "",
    description: "",
  };
}

export function toIncomingActApiBody(input: IncomingActInput) {
  return {
    responsibleEmployeeId: input.responsibleEmployeeId,
    supplierName: input.supplierName,
    notes: input.notes,
    items: input.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.priceCents / 100,
    })),
  };
}
