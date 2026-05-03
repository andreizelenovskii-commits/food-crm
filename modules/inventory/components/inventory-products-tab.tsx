import Link from "next/link";
import { PaginatedList } from "@/components/ui/paginated-list";
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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="space-y-4">
        <section className="rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Поиск</p>
              <h2 className="mt-1 text-base font-semibold text-zinc-950">По названию или SKU</h2>
            </div>

            {rawQuery ? (
              <Link
                href={
                  selectedCategory
                    ? `/dashboard/inventory?category=${encodeURIComponent(selectedCategory)}`
                    : "/dashboard/inventory"
                }
                scroll={false}
                className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
              >
                Сбросить
              </Link>
            ) : null}
          </div>

          <form action="/dashboard/inventory" className="mt-4 flex flex-col gap-2 sm:flex-row">
            {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
            <input
              name="q"
              type="search"
              defaultValue={rawQuery}
              placeholder="Например: Маргарита или SKU-001"
              className="h-9 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
            />
            <button type="submit" className="inline-flex h-9 items-center justify-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-sm hover:shadow-red-950/20">
              Найти
            </button>
          </form>

          {rawQuery ? (
            <p className="mt-3 text-xs text-zinc-500">
              По запросу <span className="font-medium text-zinc-900">{rawQuery}</span> найдено: {filteredProducts.length}
            </p>
          ) : null}
          {selectedCategory ? (
            <p className="mt-2 text-xs text-zinc-500">
              Активная категория: <span className="font-medium text-zinc-900">{selectedCategory}</span>
            </p>
          ) : null}
        </section>

        <section className="rounded-[22px] border border-white/70 bg-white/70 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Склад под контролем</p>
            <h2 className="mt-1 text-base font-semibold text-zinc-950">Остатки и стоимость</h2>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <InventoryMetric label="Позиций" value={products.length} />
            <InventoryMetric label="Всего единиц" value={formatInventoryQuantity(totalStock)} />
            <InventoryMetric label="Стоимость остатка по закупке" value={formatMoney(totalValueCents)} />
          </div>
        </section>

        <LowStockPanel products={lowStockProducts} />

        <section className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Категории
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-950">Категории товаров</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-600">
            Выбирай категорию, чтобы видеть только нужные складские позиции.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={rawQuery ? `/dashboard/inventory?q=${encodeURIComponent(rawQuery)}` : "/dashboard/inventory"}
              scroll={false}
              className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition ${
                !selectedCategory
                  ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
                  : "border border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
              }`}
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
                  className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition ${
                    isActive
                      ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
                      : "border border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
                  }`}
                >
                  {item.category} {item.count}
                </Link>
              );
            })}
          </div>
        </section>

        <section id="inventory-products" className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Товары
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-950">Список товаров</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-600">Здесь хранятся все позиции, которые доступны для продажи.</p>

          <div className="mt-4 space-y-4">
            {filteredProducts.length === 0 ? (
              <p className="text-xs leading-5 text-zinc-600">{rawQuery ? "Поиск не нашёл товаров." : "Пока на складе нет ни одной позиции."}</p>
            ) : (
              <PaginatedList itemLabel="товаров">
                {filteredProducts.map((product) => <InventoryProductCard key={product.id} product={product} />)}
              </PaginatedList>
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
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">{label}</p>
      <p className="mt-3 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
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
      className="block rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-semibold text-zinc-950">{product.name}</h3>
          {product.category ? (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-800 ring-1 ring-red-100">
              {product.category}
            </span>
          ) : null}
          {product.sku ? (
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 ring-1 ring-red-950/10">
              {product.sku}
            </span>
          ) : null}
        </div>

        <div className="grid gap-x-4 gap-y-1.5 text-xs text-zinc-600 sm:grid-cols-2">
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

        {product.description ? <p className="text-xs leading-5 text-zinc-600">{product.description}</p> : null}
      </div>
    </Link>
  );
}
