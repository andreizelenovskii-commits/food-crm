import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";

const WEBSITE_BLOCKS = [
  {
    title: "Ссылка на сайт",
    description: "Здесь позже закрепим основной адрес сайта и сделаем горячую кнопку для мгновенного перехода.",
    status: "Не добавлена",
  },
  {
    title: "Каталог на сайте",
    description: "Позиции прайса будут подтягиваться из каталога CRM и привязываться к технологическим картам.",
    status: "Подготовка",
  },
  {
    title: "Быстрый переход",
    description: "После добавления домена здесь появится отдельная кнопка, чтобы открывать сайт в один клик.",
    status: "Скоро",
  },
];

export default async function WebsitePage() {
  const user = await requirePermission("view_dashboard");

  return (
    <PageShell
      title="Наш сайт"
      description="Здесь соберём адрес сайта, быстрый переход и всё, что связано с опубликованной витриной бизнеса."
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
              Управление публичным сайтом
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Раздел подготовлен под будущую связку CRM с сайтом. Когда сайт будет готов,
              сюда добавим основную ссылку и горячую кнопку перехода.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Статус сайта</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">В работе</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Каталог</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">Готовим</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="text-sm font-medium text-zinc-500">Переход</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">Скоро</p>
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
            <p>Основной домен сайта и его рабочий статус.</p>
            <p>Горячая кнопка перехода на сайт прямо из CRM.</p>
            <p>Связка каталога сайта с позициями и технологическими картами.</p>
            <p>Контроль публикации и подготовка к будущим онлайн-заказам.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-sm font-medium text-emerald-800">
              Пока ссылка не добавлена
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-900/80">
              Когда определимся с доменом сайта, сюда добавим рабочую ссылку и кнопку
              мгновенного открытия.
            </p>
            <Link
              href="/dashboard/catalog"
              className="mt-4 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100/60"
            >
              Перейти в каталог
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
