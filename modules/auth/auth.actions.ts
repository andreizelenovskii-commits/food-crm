"use client";

import {
  AuthenticationError,
  ValidationError,
} from "@/shared/errors/app-error";
import { parseLoginInput } from "@/modules/auth/auth.validation";
import { browserBackendJson } from "@/shared/api/browser-backend";

/** API мог ещё отдавать текст про email — показываем единообразно про телефон. */
function loginErrorMessageForUi(message: string): string {
  if (message === "Неверный email или пароль") {
    return "Неверный телефон или пароль";
  }

  return message;
}

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
      // Старый API читал только `email`; новый — `phone` или `email`. Оба ключа — плавный переход.
      body: {
        phone: input.phone,
        email: input.phone,
        password: input.password,
      },
    });
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof AuthenticationError ||
      error instanceof Error
    ) {
      return {
        errorMessage: loginErrorMessageForUi(error.message),
      };
    }

    throw error;
  }

  window.location.assign(returnTo.startsWith("/") ? returnTo : "/dashboard");
  return { errorMessage: null };
}

export type ChangePasswordFormState = {
  errorMessage: string | null;
  successMessage: string | null;
};

export async function changePasswordAction(
  _previousState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  const currentPassword = String(formData.get("currentPassword") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "").trim();
  const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "").trim();

  if (!currentPassword || !newPassword) {
    return {
      errorMessage: "Заполни текущий и новый пароль",
      successMessage: null,
    };
  }

  if (newPassword !== confirmNewPassword) {
    return {
      errorMessage: "Новый пароль и подтверждение не совпадают",
      successMessage: null,
    };
  }

  try {
    await browserBackendJson<{ success: boolean }>("/api/v1/auth/change-password", {
      body: { currentPassword, newPassword },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorMessage: error.message,
        successMessage: null,
      };
    }

    throw error;
  }

  return {
    errorMessage: null,
    successMessage: "Пароль обновлён. При следующем входе используй новый пароль.",
  };
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
