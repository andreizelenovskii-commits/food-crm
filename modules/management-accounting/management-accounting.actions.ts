"use server";

import { revalidatePath } from "next/cache";
import { backendJson } from "@/shared/api/backend";
import type {
  ManagementAccountingDay,
  ManagementAccountingManualEntry,
} from "@/modules/management-accounting/management-accounting.types";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createManagementAccountingEntry(formData: FormData) {
  const date = getFormString(formData, "date");

  await backendJson<ManagementAccountingManualEntry>("/api/v1/analytics/management/manual-entries", {
    body: {
      date,
      type: getFormString(formData, "type"),
      category: getFormString(formData, "category"),
      amount: getFormString(formData, "amount"),
      comment: getFormString(formData, "comment"),
    },
  });

  revalidatePath("/dashboard/management-accounting");
}

export async function startManagementAccountingDay(formData: FormData) {
  await backendJson<ManagementAccountingDay>("/api/v1/analytics/management/day/start", {
    body: {
      date: getFormString(formData, "date"),
    },
  });

  revalidatePath("/dashboard/management-accounting");
}

export async function closeManagementAccountingDay(formData: FormData) {
  await backendJson<ManagementAccountingDay>("/api/v1/analytics/management/day/close", {
    body: {
      date: getFormString(formData, "date"),
    },
  });

  revalidatePath("/dashboard/management-accounting");
}

export async function deleteManagementAccountingEntry(formData: FormData) {
  const entryId = Number(getFormString(formData, "entryId"));

  if (!Number.isInteger(entryId) || entryId <= 0) {
    return;
  }

  await backendJson<{ deleted: boolean }>(`/api/v1/analytics/management/manual-entries/${entryId}`, {
    method: "DELETE",
  });

  revalidatePath("/dashboard/management-accounting");
}
