import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { CatalogItemForm } from "@/modules/catalog/components/catalog-item-form";
import { fetchCatalogItems } from "@/modules/catalog/catalog.service";
import { fetchTechCardOptions } from "@/modules/tech-cards/tech-cards.service";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function CatalogPage() {
  const user = await requirePermission("view_catalog");
  const [catalogItems, techCardOptions] = await Promise.all([
    fetchCatalogItems(),
    fetchTechCardOptions(),
  ]);
  const publishedCount = catalogItems.filter((item) => item.isPublished).length;
  const linkedCount = catalogItems.filter((item) => item.technologicalCardId > 0).length;

  return (
    <PageShell
      title="Каталог"
      description="Здесь будет каталог сайта: прайс, публичные позиции и связь каждой карточки с технологической картой."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <article className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef4eb_100%)] p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
              Витрина сайта
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Прайс и публичные позиции
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Этот модуль будет отвечать за то, что видит клиент на сайте: карточки позиций, цены, описания и доступность в каталоге.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Позиций в каталоге</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{catalogItems.length}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">В прайсе</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{publishedCount}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Связано с техкартами</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{linkedCount}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Как будет устроен модуль</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-zinc-600">
              <p>Каталог хранит только те позиции, которые мы хотим показывать на сайте и в публичном прайсе.</p>
              <p>Каждая позиция каталога будет привязываться к технологической карте, чтобы цена и состав шли от производственной логики, а не вручную в разных местах.</p>
              <p>Отдельно можно будет управлять видимостью, категорией, описанием, фото, порядком вывода и доступностью позиции.</p>
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Список позиций каталога</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Здесь находятся реальные позиции прайса и сайта, уже связанные с технологическими картами.
            </p>
            <div className="mt-6 space-y-4">
              {catalogItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                  Пока каталог ещё не наполнен.
                </div>
              ) : (
                catalogItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-zinc-950">{item.name}</h3>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                            /{item.slug}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              item.isPublished
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-zinc-200 text-zinc-700"
                            }`}
                          >
                            {item.isPublished ? "Опубликовано" : "Черновик"}
                          </span>
                        </div>

                        <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                          <p>Категория: {item.category || "Без категории"}</p>
                          <p>Техкарта: {item.technologicalCardName}</p>
                          <p>Порядок: {item.displayOrder}</p>
                          <p>Цена: {formatMoney(item.priceCents)}</p>
                        </div>

                        {item.description ? (
                          <p className="text-sm leading-6 text-zinc-600">{item.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>

        {hasPermission(user, "manage_catalog") ? (
          <CatalogItemForm techCardOptions={techCardOptions} />
        ) : (
          <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Что будет дальше</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
              <p>Создание категории каталога и публичных карточек.</p>
              <p>Привязка каждой карточки к технологической карте.</p>
              <p>Управление ценой, доступностью и публикацией на сайте.</p>
              <p>Подготовка данных для синхронизации с фронтендом сайта.</p>
            </div>
          </aside>
        )}
      </div>
    </PageShell>
  );
}
