import { backendGet } from "@/shared/api/backend";
import type { AuthPermission } from "@/modules/auth/authz";
import type { UserRole } from "@/modules/auth/auth.types";

export type AccessRoleModel = {
  role: UserRole;
  label: string;
  permissions: AuthPermission[];
};

export type AccessModel = {
  permissions: AuthPermission[];
  roles: AccessRoleModel[];
};

export async function fetchAccessModel() {
  return backendGet<AccessModel>("/api/v1/access-model");
}
