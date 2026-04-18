import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { ProductDeleteButton } from "@/modules/inventory/components/product-delete-button";
import { ProductForm } from "@/modules/inventory/components/product-form";
import { fetchProducts } from "@/modules/inventory/inventory.service";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function InventoryPage(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const user = await requirePermission("view_inventory");
  const searchParams = await props.searchParams;
  const products = await fetchProducts();
  const rawQuery = searchParams?.q?.trim() ?? "";
  const normalizedQuery = rawQuery.toLowerCase();
  const totalStock = products.reduce((sum, product) => sum + product.stockQuantity, 0);
  const totalValueCents = products.reduce(
    (sum, product) => sum + product.stockQuantity * product.priceCents,
    0,
  );
  const filteredProducts = products.filter((product) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.sku?.toLowerCase().includes(normalizedQuery)
    );
  });
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
                  href="/dashboard/inventory"
                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-950"
                >
                  Сбросить
                </Link>
              ) : null}
            </div>

            <form action="/dashboard/inventory" className="mt-5 flex flex-col gap-3 sm:flex-row">
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

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-zinc-700">Позиции с низким остатком</p>
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
                  {lowStockCount}
                </span>
              </div>

              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-zinc-600">
                  Товары с низким остатком сейчас не найдены.
                </p>
              ) : (
                lowStockProducts.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-950">{product.name}</p>
                        <p className="text-sm text-zinc-500">
                          Остаток: {product.stockQuantity} {product.unit}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                        Нужен контроль
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
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
                    <article
                      key={product.id}
                      className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-zinc-950">{product.name}</h3>
                            {product.sku ? (
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
                                SKU: {product.sku}
                              </span>
                            ) : null}
                          </div>

                          <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
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

                        {hasPermission(user, "manage_inventory") ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <Link
                              href={`/dashboard/inventory/${product.id}/edit`}
                              className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
                            >
                              Редактировать
                            </Link>
                            <ProductDeleteButton
                              productId={product.id}
                              productName={product.name}
                              disabled={product.orderItemsCount > 0}
                            />
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {hasPermission(user, "manage_inventory") ? (
          <div className="space-y-6">
            <ProductForm />
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
