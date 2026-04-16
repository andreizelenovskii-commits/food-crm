import type { SessionUser, UserRole } from "@/modules/auth/auth.types";

export const AUTH_PERMISSIONS = [
  "view_dashboard",
  "view_orders",
  "manage_orders",
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
    "view_clients",
    "manage_clients",
    "view_employees",
    "manage_employees",
  ],
  "Управляющий": [
    "view_dashboard",
    "view_orders",
    "manage_orders",
    "view_clients",
    "manage_clients",
    "view_employees",
    "manage_employees",
  ],
  "Диспетчер": [
    "view_dashboard",
    "view_orders",
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
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole.role;
  return ROLE_PERMISSIONS[role].includes(permission);
}
