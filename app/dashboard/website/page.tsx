import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";

const WEBSITE_BLOCKS = [
  {
    title: "Ссылка на сайт",
    description: "Основной публичный домен закреплён и ведёт на витрину Andromeda.",
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
      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="space-y-6">
          <article className="rounded-3xl border border-emerald-100 bg-[linear-gradient(180deg,#f8fff9_0%,#eef9f0_100%)] p-6 shadow-sm shadow-emerald-950/5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700/80">
              Витрина бизнеса
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Публичный сайт Andromeda
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Основной домен уже подготовлен под витрину доставки. Сайт показывает
              первый экран, меню, доставку, контакты и вход для сотрудников.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Статус сайта</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">Online</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Каталог</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">Меню</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Переход</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">Готов</p>
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            {WEBSITE_BLOCKS.map((block) => (
              <article
                key={block.title}
                className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm shadow-emerald-950/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-950">{block.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{block.description}</p>
                  </div>
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                    {block.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Что появится дальше</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
            <p>Публичное оформление заказа без звонка.</p>
            <p>Управление публикацией позиций прямо из CRM.</p>
            <p>Отдельные страницы категорий и акций.</p>
            <p>Контроль публикации и подготовка к будущим онлайн-заказам.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-sm font-medium text-emerald-800">
              Основной адрес
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-900/80">
              Публичный сайт доступен по домену crmandromeda.ru. После настройки
              онлайн-заказов эта ссылка станет входной точкой для клиентов.
            </p>
            <Link
              href="https://crmandromeda.ru"
              className="mt-4 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100/60"
            >
              Открыть сайт
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
