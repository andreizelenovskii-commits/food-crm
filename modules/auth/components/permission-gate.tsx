"use client";

import type { ReactNode } from "react";
import { useEmployeeSession } from "@/modules/auth/components/employee-session-provider";
import type { AuthPermission } from "@/modules/auth/authz";

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: AuthPermission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = useEmployeeSession();

  return can(permission) ? children : fallback;
}
