import { PageShell } from "@/components/ui/page-shell";
import { fetchAccessModel } from "@/modules/settings/access-model.api";
import { RolesPermissionsPanel } from "@/modules/settings/components/roles-permissions-panel";

export default async function RightsSettingsPage() {
  const accessModel = await fetchAccessModel();

  return (
    <PageShell
      title="Роли и права"
      description="Единая матрица доступов сотрудников: роли, категории и конкретные разрешения."
      backHref="/dashboard/settings"
    >
      <RolesPermissionsPanel accessModel={accessModel} />
    </PageShell>
  );
}
