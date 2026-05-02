"use client";

import { browserBackendJson } from "@/shared/api/browser-backend";
import { ValidationError } from "@/shared/errors/app-error";
import { parseCreateWriteoffActInput } from "@/modules/inventory/inventory.validation";
import type {
  WriteoffActCreateFormState,
  WriteoffActProgressFormState,
} from "@/modules/inventory/actions/inventory-action.types";

export async function createWriteoffActAction(
  _previousState: WriteoffActCreateFormState,
  formData: FormData,
): Promise<WriteoffActCreateFormState> {
  try {
    const input = parseCreateWriteoffActInput(formData);
    const act = await browserBackendJson<{ id: number }>(
      "/api/v1/inventory/writeoff-acts",
      { body: input },
    );

    return {
      errorMessage: null,
      successMessage: `Акт списания №${act.id} создан.`,
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

export async function completeWriteoffActAction(
  _previousState: WriteoffActProgressFormState,
  formData: FormData,
): Promise<WriteoffActProgressFormState> {
  const actId = Number(String(formData.get("actId") ?? "").trim());

  if (!Number.isInteger(actId) || actId <= 0) {
    return {
      errorMessage: "Акт списания не найден",
      successMessage: null,
    };
  }

  try {
    await browserBackendJson(`/api/v1/inventory/writeoff-acts/${actId}/complete`);

    return {
      errorMessage: null,
      successMessage: `Акт списания №${actId} завершён.`,
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

export async function deleteWriteoffActAction(
  _previousState: WriteoffActProgressFormState,
  formData: FormData,
): Promise<WriteoffActProgressFormState> {
  const actId = Number(String(formData.get("actId") ?? "").trim());

  if (!Number.isInteger(actId) || actId <= 0) {
    return {
      errorMessage: "Акт списания не найден",
      successMessage: null,
    };
  }

  try {
    await browserBackendJson(`/api/v1/inventory/writeoff-acts/${actId}`, {
      method: "DELETE",
    });

    return {
      errorMessage: null,
      successMessage: `Акт списания №${actId} удалён.`,
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
