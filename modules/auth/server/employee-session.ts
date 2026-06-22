import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { hasPermission, type AuthPermission } from "@/modules/auth/authz";
import type { SessionUser } from "@/modules/auth/auth.types";
import { getAccessDeniedPath, getUserHomePath } from "@/modules/auth/auth.redirect";
import {
  canAccessCrmShell,
  canAccessDispatcherWorkspace,
  canAccessKitchenWorkspace,
} from "@/modules/auth/authz";
import { backendGetResult } from "@/shared/api/backend";

export type EmployeeWorkspace = "crm" | "dispatcher" | "kitchen";

const getCurrentEmployeeSessionResult = cache(async () => backendGetResult<SessionUser>("/api/v1/auth/me"));

export const getCurrentEmployeeSession = cache(async (): Promise<SessionUser | null> => {
  const result = await getCurrentEmployeeSessionResult();
  return result.ok ? result.data : null;
});

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

export async function requireCurrentEmployee() {
  const result = await getCurrentEmployeeSessionResult();

  if (!result.ok) {
    redirect(loginRedirectUrl(result.message));
  }

  return result.data;
}

export function resolveEmployeeWorkspaceAccess(user: SessionUser, workspace: EmployeeWorkspace) {
  if (workspace === "crm") {
    return canAccessCrmShell(user);
  }

  if (workspace === "dispatcher") {
    return canAccessDispatcherWorkspace(user);
  }

  return canAccessKitchenWorkspace(user);
}

export async function requireWorkspaceAccess(workspace: EmployeeWorkspace) {
  const user = await requireCurrentEmployee();

  if (!resolveEmployeeWorkspaceAccess(user, workspace)) {
    const roleHomePath = getUserHomePath(user);
    redirect(roleHomePath === getWorkspaceHomePath(workspace) ? getAccessDeniedPath() : roleHomePath);
  }

  return user;
}

export async function requireCurrentEmployeePermission(
  permission: AuthPermission,
  redirectTo = "/",
) {
  const user = await requireCurrentEmployee();

  if (!hasPermission(user, permission)) {
    const roleHomePath = getUserHomePath(user);
    redirect(roleHomePath === redirectTo ? getAccessDeniedPath() : roleHomePath);
  }

  return user;
}

function getWorkspaceHomePath(workspace: EmployeeWorkspace) {
  if (workspace === "dispatcher") return "/dispatcher/orders";
  if (workspace === "kitchen") return "/kitchen";
  return "/dashboard";
}
