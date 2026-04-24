import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { InventoryAuditDialogs } from "@/modules/inventory/components/inventory-audit-dialogs";
import { InventoryIncomingPanel } from "@/modules/inventory/components/inventory-incoming-panel";
import { InventoryWriteoffPanel } from "@/modules/inventory/components/inventory-writeoff-panel";
import { LowStockPanel } from "@/modules/inventory/components/low-stock-panel";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import { ProductForm } from "@/modules/inventory/components/product-form";
import { PRODUCT_CATEGORIES } from "@/modules/inventory/inventory.types";
import {
  fetchInventoryResponsibleOptions,
  fetchIncomingActs,
  fetchInventorySessions,
  fetchWriteoffActs,
  fetchProducts,
} from "@/modules/inventory/inventory.service";
import { fetchEmployees } from "@/modules/employees/employees.service";
import { TechCardForm } from "@/modules/tech-cards/components/tech-card-form";
import { TECH_CARD_CATEGORIES } from "@/modules/tech-cards/tech-cards.types";
import {
  fetchTechCardProductOptions,
  fetchTechCards,
} from "@/modules/tech-cards/tech-cards.service";

const INVENTORY_TABS = [
  { key: "products", label: "Товары" },
  { key: "incoming", label: "Поступление товара" },
  { key: "writeoff", label: "Списание товара" },
  { key: "audit", label: "Инвентаризация" },
  { key: "recipes", label: "Технологические карты" },
] as const;

