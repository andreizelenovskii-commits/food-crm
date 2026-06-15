import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { hasPermission } from "@/modules/auth/authz";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { fetchAccessModel } from "@/modules/settings/access-model.api";
import { RolesPermissionsEditor } from "@/modules/settings/components/roles-permissions-editor";

export default async function RightsSettingsPage() {
  const user = await requirePermission("view_settings");
  const accessModel = await fetchAccessModel();

  return (
    <PageShell
      title="Роли и права"
      description="Единая матрица доступов сотрудников: роли, категории и конкретные разрешения."
      backHref="/dashboard/settings"
      action={<SessionUserActions user={user} />}
    >
      <RolesPermissionsEditor
        accessModel={accessModel}
        canManageSettings={hasPermission(user, "manage_settings")}
      />
    </PageShell>
  );
}
