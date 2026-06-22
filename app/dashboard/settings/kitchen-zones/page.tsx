import { PageShell } from "@/components/ui/page-shell";
import { KitchenZonesEditor } from "@/modules/settings/components/kitchen-zones-editor";

export default async function KitchenZonesSettingsPage() {
  return (
    <PageShell
      title="Кухонные зоны"
      description="Маршрутизация категорий сайта на кухонные экраны и принтеры этикеток."
      backHref="/dashboard/settings"
    >
      <KitchenZonesEditor />
    </PageShell>
  );
}
