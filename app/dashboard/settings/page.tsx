import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";

const SETTINGS_BLOCKS = [
  {
    title: "ОФД",
    description: "Настройка оператора фискальных данных, статуса отправки чеков и параметров фискализации.",
    status: "Не подключено",
  },
  {
    title: "Подключение касс",
    description: "Привязка онлайн-касс, выбор точки продаж, тестирование связи и контроль доступности устройств.",
    status: "0 устройств",
  },
  {
    title: "Эквайринг и терминалы",
    description: "Платёжные терминалы, типы оплат, онлайн-эквайринг и поведение платёжных сценариев.",
    status: "Не настроено",
  },
  {
    title: "Службы доставки и каналы",
    description: "Интеграции с внешними каналами, агрегаторами, уведомлениями и службами доставки.",
    status: "В планах",
  },
];

export default async function SettingsPage() {
  const user = await requirePermission("view_settings");

  return (
    <PageShell
      title="Настройки"
      description="Здесь будут собраны системные настройки бизнеса: ОФД, кассы, платёжные подключения и внешние интеграции."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="foodlike-frame grid gap-4 p-4 sm:p-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5">
          <GlassPanel className="p-4 sm:p-5">
            <p className="foodlike-kicker">
              Системный контур
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Инфраструктура продаж и интеграций
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Раздел предназначен для технической и операционной настройки CRM. Доступ сюда лучше держать только у управляющего.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <KpiTile label="Интеграций" value={4} hint="Запланировано" />
              <KpiTile label="Активных касс" value={0} hint="Пока не подключены" />
              <KpiTile label="ОФД" value="-" hint="Ожидает настройки" />
            </div>
          </GlassPanel>

          <div className="grid gap-4">
            {SETTINGS_BLOCKS.map((block) => (
              <GlassPanel
                key={block.title}
                className="p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="foodlike-title-sm">{block.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{block.description}</p>
                  </div>
                  <span className="foodlike-pill">
                    {block.status}
                  </span>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>

        <GlassPanel className="p-4 sm:p-5">
          <h2 className="foodlike-title-sm">Что можно будет настраивать</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
            <p>Реквизиты компании и параметры фискализации.</p>
            <p>Подключение онлайн-касс и распределение по точкам.</p>
            <p>Платёжные терминалы, способы оплаты и тестовые подключения.</p>
            <p>Внешние интеграции, webhooks, ОФД и служебные уведомления.</p>
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
