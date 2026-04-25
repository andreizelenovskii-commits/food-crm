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

export function hasPermission(
  userOrRole: SessionUser | UserRole,
  permission: AuthPermission,
) {
  const rawRole = typeof userOrRole === "string" ? userOrRole : userOrRole.role;
  const role = normalizeUserRole(rawRole);

  if (!role) {
    return false;
  }

  return ROLE_PERMISSIONS[role].includes(permission);
}
