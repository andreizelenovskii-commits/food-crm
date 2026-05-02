"use client";

import { browserBackendJson } from "@/shared/api/browser-backend";
import { ValidationError } from "@/shared/errors/app-error";
import { parseProductInput } from "@/modules/inventory/inventory.validation";
import {
  getEmptyProductFormValues,
  getProductFormValues,
} from "@/modules/inventory/actions/inventory-action.shared";
import type { ProductFormState } from "@/modules/inventory/actions/inventory-action.types";

export async function addProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    parseProductInput(formData);
    await browserBackendJson("/api/v1/inventory/products", {
      body: getProductFormValues(formData),
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        successMessage: null,
        values: getProductFormValues(formData),
      };
    }

    throw error;
  }

  return {
    errorMessage: null,
    successMessage: "Товар добавлен.",
    values: getEmptyProductFormValues(),
  };
}

export async function submitAddProductAction(
  formData: FormData,
): Promise<ProductFormState> {
  return addProductAction(
    {
      errorMessage: null,
      successMessage: null,
      values: getEmptyProductFormValues(),
    },
    formData,
  );
}

export async function updateProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const productId = Number(String(formData.get("productId") ?? "").trim());

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      errorMessage: "Товар не найден",
      successMessage: null,
      values: getProductFormValues(formData),
    };
  }

  try {
    parseProductInput(formData);
    await browserBackendJson(`/api/v1/inventory/products/${productId}`, {
      method: "PATCH",
      body: getProductFormValues(formData),
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        successMessage: null,
        values: getProductFormValues(formData),
      };
    }

    throw error;
  }

  window.location.assign("/dashboard/inventory");
  return {
    errorMessage: null,
    successMessage: null,
    values: getProductFormValues(formData),
  };
}

export async function deleteProductAction(formData: FormData) {
  const productId = Number(String(formData.get("productId") ?? "").trim());
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard/inventory").trim();

  if (Number.isInteger(productId) && productId > 0) {
    await browserBackendJson(`/api/v1/inventory/products/${productId}`, {
      method: "DELETE",
    });
  }

  return {
    redirectTo: redirectTo || "/dashboard/inventory",
  };
}
