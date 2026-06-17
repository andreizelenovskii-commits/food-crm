import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasPermission, type AuthPermission } from "@/modules/auth/authz";
import type { SessionUser } from "@/modules/auth/auth.types";
import { getAccessDeniedPath, getUserHomePath } from "@/modules/auth/auth.redirect";
import { backendGetResult } from "@/shared/api/backend";

const BACKEND_SESSION_COOKIE_NAME =
  process.env.BACKEND_SESSION_COOKIE_NAME?.trim() || "food_crm_api_session";

export async function setBackendSessionCookie(token: string, expiresAt: string) {
  const cookieStore = await cookies();

  cookieStore.set(BACKEND_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    priority: "high",
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(BACKEND_SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const result = await backendGetResult<SessionUser>("/api/v1/auth/me");

  return result.ok ? result.data : null;
}

function loginReasonFromMessage(message: string) {
  const lower = message.toLowerCase();

  if (message.includes("другого устройства")) return "other_device";
  if (message.includes("Пароль был измен")) return "password_changed";
  if (message.includes("истекла")) return "expired";
  if (message.includes("повреждена") || lower.includes("cookie")) return "invalid";
  if (message.includes("Сессия завершена")) return "revoked";
  if (message.includes("Backend API недоступен") || message.includes("API недоступен")) return "server";
  if (message.includes("доступ")) return "access";

  return "required";
}

function loginRedirectUrl(message: string, returnTo = "") {
  const searchParams = new URLSearchParams({
    reason: loginReasonFromMessage(message),
    message,
  });

  if (returnTo) {
    searchParams.set("returnTo", returnTo);
  }

  return `/login?${searchParams.toString()}`;
}

export async function requireSessionUser() {
  const result = await backendGetResult<SessionUser>("/api/v1/auth/me");

  if (!result.ok) {
    redirect(loginRedirectUrl(result.message));
  }

  return result.data;
}

export async function requirePermission(
  permission: AuthPermission,
  redirectTo = "/",
) {
  const user = await requireSessionUser();

  if (!hasPermission(user, permission)) {
    const roleHomePath = getUserHomePath(user);
    redirect(roleHomePath === redirectTo ? getAccessDeniedPath() : roleHomePath);
  }

  return user;
}
