"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";
import { ValidationError } from "@/shared/errors/app-error";
import { addCatalogItem } from "@/modules/catalog/catalog.service";
import { parseCatalogItemInput } from "@/modules/catalog/catalog.validation";

export type CatalogFormState = {
  errorMessage: string | null;
  values: {
    name: string;
    slug: string;
    category: string;
    description: string;
    price: string;
    displayOrder: string;
    technologicalCardId: string;
    isPublished: boolean;
  };
};

function getCatalogFormValues(formData: FormData) {
  const read = (name: string) => String(formData.get(name) ?? "").trim();

  return {
    name: read("name"),
    slug: read("slug"),
    category: read("category"),
    description: read("description"),
    price: read("price"),
    displayOrder: read("displayOrder"),
    technologicalCardId: read("technologicalCardId"),
    isPublished: read("isPublished") === "on",
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
