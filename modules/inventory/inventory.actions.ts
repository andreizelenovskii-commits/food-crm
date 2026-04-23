"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/modules/auth/auth.session";
import { ValidationError } from "@/shared/errors/app-error";
import {
  applyInventoryAuditService,
  addProduct,
  closeInventorySessionService,
  completeIncomingActService,
  completeWriteoffActService,
  createIncomingActService,
  createInventorySessionService,
  createWriteoffActService,
  deleteWriteoffActService,
  deleteInventorySessionService,
  deleteProductService,
  saveInventorySessionActualsService,
  updateProductService,
} from "@/modules/inventory/inventory.service";
import {
  parseCreateIncomingActInput,
  parseCreateWriteoffActInput,
  parseCreateInventorySessionInput,
  parseInventoryAuditInput,
  parseInventorySessionActualsInput,
  parseProductInput,
} from "@/modules/inventory/inventory.validation";

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

export type InventoryAuditFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  checkedCount: number;
  updatedCount: number;
  differenceCount: number;
};

export type InventorySessionCreateFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  createdSessionId: number | null;
};

export type InventorySessionProgressFormState = {
  errorMessage: string | null;
  successMessage: string | null;
};

export type WriteoffActCreateFormState = {
  errorMessage: string | null;
  successMessage: string | null;
  createdActId: number | null;
};

export type WriteoffActProgressFormState = {
  errorMessage: string | null;
  successMessage: string | null;
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

export async function submitInventoryAuditAction(
  _previousState: InventoryAuditFormState,
  formData: FormData,
): Promise<InventoryAuditFormState> {
  await requirePermission("manage_inventory");

  try {
    const entries = parseInventoryAuditInput(formData);
    const result = await applyInventoryAuditService(entries);

    return {
      errorMessage: null,
      successMessage:
        result.updatedCount > 0
          ? `Инвентаризация сохранена. Обновлено позиций: ${result.updatedCount}.`
          : "Инвентаризация сохранена. Расхождений не найдено.",
      checkedCount: result.checkedCount,
      updatedCount: result.updatedCount,
      differenceCount: result.differenceCount,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
        checkedCount: 0,
        updatedCount: 0,
        differenceCount: 0,
      };
    }

    throw error;
  }
}

export async function createInventorySessionAction(
  _previousState: InventorySessionCreateFormState,
  formData: FormData,
): Promise<InventorySessionCreateFormState> {
  await requirePermission("manage_inventory");

  try {
    const input = parseCreateInventorySessionInput(formData);
    const session = await createInventorySessionService(input);

    return {
      errorMessage: null,
      successMessage: `Инвентаризация №${session.id} создана.`,
      createdSessionId: session.id,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
        createdSessionId: null,
      };
    }

    throw error;
  }
}

export async function saveInventorySessionActualsAction(
  _previousState: InventorySessionProgressFormState,
  formData: FormData,
): Promise<InventorySessionProgressFormState> {
  await requirePermission("manage_inventory");
  const sessionId = Number(String(formData.get("sessionId") ?? "").trim());

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return {
      errorMessage: "Инвентаризация не найдена",
      successMessage: null,
    };
  }

  try {
    const entries = parseInventorySessionActualsInput(formData);
    await saveInventorySessionActualsService(sessionId, entries);

    return {
      errorMessage: null,
      successMessage: "Фактические остатки сохранены.",
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
      };
    }

    throw error;
  }
}

export async function closeInventorySessionAction(
  _previousState: InventorySessionProgressFormState,
  formData: FormData,
): Promise<InventorySessionProgressFormState> {
  await requirePermission("manage_inventory");
  const sessionId = Number(String(formData.get("sessionId") ?? "").trim());

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return {
      errorMessage: "Инвентаризация не найдена",
      successMessage: null,
    };
  }

  try {
    const entries = parseInventorySessionActualsInput(formData);
    await saveInventorySessionActualsService(sessionId, entries);
    await closeInventorySessionService(sessionId);

    return {
      errorMessage: null,
      successMessage: "Инвентаризация закрыта, остатки на складе обновлены.",
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
      };
    }

    throw error;
  }
}

