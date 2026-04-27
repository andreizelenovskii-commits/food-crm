"use client";

import {
  AuthenticationError,
  ValidationError,
} from "@/shared/errors/app-error";
import { parseLoginInput } from "@/modules/auth/auth.validation";
import { browserBackendJson } from "@/shared/api/browser-backend";

export async function loginAction(
  _previousState: { errorMessage: string | null },
  formData: FormData,
): Promise<{ errorMessage: string | null }> {
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  try {
    const input = parseLoginInput(formData);
    await browserBackendJson<{
      token: string;
      expiresAt: string;
    }>("/api/v1/auth/login", {
      body: input,
    });
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof AuthenticationError ||
      error instanceof Error
    ) {
      return {
        errorMessage: error.message,
      };
    }

    throw error;
  }

  window.location.assign(returnTo.startsWith("/") ? returnTo : "/dashboard");
  return { errorMessage: null };
}

export async function logoutAction(formData: FormData) {
  const returnTo = String(formData.get("returnTo") ?? "").trim();
  await browserBackendJson("/api/v1/auth/logout");
  window.location.assign(
    returnTo.startsWith("/")
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : "/login",
  );
}
