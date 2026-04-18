import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";

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
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <article className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef1f7_100%)] p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
              Системный контур
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Инфраструктура продаж и интеграций
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Раздел предназначен для технической и операционной настройки CRM. Доступ сюда лучше держать только у управляющего.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Интеграций</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">4</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Активных касс</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">ОФД</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">-</p>
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            {SETTINGS_BLOCKS.map((block) => (
              <article
                key={block.title}
                className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-950">{block.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{block.description}</p>
                  </div>
                  <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
                    {block.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Что можно будет настраивать</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
            <p>Реквизиты компании и параметры фискализации.</p>
            <p>Подключение онлайн-касс и распределение по точкам.</p>
            <p>Платёжные терминалы, способы оплаты и тестовые подключения.</p>
            <p>Внешние интеграции, webhooks, ОФД и служебные уведомления.</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
