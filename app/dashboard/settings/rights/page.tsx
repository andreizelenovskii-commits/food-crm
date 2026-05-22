import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";

const RIGHTS = [
  "Просмотр заказов",
  "Управление заказами",
  "Просмотр склада",
  "Управление складом",
  "Просмотр настроек",
];

export default async function RightsSettingsPage() {
  const user = await requirePermission("view_settings");

  return (
    <PageShell
      title="Права"
      description="Сводка доступов, которые используются в CRM для ограничения рабочих разделов."
      backHref="/dashboard/settings"
      action={<SessionUserActions user={user} />}
    >
      <GlassPanel className="p-4 sm:p-5">
        <p className="foodlike-kicker">Доступы</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Права сотрудников</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {RIGHTS.map((right) => (
            <div
              key={right}
              className="rounded-[16px] border border-red-950/10 bg-white/75 px-4 py-3 text-sm font-semibold text-zinc-800"
            >
              {right}
            </div>
          ))}
        </div>
      </GlassPanel>
    </PageShell>
  );
}
