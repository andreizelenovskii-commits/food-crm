import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { SettingsControlCenter } from "@/modules/settings/components/settings-control-center";

export default async function SettingsPage() {
  const user = await requirePermission("view_settings");

  return (
    <PageShell
      title="Настройки"
      description="Операционный контур: экраны кухни и диспетчеров, кассы, ОФД, онлайн-оплата, эквайринг и принтеры."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <SettingsControlCenter />
    </PageShell>
  );
}
