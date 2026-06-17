import { normalizeUserRole, type SessionUser } from "@/modules/auth/auth.types";

const DEFAULT_AUTH_REDIRECT = "/dashboard";
const ACCESS_DENIED_PATH = "/access-denied";

export function normalizeAuthReturnTo(value: string, fallback = DEFAULT_AUTH_REDIRECT) {
  const trimmed = value.trim();

  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
}

export function getSafeReturnTo(value: string | null | undefined, fallback = DEFAULT_AUTH_REDIRECT) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (!trimmed.startsWith("/dashboard")) {
    return fallback;
  }

  return trimmed;
}

export function getRoleHomePath(role: unknown) {
  const normalizedRole = normalizeUserRole(role);

  if (normalizedRole === "Диспетчер") {
    return "/dispatcher/orders";
  }

  if (normalizedRole === "Повар") {
    return "/kitchen";
  }

  if (normalizedRole === "Курьер") {
    return "/dashboard/profile";
  }

  if (!normalizedRole) {
    return ACCESS_DENIED_PATH;
  }

  return DEFAULT_AUTH_REDIRECT;
}

export function getUserHomePath(user: Pick<SessionUser, "role">) {
  return getRoleHomePath(user.role);
}

export function normalizeRoleReturnTo(value: string, user: Pick<SessionUser, "role">) {
  const roleHomePath = getUserHomePath(user);
  const safeReturnTo = normalizeAuthReturnTo(value, roleHomePath);

  if (user.role === "Диспетчер") {
    return safeReturnTo.startsWith("/dispatcher") ||
      safeReturnTo.startsWith("/dashboard/profile")
      ? safeReturnTo
      : roleHomePath;
  }

  if (user.role === "Повар") {
    return safeReturnTo.startsWith("/kitchen") ||
      safeReturnTo.startsWith("/dashboard/profile")
      ? safeReturnTo
      : roleHomePath;
  }

  if (user.role === "Курьер") {
    return safeReturnTo.startsWith("/dashboard/profile")
      ? safeReturnTo
      : roleHomePath;
  }

  return safeReturnTo;
}

export function getAccessDeniedPath() {
  return ACCESS_DENIED_PATH;
}
