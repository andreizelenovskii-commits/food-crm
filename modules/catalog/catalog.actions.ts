"use client";

import { ValidationError } from "@/shared/errors/app-error";
import { parseCatalogItemInput } from "@/modules/catalog/catalog.validation";
import { browserBackendFormData, browserBackendJson } from "@/shared/api/browser-backend";
import type { CatalogFormState, CatalogFormValues } from "@/modules/catalog/catalog.form-types";

function getCatalogFormValues(formData: FormData): CatalogFormValues {
  const read = (name: string) => String(formData.get(name) ?? "").trim();

  return {
    name: read("name"),
    priceListType: read("priceListType"),
    category: read("category"),
    description: read("description"),
    imageUrl: read("imageUrl"),
    price: read("price"),
    technologicalCardId: read("technologicalCardId"),
  };
}

export async function addCatalogItemAction(
  _previousState: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  try {
    const input = parseCatalogItemInput(formData);
    await browserBackendJson("/api/v1/catalog", {
      body: {
        ...getCatalogFormValues(formData),
        price: String(input.priceCents / 100),
      },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        values: getCatalogFormValues(formData),
      };
    }

    throw error;
  }

  window.location.assign("/dashboard/catalog");
  return { errorMessage: null, values: getCatalogFormValues(formData) };
}

export async function updateCatalogItemAction(
  _previousState: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const catalogItemId = Number(String(formData.get("catalogItemId") ?? "").trim());

  if (!Number.isInteger(catalogItemId) || catalogItemId <= 0) {
    return {
      errorMessage: "Позиция каталога не найдена",
      values: getCatalogFormValues(formData),
    };
  }

  try {
    const input = parseCatalogItemInput(formData);
    await browserBackendJson(`/api/v1/catalog/${catalogItemId}`, {
      method: "PATCH",
      body: {
        ...getCatalogFormValues(formData),
        price: String(input.priceCents / 100),
      },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        values: getCatalogFormValues(formData),
      };
    }

    throw error;
  }

  window.location.assign("/dashboard/catalog");
  return { errorMessage: null, values: getCatalogFormValues(formData) };
}

export async function deleteCatalogItemAction(formData: FormData) {
  const catalogItemId = Number(String(formData.get("catalogItemId") ?? "").trim());
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard/catalog").trim();

  if (Number.isInteger(catalogItemId) && catalogItemId > 0) {
    await browserBackendJson(`/api/v1/catalog/${catalogItemId}`, {
      method: "DELETE",
    });
  }

  return {
    redirectTo: redirectTo || "/dashboard/catalog",
  };
}

export async function uploadCatalogImageAction(formData: FormData) {
  return browserBackendFormData<{
    filename: string;
    originalFilename: string;
    imageUrl: string;
  }>("/api/v1/catalog/uploads", formData);
}
