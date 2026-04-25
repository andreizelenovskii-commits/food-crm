import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { CatalogItemDeleteButton } from "@/modules/catalog/components/catalog-item-delete-button";
import { CatalogItemForm } from "@/modules/catalog/components/catalog-item-form";
import { CATALOG_PRICE_LIST_LABELS } from "@/modules/catalog/catalog.types";
import { fetchCatalogItems } from "@/modules/catalog/catalog.service";
import { fetchTechCardOptions } from "@/modules/tech-cards/tech-cards.service";
import { TECH_CARD_CATEGORIES } from "@/modules/tech-cards/tech-cards.types";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function CatalogPage(props: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const user = await requirePermission("view_catalog");
  const searchParams = await props.searchParams;
  const [catalogItems, techCardOptions] = await Promise.all([
    fetchCatalogItems(),
    fetchTechCardOptions(),
  ]);
  const selectedCategory = searchParams?.category?.trim() ?? "";
  const filteredItems = selectedCategory
    ? catalogItems.filter((item) => item.category === selectedCategory)
    : catalogItems;
  const clientPriceItems = filteredItems.filter((item) => item.priceListType === "CLIENT");
  const internalPriceItems = filteredItems.filter((item) => item.priceListType === "INTERNAL");
  const linkedCount = catalogItems.filter((item) => item.technologicalCardId > 0).length;

  return (
    <PageShell
      title="Каталог"
      description="Здесь живут клиентский и внутренний прайс, а каждая позиция связана с технологической картой."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <article className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef4eb_100%)] p-6 shadow-sm shadow-zinc-950/5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
              Прайсы и структура
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Клиентский и внутренний прайс
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Здесь мы храним реальные позиции каталога и сразу решаем, куда они попадут: в клиентский прайс или во внутренний.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Всего позиций</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{catalogItems.length}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Клиентский прайс</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{clientPriceItems.length}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Внутренний прайс</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{internalPriceItems.length}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 md:col-span-3">
                <p className="text-sm font-medium text-zinc-500">Связано с техкартами</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{linkedCount}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Как будет устроен модуль</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-zinc-600">
              <p>Каждая новая позиция сразу получает обязательный тип прайса: клиентский или внутренний.</p>
              <p>Категория выбирается только из тех же категорий, что и в технологических картах, чтобы структура не расползалась.</p>
              <p>Позиция каталога по-прежнему привязана к техкарте, так что цена и состав остаются в одной логике.</p>
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Позиции каталога</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Здесь находятся реальные позиции прайсов, уже связанные с технологическими картами.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/catalog"
                scroll={false}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !selectedCategory
                    ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/10"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"
                }`}
                style={!selectedCategory ? { color: "#ffffff" } : undefined}
              >
                Все категории
              </Link>
              {TECH_CARD_CATEGORIES.map((category) => {
                const count = catalogItems.filter((item) => item.category === category).length;

                if (!count) {
                  return null;
                }

                const isActive = selectedCategory === category;

                return (
                  <Link
                    key={category}
                    href={`/dashboard/catalog?category=${encodeURIComponent(category)}`}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/10"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"
                    }`}
                    style={isActive ? { color: "#ffffff" } : undefined}
                  >
                    {category} · {count}
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 space-y-6">
              {filteredItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                  {selectedCategory
                    ? "В этой категории пока нет позиций."
                    : "Пока каталог ещё не наполнен."}
                </div>
              ) : null}

              {[
                { title: "Клиентский прайс", items: clientPriceItems },
                { title: "Внутренний прайс", items: internalPriceItems },
              ].map((group) => (
                <section key={group.title} className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-zinc-950">{group.title}</h3>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
                      {group.items.length} поз.
                    </span>
                  </div>

                  {group.items.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500">
                      Пока пусто.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {group.items.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="text-lg font-semibold text-zinc-950">{item.name}</h4>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                                  {CATALOG_PRICE_LIST_LABELS[item.priceListType]}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                                  {item.category || "Без категории"}
                                </span>
                              </div>

                              <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                                <p>Техкарта: {item.technologicalCardName}</p>
                                <p>Цена: {formatMoney(item.priceCents)}</p>
                              </div>

                              {item.description ? (
                                <p className="text-sm leading-6 text-zinc-600">{item.description}</p>
                              ) : null}
                            </div>

                            {hasPermission(user, "manage_catalog") ? (
                              <div className="flex shrink-0 flex-wrap gap-2">
                                <Link
                                  href={`/dashboard/catalog/${item.id}`}
                                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
                                >
                                  Редактировать
                                </Link>
                                <CatalogItemDeleteButton
                                  catalogItemId={item.id}
                                  itemName={item.name}
                                />
                              </div>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>
        </section>

        {hasPermission(user, "manage_catalog") ? (
          <CatalogItemForm techCardOptions={techCardOptions} />
        ) : (
          <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Что будет дальше</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
              <p>Наполнение клиентского и внутреннего прайса рабочими позициями.</p>
              <p>Жёсткая привязка каждой позиции к технологической карте.</p>
              <p>Подготовка данных для сайта и внутренней операционной работы.</p>
              <p>Дальше сюда можно добавить фото, состав и отдельные правила показа.</p>
            </div>
          </aside>
        )}
      </div>
    </PageShell>
  );
}
