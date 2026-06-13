import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { RolesPermissionsEditor } from "@/modules/settings/components/roles-permissions-editor";

export default async function RightsSettingsPage() {
  const user = await requirePermission("view_settings");

  return (
    <PageShell
      title="Роли и права"
      description="Единая матрица доступов сотрудников: роли, категории и конкретные разрешения."
      backHref="/dashboard/settings"
      action={<SessionUserActions user={user} />}
    >
      <RolesPermissionsEditor />
    </PageShell>
  );
}
