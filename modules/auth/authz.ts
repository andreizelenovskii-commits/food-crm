import {
  normalizeUserRole,
  type SessionUser,
  type UserRole,
} from "@/modules/auth/auth.types";

export const AUTH_PERMISSIONS = [
  "view_dashboard",
  "view_orders",
  "manage_orders",
  "view_catalog",
  "manage_catalog",
  "view_inventory",
  "manage_inventory",
  "view_settings",
  "manage_settings",
  "view_clients",
  "manage_clients",
  "view_employees",
  "manage_employees",
] as const;

export type AuthPermission = (typeof AUTH_PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<UserRole, AuthPermission[]> = {
  admin: [
    "view_dashboard",
    "view_orders",
    "manage_orders",
    "view_catalog",
    "manage_catalog",
    "view_inventory",
    "manage_inventory",
    "view_settings",
    "manage_settings",
    "view_clients",
    "manage_clients",
    "view_employees",
    "manage_employees",
  ],
  "Администратор": [
    "view_dashboard",
    "view_orders",
    "manage_orders",
    "view_catalog",
    "manage_catalog",
    "view_inventory",
    "manage_inventory",
    "view_settings",
    "manage_settings",
    "view_clients",
    "manage_clients",
    "view_employees",
    "manage_employees",
  ],
  "Шеф повар": [
    "view_dashboard",
    "view_orders",
    "manage_orders",
    "view_catalog",
    "manage_catalog",
    "view_inventory",
    "manage_inventory",
    "view_settings",
    "manage_settings",
    "view_clients",
    "manage_clients",
    "view_employees",
    "manage_employees",
  ],
  "Управляющий": [
    "view_dashboard",
    "view_orders",
    "manage_orders",
    "view_catalog",
    "manage_catalog",
    "view_inventory",
    "manage_inventory",
    "view_settings",
    "manage_settings",
    "view_clients",
    "manage_clients",
    "view_employees",
    "manage_employees",
  ],
  "Старший курьер": [
    "view_dashboard",
    "view_orders",
    "manage_orders",
    "view_catalog",
    "manage_catalog",
    "view_inventory",
    "manage_inventory",
    "view_settings",
    "manage_settings",
    "view_clients",
    "manage_clients",
    "view_employees",
    "manage_employees",
  ],
  "Диспетчер": [
    "view_dashboard",
    "view_orders",
    "manage_orders",
    "view_catalog",
    "view_clients",
  ],
  "Повар": [
    "view_dashboard",
    "view_orders",
  ],
  "Курьер": [
    "view_dashboard",
    "view_orders",
  ],
};

const FULL_ACCESS_ROLES = new Set<UserRole>([
  "admin",
  "Администратор",
  "Шеф повар",
  "Управляющий",
  "Старший курьер",
]);

export function isFullAccessRole(role: unknown) {
  const normalizedRole = normalizeUserRole(role);

  return normalizedRole ? FULL_ACCESS_ROLES.has(normalizedRole) : false;
}

export function isRestrictedStaffRole(role: unknown) {
  const normalizedRole = normalizeUserRole(role);

  return normalizedRole === "Диспетчер" ||
    normalizedRole === "Повар" ||
    normalizedRole === "Курьер";
}

export function canAccessCrmShell(userOrRole: SessionUser | UserRole) {
  const rawRole = typeof userOrRole === "string" ? userOrRole : userOrRole.role;

  return isFullAccessRole(rawRole);
}

export function canAccessDispatcherWorkspace(userOrRole: SessionUser | UserRole) {
  const rawRole = typeof userOrRole === "string" ? userOrRole : userOrRole.role;
  const role = normalizeUserRole(rawRole);

  return isFullAccessRole(role) || role === "Диспетчер";
}

export function canAccessKitchenWorkspace(userOrRole: SessionUser | UserRole) {
  const rawRole = typeof userOrRole === "string" ? userOrRole : userOrRole.role;
  const role = normalizeUserRole(rawRole);

  return isFullAccessRole(role) || role === "Повар";
}

export function shouldShowBackToCrm(userOrRole: SessionUser | UserRole, pathname: string) {
  return isFullAccessRole(typeof userOrRole === "string" ? userOrRole : userOrRole.role) &&
    (pathname === "/kitchen" || pathname.startsWith("/dispatcher"));
}

export function hasPermission(
  userOrRole: SessionUser | UserRole,
  permission: AuthPermission,
) {
  const rawRole = typeof userOrRole === "string" ? userOrRole : userOrRole.role;
  const role = normalizeUserRole(rawRole);

  if (!role) {
    return false;
  }

  if (isFullAccessRole(role)) {
    return ROLE_PERMISSIONS[role].includes(permission);
  }

  if (typeof userOrRole !== "string" && Array.isArray(userOrRole.permissions)) {
    return userOrRole.permissions.includes(permission);
  }

  return ROLE_PERMISSIONS[role].includes(permission);
}
