"use client";

import { ValidationError } from "@/shared/errors/app-error";
import {
  parseCreateClientInput,
  parseUpdateClientInput,
} from "@/modules/clients/clients.validation";
import { browserBackendJson } from "@/shared/api/browser-backend";

export type ClientFormValues = {
  name: string;
  phone: string;
  birthDate: string;
  email: string;
  addressResidenceType: string;
  addressCity: string;
  addressStreet: string;
  addressHouse: string;
  addressEntrance: string;
  addressFloor: string;
  addressApartment: string;
  notes: string;
};

export type ClientFormState = {
  errorMessage: string | null;
  values: ClientFormValues;
};

function getClientFormValues(formData: FormData): ClientFormValues {
  const read = (name: string) => String(formData.get(name) ?? "").trim();

  return {
    name: read("name"),
    phone: read("phone"),
    birthDate: read("birthDate"),
    email: read("email"),
    addressResidenceType: read("addressResidenceType"),
    addressCity: read("addressCity"),
    addressStreet: read("addressStreet"),
    addressHouse: read("addressHouse"),
    addressEntrance: read("addressEntrance"),
    addressFloor: read("addressFloor"),
    addressApartment: read("addressApartment"),
    notes: read("notes"),
  };
}

export async function addClientAction(
  _previousState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  try {
    parseCreateClientInput(formData);
    await browserBackendJson("/api/v1/clients", {
      body: {
        type: String(formData.get("type") ?? "").trim(),
        ...getClientFormValues(formData),
      },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        values: getClientFormValues(formData),
      };
    }

    throw error;
  }

  window.location.assign("/dashboard/clients");
  return { errorMessage: null, values: getClientFormValues(formData) };
}

export async function deleteClientAction(formData: FormData) {
  const clientId = Number(String(formData.get("clientId") ?? "").trim());
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard/clients").trim();

  if (Number.isInteger(clientId) && clientId > 0) {
    await browserBackendJson(`/api/v1/clients/${clientId}`, {
      method: "DELETE",
    });
  }

  return {
    redirectTo: redirectTo || "/dashboard/clients",
  };
}

export async function updateClientAction(
  _previousState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const clientId = Number(String(formData.get("clientId") ?? "").trim());

  if (!Number.isInteger(clientId) || clientId <= 0) {
    return {
      errorMessage: "Клиент не найден",
      values: getClientFormValues(formData),
    };
  }

  try {
    parseUpdateClientInput(formData);
    await browserBackendJson(`/api/v1/clients/${clientId}`, {
      method: "PATCH",
      body: {
        type: String(formData.get("type") ?? "").trim(),
        ...getClientFormValues(formData),
      },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      return {
        errorMessage: error.message,
        values: getClientFormValues(formData),
      };
    }

    throw error;
  }

  window.location.assign("/dashboard/clients");
  return { errorMessage: null, values: getClientFormValues(formData) };
}
