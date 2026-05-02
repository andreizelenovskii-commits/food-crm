import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { InventoryAuditDialogs } from "@/modules/inventory/components/inventory-audit-dialogs";
import { InventoryIncomingPanel } from "@/modules/inventory/components/inventory-incoming-panel";
import { InventoryWriteoffPanel } from "@/modules/inventory/components/inventory-writeoff-panel";
import { InventoryProductsTab } from "@/modules/inventory/components/inventory-products-tab";
import {
  buildInventoryPageViewModel,
  INVENTORY_TABS,
  type InventoryPageProps,
} from "@/modules/inventory/inventory.page-model";
import { TechCardForm } from "@/modules/tech-cards/components/tech-card-form";

export function InventoryPage({
  user,
  canManageInventory,
  products,
  responsibleOptions,
  incomingActs,
  inventorySessions,
  writeoffActs,
  employees,
  techCards,
  techCardProducts,
  searchParams,
}: InventoryPageProps) {
  const {
    activeTab,
    rawQuery,
    selectedCategory,
    selectedRecipeCategory,
    totalStock,
    totalValueCents,
    filteredProducts,
    categorySummaries,
    lowStockProducts,
    lowStockCount,
    zeroStockCount,
    filteredTechCards,
    recipeCategorySummaries,
    clearRecipeDraft,
  } = buildInventoryPageViewModel({
    products,
    techCards,
    searchParams,
  });

  return (
    <PageShell
      title="Склад"
      description="Здесь хранится всё по складу: товары, остатки, средняя закупочная цена и движение."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <section className="mb-6 rounded-[14px] border border-zinc-200 bg-white/90 p-3 shadow-sm shadow-zinc-950/5">
        <div className="grid gap-2 md:grid-cols-5">
          {INVENTORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Link
                key={tab.key}
                href={tab.key === "products" ? "/dashboard/inventory" : `/dashboard/inventory?tab=${tab.key}`}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-950 shadow-sm shadow-zinc-950/10"
                    : "bg-white text-zinc-950 ring-1 ring-zinc-200 hover:bg-zinc-100 hover:text-black hover:ring-zinc-300"
                }`}
                style={isActive ? { color: "#ffffff" } : { color: "#09090b" }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </section>

      {activeTab === "products" ? (
        <InventoryProductsTab
          products={products}
          filteredProducts={filteredProducts}
          lowStockProducts={lowStockProducts}
          categorySummaries={categorySummaries}
          rawQuery={rawQuery}
          selectedCategory={selectedCategory}
          totalStock={totalStock}
          totalValueCents={totalValueCents}
          canManageInventory={canManageInventory}
        />
      ) : null}

      {activeTab === "incoming" ? (
        <InventoryIncomingPanel
          products={products}
          responsibleOptions={responsibleOptions}
          acts={incomingActs}
          canManageInventory={canManageInventory}
        />
      ) : null}

      {activeTab === "writeoff" ? (
        <InventoryWriteoffPanel
          products={products}
          responsibleOptions={responsibleOptions}
          acts={writeoffActs}
          canManageInventory={canManageInventory}
        />
      ) : null}

      {activeTab === "audit" ? (
        <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
          <div className="space-y-5">
            <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f1_100%)] p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Инвентаризация
              </p>
              <h2 className="mt-3 max-w-[18rem] text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.02em] text-zinc-950">
                Сверка факта и системы
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-7 text-zinc-600">
                Проводи ревизию по товарам, фиксируй реальные остатки и сразу обновляй склад по факту пересчёта.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-[26px] border border-white/90 bg-white/90 p-4 shadow-sm shadow-zinc-950/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">На сверку</p>
                  <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-zinc-950">{products.length}</p>
                  <p className="mt-3 text-[14px] leading-6 text-zinc-500">Всех складских позиций в системе</p>
                </div>
                <div className="rounded-[26px] border border-white/90 bg-white/90 p-4 shadow-sm shadow-zinc-950/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Мало остатка</p>
                  <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-zinc-950">{lowStockCount}</p>
                  <p className="mt-3 text-[14px] leading-6 text-zinc-500">Позиции, которые стоит проверить в первую очередь</p>
                </div>
                <div className="rounded-[26px] border border-white/90 bg-white/90 p-4 shadow-sm shadow-zinc-950/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Нулевой остаток</p>
                  <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-zinc-950">{zeroStockCount}</p>
                  <p className="mt-3 text-[14px] leading-6 text-zinc-500">Позиции, где система уже показывает ноль</p>
                </div>
              </div>
            </section>

            <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:p-5">
              <h2 className="text-[1.55rem] font-semibold tracking-[-0.02em] text-zinc-950">Как работать с ревизией</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-[12px] border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-sm font-medium text-zinc-900">1. Найди нужную группу товаров</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Отфильтруй список по категории или найди конкретный товар по названию и внутреннему коду.
                  </p>
                </div>
                <div className="rounded-[12px] border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-sm font-medium text-zinc-900">2. Внеси фактический остаток</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Вводи только те позиции, которые уже пересчитаны. Черновик сохраняется локально и не слетает при обновлении страницы.
                  </p>
                </div>
                <div className="rounded-[12px] border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-sm font-medium text-zinc-900">3. Сохрани итоговый лист</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    После создания лист зафиксирует выбранные товары, ответственного и остатки системы на текущий момент.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:p-5">
              <h2 className="text-[1.55rem] font-semibold tracking-[-0.02em] text-zinc-950">Готовность команды</h2>
              <p className="mt-2 text-[15px] leading-7 text-zinc-600">
                Ответственный за инвентаризацию выбирается из текущего списка сотрудников.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[12px] border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Сотрудников доступно</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{employees.length}</p>
                </div>
                <div className="rounded-[12px] border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Создано листов</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{inventorySessions.length}</p>
                </div>
              </div>
            </section>
          </div>

          <InventoryAuditDialogs
            products={products}
            responsibleOptions={responsibleOptions}
            sessions={inventorySessions}
            canManageInventory={canManageInventory}
            lowStockCount={lowStockCount}
            zeroStockCount={zeroStockCount}
          />
        </div>
      ) : null}

      {activeTab === "recipes" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] xl:items-start">
          <div className="space-y-5">
            <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f1_100%)] p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Технологические карты
              </p>
              <h2 className="mt-3 max-w-[18rem] text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.02em] text-zinc-950">
                Состав и нормы расхода
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-7 text-zinc-600">
                Здесь будем связывать продаваемые позиции с ингредиентами и автоматически считать расход склада.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[26px] border border-white/90 bg-white/90 p-4 shadow-sm shadow-zinc-950/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Техкарт</p>
                  <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-zinc-950">
                    {techCards.length}
                  </p>
                  <p className="mt-3 max-w-[12rem] text-[14px] leading-6 text-zinc-500">
                    Создано для каталога и кухни
                  </p>
                </div>
                <div className="rounded-[26px] border border-white/90 bg-white/90 p-4 shadow-sm shadow-zinc-950/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Ингредиенты</p>
                  <p className="mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-zinc-950">
                    {products.length}
                  </p>
                  <p className="mt-3 max-w-[12rem] text-[14px] leading-6 text-zinc-500">
                    Доступно позиций для состава
                  </p>
                </div>
                <div className="rounded-[26px] border border-white/90 bg-white/90 p-4 shadow-sm shadow-zinc-950/5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Автосписание</p>
                  <p className="mt-3 text-[1.35rem] font-semibold leading-[1.2] tracking-[-0.02em] text-zinc-950">
                    В планах
                  </p>
                  <p className="mt-3 max-w-[12rem] text-[14px] leading-6 text-zinc-500">
                    Следующий этап после настройки техкарт
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5 xl:p-5">
              <h2 className="text-[1.55rem] font-semibold tracking-[-0.02em] text-zinc-950">Список технологических карт</h2>
              <p className="mt-2 text-[15px] leading-7 text-zinc-600">
                Здесь хранятся реальные технологические карты, которые можно будет связывать с каталогом сайта.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/inventory?tab=recipes"
                  scroll={false}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    !selectedRecipeCategory
                      ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/10"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"
                  }`}
                  style={!selectedRecipeCategory ? { color: "#ffffff" } : undefined}
                >
                  Все категории
                </Link>
                {recipeCategorySummaries.map((item) => {
                  const isActive = selectedRecipeCategory === item.category;

                  return (
                    <Link
                      key={item.category}
                      href={`/dashboard/inventory?tab=recipes&recipeCategory=${encodeURIComponent(item.category)}`}
                      scroll={false}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
                          : "border border-red-100 bg-red-50/70 text-red-800 hover:border-red-200 hover:bg-red-100"
                      }`}
                      style={isActive ? { color: "#ffffff" } : undefined}
                    >
                      {item.category} {item.count}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 space-y-4">
                {filteredTechCards.length === 0 ? (
                  <div className="rounded-[14px] border border-dashed border-zinc-300 bg-zinc-50 p-4 sm:p-5 text-sm text-zinc-500">
                    {techCards.length === 0
                      ? "Пока технологических карт ещё нет."
                      : "В этой категории технологических карт пока нет."}
                  </div>
                ) : (
                  filteredTechCards.map((card) => (
                    <article
                      key={card.id}
                      className="rounded-[14px] border border-zinc-200 bg-zinc-50/90 p-5"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-zinc-950">{card.name}</h3>
                            <p className="text-sm text-red-800">{card.category}</p>
                            {card.pizzaSize ? (
                              <p className="text-sm text-zinc-500">Размер: {card.pizzaSize}</p>
                            ) : null}
                            <p className="text-sm text-zinc-500">
                              Выход: {card.outputQuantity} {card.outputUnit}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                              Ингредиентов: {card.ingredients.length}
                            </span>
                            {canManageInventory ? (
                              <Link
                                href={`/dashboard/inventory/tech-cards/${card.id}`}
                                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
                              >
                                Редактировать
                              </Link>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                          {card.ingredients.map((ingredient) => (
                            <p key={ingredient.id} className="rounded-2xl bg-white px-3 py-2 ring-1 ring-zinc-200/80">
                              {ingredient.productName}: {ingredient.quantity} {ingredient.unit}
                            </p>
                          ))}
                        </div>

                        {card.description ? (
                          <p className="text-sm leading-6 text-zinc-600">{card.description}</p>
                        ) : null}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          {canManageInventory ? (
            <TechCardForm
              products={techCardProducts}
              clearDraft={clearRecipeDraft}
            />
          ) : (
            <aside className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-zinc-950">Новая техкарта</h2>
                <p className="text-sm leading-6 text-zinc-600">
                  Здесь можно будет создавать новые техкарты, если у роли есть право управления складом.
                </p>
              </div>
            </aside>
          )}
        </div>
      ) : null}
    </PageShell>
  );
}