type InventoryTab = (typeof INVENTORY_TABS)[number]["key"];

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function InventoryPage(props: {
  searchParams?: Promise<{ q?: string; tab?: string; category?: string; recipeCategory?: string; draft?: string }>;
}) {
  const user = await requirePermission("view_inventory");
  const searchParams = await props.searchParams;
  const [products, responsibleOptions, incomingActs, inventorySessions, writeoffActs, employees, techCards, techCardProducts] = await Promise.all([
    fetchProducts(),
    fetchInventoryResponsibleOptions(),
    fetchIncomingActs(),
    fetchInventorySessions(),
    fetchWriteoffActs(),
    fetchEmployees(),
    fetchTechCards(),
    fetchTechCardProductOptions(),
  ]);
  const rawQuery = searchParams?.q?.trim() ?? "";
  const normalizedQuery = rawQuery.toLowerCase();
  const selectedCategory = searchParams?.category?.trim() ?? "";
  const selectedRecipeCategory = searchParams?.recipeCategory?.trim() ?? "";
  const rawTab = searchParams?.tab?.trim() ?? "products";
  const activeTab: InventoryTab = INVENTORY_TABS.some((tab) => tab.key === rawTab)
    ? (rawTab as InventoryTab)
    : "products";
  const totalStock = products.reduce((sum, product) => sum + product.stockQuantity, 0);
  const totalValueCents = products.reduce(
    (sum, product) => sum + product.stockQuantity * product.priceCents,
    0,
  );
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.sku?.toLowerCase().includes(normalizedQuery) ||
      product.category?.toLowerCase().includes(normalizedQuery)
    );
  });
  const categorySummaries = PRODUCT_CATEGORIES.map((category) => ({
    category,
    count: products.filter((product) => product.category === category).length,
  })).filter((item) => item.count > 0);
  const lowStockProducts = filteredProducts
    .filter((product) => product.stockQuantity <= 5)
    .sort((left, right) => left.stockQuantity - right.stockQuantity);
  const lowStockCount = lowStockProducts.length;
  const zeroStockCount = products.filter((product) => product.stockQuantity === 0).length;
  const canManageInventory = hasPermission(user, "manage_inventory");
  const filteredTechCards = techCards.filter((card) =>
    !selectedRecipeCategory || card.category === selectedRecipeCategory,
  );
  const recipeCategorySummaries = TECH_CARD_CATEGORIES.map((category) => ({
    category,
    count: techCards.filter((card) => card.category === category).length,
  })).filter((item) => item.count > 0);

  return (
    <PageShell
      title="Склад"
      description="Здесь хранится всё по складу: товары, остатки, средняя закупочная цена и движение."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <section className="mb-6 rounded-3xl border border-zinc-200 bg-white/90 p-3 shadow-sm shadow-zinc-950/5">
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
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Поиск
                </p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                  По названию или SKU
                </h2>
              </div>

              {rawQuery ? (
                <Link
                  href={
                    selectedCategory
                      ? `/dashboard/inventory?category=${encodeURIComponent(selectedCategory)}`
                      : "/dashboard/inventory"
                  }
                  scroll={false}
                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-950"
                >
                  Сбросить
                </Link>
              ) : null}
            </div>

            <form action="/dashboard/inventory" className="mt-5 flex flex-col gap-3 sm:flex-row">
              {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
              <input
                name="q"
                type="search"
                defaultValue={rawQuery}
                placeholder="Например: Маргарита или SKU-001"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
              />
              <button
                type="submit"
                className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Найти
              </button>
            </form>

            {rawQuery ? (
              <p className="mt-3 text-sm text-zinc-500">
                По запросу <span className="font-medium text-zinc-900">{rawQuery}</span> найдено:{" "}
                {filteredProducts.length}
              </p>
            ) : null}
            {selectedCategory ? (
              <p className="mt-2 text-sm text-zinc-500">
                Активная категория: <span className="font-medium text-zinc-900">{selectedCategory}</span>
              </p>
            ) : null}
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f5f1e7_100%)] p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Склад под контролем
                </p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                  Остатки и стоимость
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Позиций</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{products.length}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Всего единиц</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">
                  {formatInventoryQuantity(totalStock)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Стоимость остатка по закупке</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{formatMoney(totalValueCents)}</p>
              </div>
            </div>
          </section>

          <LowStockPanel products={lowStockProducts} />

          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-950">Категории товаров</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Выбирай категорию, чтобы видеть только нужные складские позиции.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={
                  rawQuery
                    ? `/dashboard/inventory?q=${encodeURIComponent(rawQuery)}`
                    : "/dashboard/inventory"
                }
                scroll={false}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !selectedCategory
                    ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/10"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"
                }`}
                style={!selectedCategory ? { color: "#ffffff" } : undefined}
              >
                Все товары
              </Link>
              {categorySummaries.map((item) => {
                const href = `/dashboard/inventory?category=${encodeURIComponent(item.category)}${rawQuery ? `&q=${encodeURIComponent(rawQuery)}` : ""}`;
                const isActive = selectedCategory === item.category;

                return (
                  <Link
                    key={item.category}
                    href={href}
                    scroll={false}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-700/20"
                        : "border border-emerald-100 bg-emerald-50/70 text-emerald-800 hover:border-emerald-200 hover:bg-emerald-100"
                    }`}
                    style={isActive ? { color: "#ffffff" } : undefined}
                  >
                    {item.category} {item.count}
                  </Link>
                );
              })}
            </div>
          </section>

          <section
            id="inventory-products"
            className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-950">Список товаров</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Здесь хранятся все позиции, которые доступны для продажи.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-zinc-600">
                  {rawQuery ? "Поиск не нашёл товаров." : "Пока на складе нет ни одной позиции."}
                </p>
              ) : (
                filteredProducts.map((product) => {
                  const stockTone =
                    product.stockQuantity === 0
                      ? "text-red-600"
                      : product.stockQuantity <= 5
                        ? "text-amber-600"
                        : "text-emerald-600";

                  return (
                    <Link
                      key={product.id}
                      href={`/dashboard/inventory/${product.id}`}
                      className="block rounded-3xl border border-zinc-200 bg-zinc-50 p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-sm hover:shadow-zinc-950/5"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-zinc-950">{product.name}</h3>
                          {product.category ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                              {product.category}
                            </span>
                          ) : null}
                          {product.sku ? (
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400 ring-1 ring-zinc-200">
                              {product.sku}
                            </span>
                          ) : null}
                        </div>

                        <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                          <p>
                            Код товара: <span className="font-medium text-zinc-700">{product.sku ?? "Не присвоен"}</span>
                          </p>
                          <p>
                            Остаток:{" "}
                            <span className={`font-semibold ${stockTone}`}>
                              {formatInventoryQuantity(product.stockQuantity)} {product.unit}
                            </span>
                          </p>
                          <p>Средняя закупочная: {formatMoney(product.priceCents)}</p>
                          <p>Стоимость остатка: {formatMoney(product.stockQuantity * product.priceCents)}</p>
                          <p>Использований в заказах: {product.orderItemsCount}</p>
                        </div>

                        {product.description ? (
                          <p className="text-sm leading-6 text-zinc-600">{product.description}</p>
                        ) : null}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {canManageInventory ? (
          <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <ProductForm />
          </div>
        ) : null}
      </div>
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
        <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef0f6_100%)] p-6 shadow-sm shadow-zinc-950/5 xl:p-7">
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

            <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 xl:p-7">
              <h2 className="text-[1.55rem] font-semibold tracking-[-0.02em] text-zinc-950">Как работать с ревизией</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-sm font-medium text-zinc-900">1. Найди нужную группу товаров</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Отфильтруй список по категории или найди конкретный товар по названию и внутреннему коду.
                  </p>
                </div>
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-sm font-medium text-zinc-900">2. Внеси фактический остаток</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Вводи только те позиции, которые уже пересчитаны. Черновик сохраняется локально и не слетает при обновлении страницы.
                  </p>
                </div>
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-sm font-medium text-zinc-900">3. Сохрани итоговый лист</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    После создания лист зафиксирует выбранные товары, ответственного и остатки системы на текущий момент.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 xl:p-7">
              <h2 className="text-[1.55rem] font-semibold tracking-[-0.02em] text-zinc-950">Готовность команды</h2>
              <p className="mt-2 text-[15px] leading-7 text-zinc-600">
                Ответственный за инвентаризацию выбирается из текущего списка сотрудников.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Сотрудников доступно</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-950">{employees.length}</p>
                </div>
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4">
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
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] xl:items-start">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef3ff_100%)] p-6 shadow-sm shadow-zinc-950/5 xl:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Технологические карты
              </p>
              <h2 className="mt-3 max-w-[18rem] text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.02em] text-zinc-950">
                Состав и нормы расхода
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-7 text-zinc-600">
                Здесь будем связывать продаваемые позиции с ингредиентами и автоматически считать расход склада.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
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

            <section className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 xl:p-7">
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
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-700/20"
                          : "border border-emerald-100 bg-emerald-50/70 text-emerald-800 hover:border-emerald-200 hover:bg-emerald-100"
                      }`}
                      style={isActive ? { color: "#ffffff" } : undefined}
                    >
                      {item.category} {item.count}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 space-y-4">
                {filteredTechCards.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                    {techCards.length === 0
                      ? "Пока технологических карт ещё нет."
                      : "В этой категории технологических карт пока нет."}
                  </div>
                ) : (
                  filteredTechCards.map((card) => (
                    <article
                      key={card.id}
                      className="rounded-[28px] border border-zinc-200 bg-zinc-50/90 p-5"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-zinc-950">{card.name}</h3>
                            <p className="text-sm text-emerald-700">{card.category}</p>
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
              clearDraft={searchParams?.draft?.trim() === "cleared"}
            />
          ) : (
            <aside className="rounded-[32px] border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
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
