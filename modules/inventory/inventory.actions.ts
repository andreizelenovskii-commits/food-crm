"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";
import { ValidationError } from "@/shared/errors/app-error";
import {
  addProduct,
  deleteProductService,
  updateProductService,
} from "@/modules/inventory/inventory.service";
import { parseProductInput } from "@/modules/inventory/inventory.validation";

export type ProductFormValues = {
  name: string;
  sku: string;
  unit: string;
  stockQuantity: string;
  price: string;
  description: string;
};

export type ProductFormState = {
  errorMessage: string | null;
  values: ProductFormValues;
};

function getProductFormValues(formData: FormData): ProductFormValues {
  const read = (name: string) => String(formData.get(name) ?? "").trim();

  return {
    name: read("name"),
    sku: read("sku"),
    unit: read("unit"),
    stockQuantity: read("stockQuantity"),
    price: read("price"),
    description: read("description"),
  };
}

export async function addProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requirePermission("manage_inventory");

  try {
    const input = parseProductInput(formData);
    await addProduct(input);
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        values: getProductFormValues(formData),
      };
    }

    throw error;
  }

  redirect("/dashboard/inventory");
}

export async function updateProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requirePermission("manage_inventory");
  const productId = Number(String(formData.get("productId") ?? "").trim());

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      errorMessage: "Товар не найден",
      values: getProductFormValues(formData),
    };
  }

  try {
    const input = parseProductInput(formData);
    const updated = await updateProductService(productId, input);

    if (!updated) {
      return {
        errorMessage: "Товар не найден",
        values: getProductFormValues(formData),
      };
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        values: getProductFormValues(formData),
      };
    }

    throw error;
  }

  redirect("/dashboard/inventory");
}

export async function deleteProductAction(formData: FormData) {
  await requirePermission("manage_inventory");
  const productId = Number(String(formData.get("productId") ?? "").trim());

  if (Number.isInteger(productId) && productId > 0) {
    await deleteProductService(productId);
  }

  redirect("/dashboard/inventory");
}
