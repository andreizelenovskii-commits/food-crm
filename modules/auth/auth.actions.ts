"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  AuthenticationError,
  ValidationError,
} from "@/shared/errors/app-error";
import { createSession, clearSession } from "@/modules/auth/auth.session";
import { authenticateUser } from "@/modules/auth/auth.service";
import { parseLoginInput } from "@/modules/auth/auth.validation";

function getClientIpAddress(forwardedFor: string | null, realIp: string | null) {
  if (forwardedFor) {
    const firstForwardedIp = forwardedFor
      .split(",")
      .map((value) => value.trim())
      .find(Boolean);

    if (firstForwardedIp) {
      return firstForwardedIp;
    }
  }

  return realIp?.trim() || "unknown";
}

export async function loginAction(
  _previousState: { errorMessage: string | null },
  formData: FormData,
): Promise<{ errorMessage: string | null }> {
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  try {
    const input = parseLoginInput(formData);
    const requestHeaders = await headers();
    const user = await authenticateUser(input, undefined, {
      ipAddress: getClientIpAddress(
        requestHeaders.get("x-forwarded-for"),
        requestHeaders.get("x-real-ip"),
      ),
    });

    await createSession(user);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof AuthenticationError) {
      return {
        errorMessage: error.message,
      };
    }

    throw error;
  }

  redirect(returnTo.startsWith("/") ? returnTo : "/dashboard");
}

export async function logoutAction(formData: FormData) {
  const returnTo = String(formData.get("returnTo") ?? "").trim();
  await clearSession();
  redirect(
    returnTo.startsWith("/")
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : "/login",
  );
}
