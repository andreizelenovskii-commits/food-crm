"use client";

import { useMemo, useState } from "react";
import { ModuleIcon } from "@/components/ui/module-icon";
import { ProductDetailDialog } from "@/modules/inventory/components/product-detail-dialog";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  type ProductItem,
} from "@/modules/inventory/inventory.types";

const PRODUCTS_PER_PAGE = 10;

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function InventoryProductsDialog({
  products,
  canManageInventory,
  onClose,
}: {
  products: ProductItem[];
  canManageInventory: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all" | "none">("all");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const hasUncategorized = products.some((product) => !product.category);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesName = normalizedQuery
        ? product.name.toLowerCase().includes(normalizedQuery)
        : true;
      const matchesCategory =
        category === "all" ||
        (category === "none" ? !product.category : product.category === category);

      return matchesName && matchesCategory;
    });
  }, [category, normalizedQuery, products]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE,
  );

  const handleCategoryChange = (value: ProductCategory | "all" | "none") => {
    setCategory(value);
    setPage(1);
  };

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть список товаров" />

      <section className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />

        <div className="relative space-y-3">
          <div className="rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
                  <ModuleIcon name="box" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Все товары</p>
                  <h2 className="mt-1 text-lg font-semibold text-zinc-950">Остатки на складе</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Поиск по названию, фильтр по категории и 10 позиций на странице.
                  </p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-red-950/20">
                Закрыть
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 lg:flex-row">
              <label className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-red-800/55">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Например: Маргарита"
                  className="h-9 w-full appearance-none rounded-full border border-red-950/10 bg-white/85 pl-10 pr-4 text-[13px] font-medium leading-none text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-red-200 hover:bg-white hover:placeholder:text-zinc-500 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-800/10"
                />
              </label>
              <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-red-50 px-4 text-xs font-semibold text-red-800 ring-1 ring-red-100">
                Найдено: {filteredProducts.length}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <CategoryButton active={category === "all"} onClick={() => handleCategoryChange("all")}>Все категории</CategoryButton>
              {PRODUCT_CATEGORIES.map((item) => (
                <CategoryButton key={item} active={category === item} onClick={() => handleCategoryChange(item)}>{item}</CategoryButton>
              ))}
              {hasUncategorized ? (
                <CategoryButton active={category === "none"} onClick={() => handleCategoryChange("none")}>Без категории</CategoryButton>
              ) : null}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/70 bg-white/74 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
            <div className="hidden grid-cols-[minmax(0,1.3fr)_0.7fr_0.8fr_0.8fr] gap-3 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55 md:grid">
              <span>Товар</span>
              <span>Количество</span>
              <span>Средняя закупочная</span>
              <span className="text-right">Сумма товара</span>
            </div>

            <div className="space-y-2">
              {pageProducts.length > 0 ? (
                pageProducts.map((product) => {
                  const totalCents = product.stockQuantity * product.priceCents;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="group block w-full rounded-[18px] border border-red-950/10 bg-white/78 px-3 py-3 text-left shadow-sm shadow-red-950/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_0.7fr_0.8fr_0.8fr] md:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-950">{product.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">{product.category ?? "Без категории"}</p>
                        </div>
                        <p className="text-sm font-semibold text-zinc-950">{formatInventoryQuantity(product.stockQuantity)} {product.unit}</p>
                        <p className="text-sm font-semibold text-zinc-950">{formatMoney(product.priceCents)}</p>
                        <div className="flex items-center justify-between gap-2 md:justify-end">
                          <p className="text-sm font-semibold text-red-800">{formatMoney(totalCents)}</p>
                          <span className="hidden h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-800 ring-1 ring-red-100 transition group-hover:bg-red-800 group-hover:text-white group-hover:ring-red-800 md:inline-flex">
                            <ArrowIcon className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="rounded-[18px] border border-red-950/10 bg-white/55 px-4 py-4 text-sm text-zinc-500">
                  Товары по этому поиску не найдены.
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-950/10 bg-white/70 px-2 py-1 shadow-sm shadow-red-950/5">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={safePage <= 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-800 transition hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
                  aria-label="Предыдущая страница"
                >
                  ←
                </button>
                <span className="px-2 text-xs font-medium text-zinc-500">
                  Страница {safePage} из {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={safePage >= totalPages}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-800 transition hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
                  aria-label="Следующая страница"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedProduct ? (
        <ProductDetailDialog
          product={selectedProduct}
          canManageInventory={canManageInventory}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </div>
  );
}

function CategoryButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-9 items-center rounded-full border px-3.5 text-xs font-semibold shadow-sm shadow-red-950/5 transition",
        active
          ? "border-red-800 bg-red-800 text-white"
          : "border-red-100 bg-white/85 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
