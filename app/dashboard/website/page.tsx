import { PageShell } from "@/components/ui/page-shell";
import { PUBLIC_SITE_URL } from "@/shared/deploy-public-urls";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";

const WEBSITE_BLOCKS = [
  {
    title: "Ссылка на сайт",
    description: "Основной публичный домен закреплён и ведёт на витрину FoodLike.",
    status: "Готово",
  },
  {
    title: "Каталог на сайте",
    description: "Главная страница показывает клиентский прайс, а если API закрыт, использует стартовую витрину.",
    status: "Работает",
  },
  {
    title: "Быстрый переход",
    description: "Сотрудники могут открыть публичный сайт прямо из этого раздела.",
    status: "Добавлен",
  },
];

export default async function WebsitePage() {
  const user = await requirePermission("view_dashboard");

  return (
    <PageShell
      title="Наш сайт"
      description="Публичная витрина бизнеса, быстрый переход и связка с клиентским каталогом."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="foodlike-frame grid gap-4 p-4 sm:p-5 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="space-y-5">
          <GlassPanel className="p-4 sm:p-5">
            <p className="foodlike-kicker">
              Витрина бизнеса
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Публичный сайт FoodLike
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Основной домен уже подготовлен под витрину доставки. Сайт показывает
              первый экран, меню, доставку, контакты и вход для сотрудников.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <KpiTile label="Статус сайта" value="Online" hint="Публичная витрина" />
              <KpiTile label="Каталог" value="Меню" hint="Клиентский прайс" />
              <KpiTile label="Переход" value="Готов" hint="Быстрый доступ" />
            </div>
          </GlassPanel>

          <div className="grid gap-4">
            {WEBSITE_BLOCKS.map((block) => (
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
          <h2 className="foodlike-title-sm">Что появится дальше</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
            <p>Публичное оформление заказа без звонка.</p>
            <p>Управление публикацией позиций прямо из CRM.</p>
            <p>Отдельные страницы категорий и акций.</p>
            <p>Контроль публикации и подготовка к будущим онлайн-заказам.</p>
          </div>

          <div className="mt-4 rounded-[18px] border border-red-100 bg-red-50/70 p-4">
            <p className="text-sm font-medium text-red-800">
              Основной адрес
            </p>
            <p className="mt-2 text-sm leading-6 text-red-900/80">
              Публичный сайт доступен по домену crmandromeda.ru. После настройки
              онлайн-заказов эта ссылка станет входной точкой для клиентов.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={PUBLIC_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="foodlike-button-secondary"
              >
                Публичный сайт
              </a>
            </div>
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
