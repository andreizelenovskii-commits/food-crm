import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { LowStockPanel } from "@/modules/inventory/components/low-stock-panel";
import { ProductForm } from "@/modules/inventory/components/product-form";
import { PRODUCT_CATEGORIES } from "@/modules/inventory/inventory.types";
import { fetchProducts } from "@/modules/inventory/inventory.service";
import { TechCardForm } from "@/modules/tech-cards/components/tech-card-form";
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
  searchParams?: Promise<{ q?: string; tab?: string; category?: string }>;
}) {
  const user = await requirePermission("view_inventory");
  const searchParams = await props.searchParams;
  const [products, techCards, techCardProducts] = await Promise.all([
    fetchProducts(),
    fetchTechCards(),
    fetchTechCardProductOptions(),
  ]);
  const rawQuery = searchParams?.q?.trim() ?? "";
  const normalizedQuery = rawQuery.toLowerCase();
  const selectedCategory = searchParams?.category?.trim() ?? "";
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

  return (
    <PageShell
      title="Склад"
      description="Здесь хранится всё, что вы продаёте: товары, остатки и базовая стоимость."
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
                <p className="mt-3 text-3xl font-semibold text-zinc-950">{totalStock}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-sm font-medium text-zinc-500">Стоимость остатка</p>
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
                            Остаток: <span className={`font-semibold ${stockTone}`}>{product.stockQuantity} {product.unit}</span>
                          </p>
                          <p>Цена: {formatMoney(product.priceCents)}</p>
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

        {hasPermission(user, "manage_inventory") ? (
          <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <ProductForm />
          </div>
        ) : null}
      </div>
      ) : null}

      {activeTab === "incoming" ? (
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef6ea_100%)] p-6 shadow-sm shadow-zinc-950/5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                Поступление товара
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                Приход на склад
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Здесь будем фиксировать новые поставки и увеличение остатков по товарам.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Поставщиков</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Приходов сегодня</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Новые единицы</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
              <h2 className="text-xl font-semibold text-zinc-950">Журнал поступлений</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Когда добавим бизнес-логику, здесь появится история всех приходов на склад.
              </p>
              <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                Пока поступлений ещё нет.
              </div>
            </section>
          </div>

          <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-950">Новая поставка</h2>
              <p className="text-sm leading-6 text-zinc-600">
                Здесь будет форма прихода: товар, количество, закупочная цена, поставщик и комментарий.
              </p>
            </div>
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm leading-6 text-zinc-500">
              Каркас вкладки готов. Следующим шагом можно подключить реальные операции поступления товара.
            </div>
          </aside>
        </div>
      ) : null}

      {activeTab === "writeoff" ? (
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f7ece7_100%)] p-6 shadow-sm shadow-zinc-950/5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                Списание товара
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                Потери и расход
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Здесь будем фиксировать брак, порчу, внутренний расход и другие причины списания.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Списаний сегодня</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Товаров в риске</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">{lowStockCount}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Сумма списаний</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">0 ₽</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
              <h2 className="text-xl font-semibold text-zinc-950">Журнал списаний</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Здесь появится история всех операций списания с причинами и ответственными.
              </p>
              <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                Пока списаний ещё нет.
              </div>
            </section>
          </div>

          <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-950">Новое списание</h2>
              <p className="text-sm leading-6 text-zinc-600">
                Здесь будет форма списания: товар, количество, причина, комментарий и кто списал.
              </p>
            </div>
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm leading-6 text-zinc-500">
              Каркас вкладки готов. Следующим шагом можно подключить реальные операции списания.
            </div>
          </aside>
        </div>
      ) : null}

      {activeTab === "audit" ? (
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eef0f6_100%)] p-6 shadow-sm shadow-zinc-950/5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                Инвентаризация
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                Сверка фактических остатков
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Здесь будем сверять реальные остатки на складе с данными системы и фиксировать расхождения.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Позиций на сверку</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">{products.length}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Расхождений</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Последняя сверка</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">-</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
              <h2 className="text-xl font-semibold text-zinc-950">Журнал инвентаризаций</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                После подключения логики здесь появятся все проведённые сверки и найденные расхождения.
              </p>
              <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                Пока инвентаризаций ещё не проводилось.
              </div>
            </section>
          </div>

          <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-950">Новая инвентаризация</h2>
              <p className="text-sm leading-6 text-zinc-600">
                Здесь будет форма сверки: дата, ответственный, список товаров, фактический остаток и комментарий.
              </p>
            </div>
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm leading-6 text-zinc-500">
              Каркас вкладки готов. Следующим шагом можно сделать реальную инвентаризацию с фиксацией расхождений.
            </div>
          </aside>
        </div>
      ) : null}

      {activeTab === "recipes" ? (
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#eceff8_100%)] p-6 shadow-sm shadow-zinc-950/5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                Технологические карты
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                Состав и нормы расхода
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Здесь будем связывать продаваемые позиции с ингредиентами и автоматически считать расход склада.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Карт</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">{techCards.length}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Ингредиентов</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">{products.length}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-sm font-medium text-zinc-500">Автосписание</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-950">В планах</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
              <h2 className="text-xl font-semibold text-zinc-950">Список технологических карт</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Здесь хранятся реальные технологические карты, которые можно будет связывать с каталогом сайта.
              </p>
              <div className="mt-6 space-y-4">
                {techCards.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                    Пока технологических карт ещё нет.
                  </div>
                ) : (
                  techCards.map((card) => (
                    <article
                      key={card.id}
                      className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-zinc-950">{card.name}</h3>
                            <p className="text-sm text-zinc-500">
                              Выход: {card.outputQuantity} {card.outputUnit}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                            Ингредиентов: {card.ingredients.length}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-zinc-600">
                          {card.ingredients.map((ingredient) => (
                            <p key={ingredient.id}>
                              {ingredient.productName}: {ingredient.quantity} {ingredient.productUnit}
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

          {hasPermission(user, "manage_inventory") ? (
            <TechCardForm products={techCardProducts} />
          ) : (
            <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
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
