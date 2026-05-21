import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PaginatedList } from "@/components/ui/paginated-list";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import { CatalogItemDeleteButton } from "@/modules/catalog/components/catalog-item-delete-button";
import { CatalogItemForm } from "@/modules/catalog/components/catalog-item-form";
import {
  CATALOG_PRICE_LIST_LABELS,
  CATALOG_SITE_CATEGORIES,
} from "@/modules/catalog/catalog.types";
import { fetchCatalogItems } from "@/modules/catalog/catalog.api";
import { fetchTechCardOptions } from "@/modules/tech-cards/tech-cards.api";

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
  const itemsWithPhotosCount = catalogItems.filter((item) => item.imageUrl).length;

  return (
    <PageShell
      title="Каталог"
      description="Здесь живут клиентский и внутренний прайс, а каждая позиция связана с технологической картой."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="foodlike-frame grid gap-4 p-4 sm:p-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5">
          <GlassPanel className="p-4 sm:p-5">
            <p className="foodlike-kicker">
              Прайсы и структура
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Клиентский и внутренний прайс
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Здесь мы храним реальные позиции каталога и сразу решаем, куда они попадут: в клиентский прайс или во внутренний.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <KpiTile label="Всего позиций" value={catalogItems.length} hint="Во всех прайсах" />
              <KpiTile label="Клиентский прайс" value={clientPriceItems.length} hint="Для сайта и клиентов" />
              <KpiTile label="Внутренний прайс" value={internalPriceItems.length} hint="Для служебных заказов" />
              <KpiTile label="Готовность к сайту" value={`${itemsWithPhotosCount}/${linkedCount}`} hint="Фото у связанных позиций" />
            </div>
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-5">
            <h2 className="foodlike-title-sm">Как устроен модуль</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-zinc-600">
              <p>Каждая новая позиция сразу получает обязательный тип прайса: клиентский или внутренний.</p>
              <p>Категория на сайте выбирается обязательно: так позиция сразу попадает в правильный раздел клиентского меню.</p>
              <p>Фото, цена и привязка к техкарте обязательны, чтобы клиентский сайт показывал именно рабочие позиции прайса.</p>
            </div>
          </GlassPanel>

          <GlassPanel className="p-4 sm:p-5">
            <h2 className="foodlike-title-sm">Позиции каталога</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Здесь находятся реальные позиции прайсов, уже связанные с технологическими картами.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/catalog"
                scroll={false}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !selectedCategory
                    ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
                    : "border border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
                }`}
                style={!selectedCategory ? { color: "#ffffff" } : undefined}
              >
                Все категории
              </Link>
              {CATALOG_SITE_CATEGORIES.map((category) => {
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
                        ? "bg-red-800 text-white shadow-sm shadow-red-950/15"
                        : "border border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
                    }`}
                    style={isActive ? { color: "#ffffff" } : undefined}
                  >
                    {category} · {count}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 space-y-5">
              {filteredItems.length === 0 ? (
                <div className="foodlike-empty p-4 sm:p-5">
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
                    <span className="foodlike-pill">
                      {group.items.length} поз.
                    </span>
                  </div>

                  {group.items.length === 0 ? (
                    <div className="foodlike-empty p-5">
                      Пока пусто.
                    </div>
                  ) : (
                    <PaginatedList itemLabel="позиций">
                      {group.items.map((item) => (
                        <article
                          key={item.id}
                          className="foodlike-card p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                              <div className="h-28 w-full shrink-0 overflow-hidden rounded-[18px] bg-red-50 sm:w-36">
                                {item.imageUrl ? (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </>
                                ) : (
                                  <div className="flex h-full items-center justify-center px-3 text-center text-xs text-zinc-500">
                                    Нет фото
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="text-lg font-semibold text-zinc-950">{item.name}</h4>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                                  {CATALOG_PRICE_LIST_LABELS[item.priceListType]}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                                  {item.category || "Без категории"}
                                </span>
                                {item.pizzaSize ? (
                                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                                    {item.pizzaSize}
                                  </span>
                                ) : null}
                                {item.rollSize ? (
                                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                                    {item.rollSize}
                                  </span>
                                ) : null}
                              </div>

                              <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                                <p>Техкарта: {item.technologicalCardName}</p>
                                <p>Цена: {formatMoney(item.priceCents)}</p>
                              </div>

                              {item.description ? (
                                <p className="text-sm leading-6 text-zinc-600">{item.description}</p>
                              ) : null}
                              </div>
                            </div>

                            {hasPermission(user, "manage_catalog") ? (
                              <div className="flex shrink-0 flex-wrap gap-2">
                                <Link
                                  href={`/dashboard/catalog/${item.id}`}
                                  className="foodlike-button-secondary min-h-9 px-4"
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
                    </PaginatedList>
                  )}
                </section>
              ))}
            </div>
          </GlassPanel>
        </section>

        {hasPermission(user, "manage_catalog") ? (
          <CatalogItemForm techCardOptions={techCardOptions} />
        ) : (
          <GlassPanel className="p-4 sm:p-5">
            <h2 className="foodlike-title-sm">Что будет дальше</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
              <p>Наполнение клиентского и внутреннего прайса рабочими позициями.</p>
              <p>Жёсткая привязка каждой позиции к технологической карте.</p>
              <p>Подготовка данных для сайта и внутренней операционной работы.</p>
              <p>Фото, цена, категория и технологическая карта собираются в одной карточке прайса.</p>
            </div>
          </GlassPanel>
        )}
      </div>
    </PageShell>
  );
}
