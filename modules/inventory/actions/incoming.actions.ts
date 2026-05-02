"use client";

import { browserBackendJson } from "@/shared/api/browser-backend";
import { ValidationError } from "@/shared/errors/app-error";
import { parseCreateIncomingActInput } from "@/modules/inventory/inventory.validation";
import { toIncomingActApiBody } from "@/modules/inventory/actions/inventory-action.shared";
import type {
  WriteoffActCreateFormState,
  WriteoffActProgressFormState,
} from "@/modules/inventory/actions/inventory-action.types";

export async function createIncomingActAction(
  _previousState: WriteoffActCreateFormState,
  formData: FormData,
): Promise<WriteoffActCreateFormState> {
  try {
    const input = parseCreateIncomingActInput(formData);
    const act = await browserBackendJson<{ id: number }>(
      "/api/v1/inventory/incoming-acts",
      { body: toIncomingActApiBody(input) },
    );

    return {
      errorMessage: null,
      successMessage: `Акт поступления №${act.id} создан.`,
      createdActId: act.id,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        successMessage: null,
        createdActId: null,
      };
    }

    throw error;
  }
}

export async function updateIncomingActAction(
  _previousState: WriteoffActCreateFormState,
  formData: FormData,
): Promise<WriteoffActCreateFormState> {
  const actId = Number(String(formData.get("actId") ?? "").trim());

  if (!Number.isInteger(actId) || actId <= 0) {
    return {
      errorMessage: "Акт поступления не найден",
      successMessage: null,
      createdActId: null,
    };
  }

  try {
    const input = parseCreateIncomingActInput(formData);
    const act = await browserBackendJson<{ id: number }>(
      `/api/v1/inventory/incoming-acts/${actId}`,
      {
        method: "PATCH",
        body: toIncomingActApiBody(input),
      },
    );

    return {
      errorMessage: null,
      successMessage: `Акт поступления №${act.id} обновлён.`,
      createdActId: act.id,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        successMessage: null,
        createdActId: null,
      };
    }

    throw error;
  }
}

export async function completeIncomingActAction(
  _previousState: WriteoffActProgressFormState,
  formData: FormData,
): Promise<WriteoffActProgressFormState> {
  const actId = Number(String(formData.get("actId") ?? "").trim());

  if (!Number.isInteger(actId) || actId <= 0) {
    return {
      errorMessage: "Акт поступления не найден",
      successMessage: null,
    };
  }

  try {
    await browserBackendJson(`/api/v1/inventory/incoming-acts/${actId}/complete`);

    return {
      errorMessage: null,
      successMessage: `Акт поступления №${actId} завершён.`,
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

export async function deleteIncomingActAction(
  _previousState: WriteoffActProgressFormState,
  formData: FormData,
): Promise<WriteoffActProgressFormState> {
  const actId = Number(String(formData.get("actId") ?? "").trim());

  if (!Number.isInteger(actId) || actId <= 0) {
    return {
      errorMessage: "Акт поступления не найден",
      successMessage: null,
    };
  }

  try {
    await browserBackendJson(`/api/v1/inventory/incoming-acts/${actId}`, {
      method: "DELETE",
    });

    return {
      errorMessage: null,
      successMessage: `Акт поступления №${actId} удалён.`,
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

export async function deleteIncomingActSubmitAction(formData: FormData) {
  const result = await deleteIncomingActAction(
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
    redirectTo: String(formData.get("redirectTo") ?? "/dashboard/inventory?tab=incoming").trim(),
  };
}