export async function deleteInventorySessionAction(
  _previousState: InventorySessionProgressFormState,
  formData: FormData,
): Promise<InventorySessionProgressFormState> {
  await requirePermission("manage_inventory");
  const sessionId = Number(String(formData.get("sessionId") ?? "").trim());

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return {
      errorMessage: "Инвентаризация не найдена",
      successMessage: null,
    };
  }

  try {
    await deleteInventorySessionService(sessionId);

    return {
      errorMessage: null,
      successMessage: "Инвентаризация удалена, остатки на складе пересчитаны.",
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
      };
    }

    throw error;
  }
}

export async function deleteInventorySessionSubmitAction(formData: FormData) {
  const result = await deleteInventorySessionAction(
    {
      errorMessage: null,
      successMessage: null,
    },
    formData,
  );

  if (result.errorMessage) {
    throw new ValidationError(result.errorMessage);
  }

  return {
    redirectTo: String(formData.get("redirectTo") ?? "/dashboard/inventory?tab=audit").trim(),
  };
}

export async function createWriteoffActAction(
  _previousState: WriteoffActCreateFormState,
  formData: FormData,
): Promise<WriteoffActCreateFormState> {
  await requirePermission("manage_inventory");

  try {
    const input = parseCreateWriteoffActInput(formData);
    const act = await createWriteoffActService(input);

    return {
      errorMessage: null,
      successMessage: `Акт списания №${act.id} создан.`,
      createdActId: act.id,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
        createdActId: null,
      };
    }

    throw error;
  }
}

export async function createIncomingActAction(
  _previousState: WriteoffActCreateFormState,
  formData: FormData,
): Promise<WriteoffActCreateFormState> {
  await requirePermission("manage_inventory");

  try {
    const input = parseCreateIncomingActInput(formData);
    const act = await createIncomingActService(input);

    return {
      errorMessage: null,
      successMessage: `Акт поступления №${act.id} создан.`,
      createdActId: act.id,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
        createdActId: null,
      };
    }

    throw error;
  }
}

export async function completeWriteoffActAction(
  _previousState: WriteoffActProgressFormState,
  formData: FormData,
): Promise<WriteoffActProgressFormState> {
  await requirePermission("manage_inventory");
  const actId = Number(String(formData.get("actId") ?? "").trim());

  if (!Number.isInteger(actId) || actId <= 0) {
    return {
      errorMessage: "Акт списания не найден",
      successMessage: null,
    };
  }

  try {
    await completeWriteoffActService(actId);

    return {
      errorMessage: null,
      successMessage: `Акт списания №${actId} завершён.`,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
      };
    }

    throw error;
  }
}

export async function completeIncomingActAction(
  _previousState: WriteoffActProgressFormState,
  formData: FormData,
): Promise<WriteoffActProgressFormState> {
  await requirePermission("manage_inventory");
  const actId = Number(String(formData.get("actId") ?? "").trim());

  if (!Number.isInteger(actId) || actId <= 0) {
    return {
      errorMessage: "Акт поступления не найден",
      successMessage: null,
    };
  }

  try {
    await completeIncomingActService(actId);

    return {
      errorMessage: null,
      successMessage: `Акт поступления №${actId} завершён.`,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
      };
    }

    throw error;
  }
}

export async function deleteWriteoffActAction(
  _previousState: WriteoffActProgressFormState,
  formData: FormData,
): Promise<WriteoffActProgressFormState> {
  await requirePermission("manage_inventory");
  const actId = Number(String(formData.get("actId") ?? "").trim());

  if (!Number.isInteger(actId) || actId <= 0) {
    return {
      errorMessage: "Акт списания не найден",
      successMessage: null,
    };
  }

  try {
    await deleteWriteoffActService(actId);

    return {
      errorMessage: null,
      successMessage: `Акт списания №${actId} удалён.`,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errorMessage: error.message,
        successMessage: null,
      };
    }

    throw error;
  }
}
