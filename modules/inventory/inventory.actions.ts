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
  category: string;
  unit: string;
  stockQuantity: string;
  price: string;
  description: string;
};

export type ProductFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  values: ProductFormValues;
};

function getProductFormValues(formData: FormData): ProductFormValues {
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
        successMessage: null,
        values: getProductFormValues(formData),
      };
    }

    throw error;
  }

  return {
    errorMessage: null,
    successMessage: "Товар добавлен.",
    values: {
      name: "",
      category: "",
      unit: "",
      stockQuantity: "",
      price: "",
      description: "",
    },
  };
}

export async function submitAddProductAction(
  formData: FormData,
): Promise<ProductFormState> {
  return addProductAction(
    {
      errorMessage: null,
      successMessage: null,
      values: {
        name: "",
        category: "",
        unit: "",
        stockQuantity: "",
        price: "",
        description: "",
      },
    },
    formData,
  );
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
      successMessage: null,
      values: getProductFormValues(formData),
    };
  }

  try {
    const input = parseProductInput(formData);
    const updated = await updateProductService(productId, input);

    if (!updated) {
      return {
        errorMessage: "Товар не найден",
        successMessage: null,
        values: getProductFormValues(formData),
      };
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
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
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard/inventory").trim();

  if (Number.isInteger(productId) && productId > 0) {
    await deleteProductService(productId);
  }

  return {
    redirectTo: redirectTo || "/dashboard/inventory",
  };
}
