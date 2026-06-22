"use client";

import { useEmployeeSession } from "@/modules/auth/components/employee-session-provider";
import type { AccessModel } from "@/modules/settings/access-model.api";
import { RolesPermissionsEditor } from "@/modules/settings/components/roles-permissions-editor";

export function RolesPermissionsPanel({ accessModel }: { accessModel: AccessModel }) {
  const { can } = useEmployeeSession();

  return (
    <RolesPermissionsEditor
      accessModel={accessModel}
      canManageSettings={can("manage_settings")}
    />
  );
}
