"use client";

import { browserBackendJson } from "@/shared/api/browser-backend";
import { ValidationError } from "@/shared/errors/app-error";
import {
  parseCreateInventorySessionInput,
  parseInventoryAuditInput,
  parseInventorySessionActualsInput,
} from "@/modules/inventory/inventory.validation";
import type {
  InventoryAuditFormState,
  InventorySessionCreateFormState,
  InventorySessionProgressFormState,
} from "@/modules/inventory/actions/inventory-action.types";

export async function submitInventoryAuditAction(
  _previousState: InventoryAuditFormState,
  formData: FormData,
): Promise<InventoryAuditFormState> {
  try {
    const entries = parseInventoryAuditInput(formData);
    const result = await browserBackendJson<{
      checkedCount: number;
      updatedCount: number;
      differenceCount: number;
    }>("/api/v1/inventory/audit", {
      body: { entries },
    });

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
    if (error instanceof ValidationError || error instanceof Error) {
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
  try {
    const input = parseCreateInventorySessionInput(formData);
    const session = await browserBackendJson<{ id: number }>(
      "/api/v1/inventory/sessions",
      { body: input },
    );

    return {
      errorMessage: null,
      successMessage: `Инвентаризация №${session.id} создана.`,
      createdSessionId: session.id,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
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
  const sessionId = Number(String(formData.get("sessionId") ?? "").trim());

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return {
      errorMessage: "Инвентаризация не найдена",
      successMessage: null,
    };
  }

  try {
    const entries = parseInventorySessionActualsInput(formData);
    await browserBackendJson(`/api/v1/inventory/sessions/${sessionId}/actuals`, {
      method: "PATCH",
      body: { items: entries },
    });

    return {
      errorMessage: null,
      successMessage: "Фактические остатки сохранены.",
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
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
  const sessionId = Number(String(formData.get("sessionId") ?? "").trim());

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return {
      errorMessage: "Инвентаризация не найдена",
      successMessage: null,
    };
  }

  try {
    const entries = parseInventorySessionActualsInput(formData);
    await browserBackendJson(`/api/v1/inventory/sessions/${sessionId}/actuals`, {
      method: "PATCH",
      body: { items: entries },
    });
    await browserBackendJson(`/api/v1/inventory/sessions/${sessionId}/close`);

    return {
      errorMessage: null,
      successMessage: "Инвентаризация закрыта, остатки на складе обновлены.",
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
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
  const sessionId = Number(String(formData.get("sessionId") ?? "").trim());

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return {
      errorMessage: "Инвентаризация не найдена",
      successMessage: null,
    };
  }

  try {
    await browserBackendJson(`/api/v1/inventory/sessions/${sessionId}`, {
      method: "DELETE",
    });

    return {
      errorMessage: null,
      successMessage: "Инвентаризация удалена, остатки на складе пересчитаны.",
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
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
