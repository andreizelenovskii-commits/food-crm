import Link from "next/link";
import { LowStockPanel } from "@/modules/inventory/components/low-stock-panel";
import { ProductForm } from "@/modules/inventory/components/product-form";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { ProductCategory, ProductItem } from "@/modules/inventory/inventory.types";

type CategorySummary = {
  category: ProductCategory;
  count: number;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function InventoryProductsTab({
  products,
  filteredProducts,
  lowStockProducts,
  categorySummaries,
  rawQuery,
  selectedCategory,
  totalStock,
  totalValueCents,
  canManageInventory,
}: {
  products: ProductItem[];
  filteredProducts: ProductItem[];
  lowStockProducts: ProductItem[];
  categorySummaries: CategorySummary[];
  rawQuery: string;
  selectedCategory: ProductCategory | "";
  totalStock: number;
  totalValueCents: number;
  canManageInventory: boolean;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 shadow-sm shadow-zinc-950/5 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">Поиск</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">По названию или SKU</h2>
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
            <button type="submit" className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
              Найти
            </button>
          </form>

          {rawQuery ? (
            <p className="mt-3 text-sm text-zinc-500">
              По запросу <span className="font-medium text-zinc-900">{rawQuery}</span> найдено: {filteredProducts.length}
            </p>
          ) : null}
          {selectedCategory ? (
            <p className="mt-2 text-sm text-zinc-500">
              Активная категория: <span className="font-medium text-zinc-900">{selectedCategory}</span>
            </p>
          ) : null}
        </section>

        <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff4f2_100%)] p-4 shadow-sm shadow-zinc-950/5 sm:p-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">Склад под контролем</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">Остатки и стоимость</h2>
          </div>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:flex-nowrap">
            <InventoryMetric label="Позиций" value={products.length} />
            <InventoryMetric label="Всего единиц" value={formatInventoryQuantity(totalStock)} />
            <InventoryMetric label="Стоимость остатка по закупке" value={formatMoney(totalValueCents)} />
          </div>
        </section>

        <LowStockPanel products={lowStockProducts} />

        <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 shadow-sm shadow-zinc-950/5 sm:p-5">
          <h2 className="text-xl font-semibold text-zinc-950">Категории товаров</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Выбирай категорию, чтобы видеть только нужные складские позиции.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={rawQuery ? `/dashboard/inventory?q=${encodeURIComponent(rawQuery)}` : "/dashboard/inventory"}
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
        </section>

        <section id="inventory-products" className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 shadow-sm shadow-zinc-950/5 sm:p-5">
          <h2 className="text-xl font-semibold text-zinc-950">Список товаров</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Здесь хранятся все позиции, которые доступны для продажи.</p>

          <div className="mt-4 space-y-4">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-zinc-600">{rawQuery ? "Поиск не нашёл товаров." : "Пока на складе нет ни одной позиции."}</p>
            ) : (
              filteredProducts.map((product) => <InventoryProductCard key={product.id} product={product} />)
            )}
          </div>
        </section>
      </div>

      {canManageInventory ? (
        <div className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <ProductForm />
        </div>
      ) : null}
    </div>
  );
}

function InventoryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-h-[8rem] flex-col rounded-2xl border border-white/80 bg-white/80 p-4 lg:w-[12rem] lg:flex-none">
      <p className="min-h-[2.75rem] text-sm font-medium leading-6 text-zinc-500">{label}</p>
      <p className="mt-auto text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function InventoryProductCard({ product }: { product: ProductItem }) {
  const stockTone =
    product.stockQuantity === 0
      ? "text-red-700"
      : product.stockQuantity <= 5
        ? "text-amber-600"
        : "text-red-700";

  return (
    <Link
      href={`/dashboard/inventory/${product.id}`}
      className="block rounded-[14px] border border-zinc-200 bg-zinc-50 p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-sm hover:shadow-zinc-950/5"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-zinc-950">{product.name}</h3>
          {product.category ? (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-800 ring-1 ring-red-100">
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
          <p>Код товара: <span className="font-medium text-zinc-700">{product.sku ?? "Не присвоен"}</span></p>
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

        {product.description ? <p className="text-sm leading-6 text-zinc-600">{product.description}</p> : null}
      </div>
    </Link>
  );
}
