"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";
import { ValidationError } from "@/shared/errors/app-error";
import {
  addCatalogItem,
  deleteCatalogItemById,
  updateCatalogItemById,
} from "@/modules/catalog/catalog.service";
import { parseCatalogItemInput } from "@/modules/catalog/catalog.validation";

export type CatalogFormValues = {
  name: string;
  priceListType: string;
  category: string;
  description: string;
  price: string;
  technologicalCardId: string;
};

export type CatalogFormState = {
  errorMessage: string | null;
  values: CatalogFormValues;
};

function getCatalogFormValues(formData: FormData): CatalogFormValues {
  const read = (name: string) => String(formData.get(name) ?? "").trim();

  return {
    name: read("name"),
    priceListType: read("priceListType"),
    category: read("category"),
    description: read("description"),
    price: read("price"),
    technologicalCardId: read("technologicalCardId"),
  };
}

export async function addCatalogItemAction(
  _previousState: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  await requirePermission("manage_catalog");

  try {
    const input = parseCatalogItemInput(formData);
    await addCatalogItem(input);
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        values: getCatalogFormValues(formData),
      };
    }

    throw error;
  }

  redirect("/dashboard/catalog");
}

export async function updateCatalogItemAction(
  _previousState: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  await requirePermission("manage_catalog");

  const catalogItemId = Number(String(formData.get("catalogItemId") ?? "").trim());

  if (!Number.isInteger(catalogItemId) || catalogItemId <= 0) {
    return {
      errorMessage: "Позиция каталога не найдена",
      values: getCatalogFormValues(formData),
    };
  }

  try {
    const input = parseCatalogItemInput(formData);
    const updated = await updateCatalogItemById(catalogItemId, input);

    if (!updated) {
      return {
        errorMessage: "Позиция каталога не найдена",
        values: getCatalogFormValues(formData),
      };
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        values: getCatalogFormValues(formData),
      };
    }

    throw error;
  }

  redirect("/dashboard/catalog");
}

export async function deleteCatalogItemAction(formData: FormData) {
  await requirePermission("manage_catalog");

  const catalogItemId = Number(String(formData.get("catalogItemId") ?? "").trim());
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard/catalog").trim();

  if (Number.isInteger(catalogItemId) && catalogItemId > 0) {
    await deleteCatalogItemById(catalogItemId);
  }

  return {
    redirectTo: redirectTo || "/dashboard/catalog",
  };
}
