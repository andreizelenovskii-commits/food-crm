import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasPermission, type AuthPermission } from "@/modules/auth/authz";
import type { SessionUser } from "@/modules/auth/auth.types";
import { backendGetOptional } from "@/shared/api/backend";

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
  return backendGetOptional<SessionUser>("/api/v1/auth/me");
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requirePermission(
  permission: AuthPermission,
  redirectTo = "/",
) {
  const user = await requireSessionUser();

  if (!hasPermission(user, permission)) {
    redirect(redirectTo);
  }

  return user;
}
