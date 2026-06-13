import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { KitchenZonesEditor } from "@/modules/settings/components/kitchen-zones-editor";

export default async function KitchenZonesSettingsPage() {
  const user = await requirePermission("view_settings");

  return (
    <PageShell
      title="Кухонные зоны"
      description="Маршрутизация категорий сайта на кухонные экраны и принтеры этикеток."
      backHref="/dashboard/settings"
      action={<SessionUserActions user={user} />}
    >
      <KitchenZonesEditor />
    </PageShell>
  );
}
