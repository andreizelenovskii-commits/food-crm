import { PageShell } from "@/components/ui/page-shell";
import { SettingsControlCenter } from "@/modules/settings/components/settings-control-center";

export default async function SettingsPage() {
  return (
    <PageShell
      title="Настройки"
      description="Операционный контур: экраны кухни и диспетчеров, кассы, ОФД, онлайн-оплата, эквайринг и принтеры."
      backHref="/dashboard"
    >
      <SettingsControlCenter />
    </PageShell>
  );
}
