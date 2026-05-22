import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";

const ROLES = [
  { name: "Администратор", description: "Полный доступ к рабочим разделам и настройкам." },
  { name: "Управляющий", description: "Операционное управление заказами, складом и сотрудниками." },
  { name: "Диспетчер", description: "Создание заказов и движение клиентского заказа по этапам." },
  { name: "Повар", description: "Работа с кухонным этапом и выбор упаковки при отдаче блюда." },
  { name: "Курьер", description: "Закрытие доставленных и оплаченных заказов." },
];

export default async function RolesSettingsPage() {
  const user = await requirePermission("view_settings");

  return (
    <PageShell
      title="Роли"
      description="Роли определяют, какие действия сотрудник может выполнять в CRM."
      backHref="/dashboard/settings"
      action={<SessionUserActions user={user} />}
    >
      <GlassPanel className="p-4 sm:p-5">
        <p className="foodlike-kicker">Матрица ролей</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Рабочие роли</h2>
        <div className="mt-4 grid gap-3">
          {ROLES.map((role) => (
            <div
              key={role.name}
              className="rounded-[16px] border border-red-950/10 bg-white/75 p-4"
            >
              <h3 className="text-sm font-semibold text-zinc-950">{role.name}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-600">{role.description}</p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </PageShell>
  );
}
