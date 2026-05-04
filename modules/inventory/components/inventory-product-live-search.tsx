"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ProductDetailDialog } from "@/modules/inventory/components/product-detail-dialog";
import { ProductForm } from "@/modules/inventory/components/product-form";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { ProductItem } from "@/modules/inventory/inventory.types";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      className={className}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ProductResultCard({
  product,
  onOpen,
}: {
  product: ProductItem;
  onOpen: (product: ProductItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="block w-full rounded-[18px] border border-red-950/10 bg-white/78 p-3.5 text-left shadow-sm shadow-red-950/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-950">{product.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {product.category ? (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-800 ring-1 ring-red-100">
                {product.category}
              </span>
            ) : null}
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 ring-1 ring-red-950/10">
              {product.sku ?? "Без SKU"}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <p className="font-semibold text-red-800">
            {formatInventoryQuantity(product.stockQuantity)} {product.unit}
          </p>
          <p className="mt-1">{formatMoney(product.priceCents)}</p>
        </div>
      </div>
    </button>
  );
}

function ProductCreateDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
        aria-label="Закрыть добавление товара"
      />

      <section className="relative mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />

        <div className="relative space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                Добавление
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">Новый товар</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            >
              Закрыть
            </button>
          </div>

          <ProductForm />
        </div>
      </section>
    </div>
  );
}

export function InventoryProductLiveSearch({
  initialQuery,
  products,
  canManageInventory,
}: {
  initialQuery: string;
  products: ProductItem[];
  canManageInventory: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const trimmedQuery = query.trim();
  const results = useMemo(() => {
    const normalizedQuery = trimmedQuery.toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return products
      .filter((product) => product.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 7);
  }, [products, trimmedQuery]);

  return (
    <>
      <div className="mt-4 flex flex-col gap-2 lg:flex-row">
        <form action="/dashboard/inventory" className="flex min-w-0 flex-1 gap-2">
          <input
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: Маргарита"
            className="h-9 min-w-0 flex-1 appearance-none rounded-full border border-red-950/10 bg-white/85 px-4 text-[13px] font-medium leading-none text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-red-200 hover:bg-white hover:text-zinc-950 hover:placeholder:text-zinc-500 focus:border-red-300 focus:bg-white focus:text-zinc-950 focus:ring-2 focus:ring-red-800/10 focus:placeholder:text-zinc-500"
          />
          <button
            type="submit"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-red-800 px-4 text-[13px] font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 hover:shadow-red-950/25"
          >
            <SearchIcon className="h-3.5 w-3.5" />
            Найти
          </button>
        </form>

        {canManageInventory ? (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-red-100 bg-white/85 px-5 text-[13px] font-medium tracking-[-0.01em] text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-red-950/20"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Добавить товар
          </button>
        ) : null}
      </div>

      {trimmedQuery ? (
        <div className="mt-3 rounded-[18px] border border-red-950/10 bg-white/55 p-2">
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
              Найденные товары
            </p>
            <span className="text-xs font-semibold text-red-800">{results.length}</span>
          </div>
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((product) => (
                <ProductResultCard
                  key={product.id}
                  product={product}
                  onOpen={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <p className="px-2 py-1 text-xs leading-5 text-zinc-500">
              Товар не найден. Поиск работает только по названию товара.
            </p>
          )}
        </div>
      ) : null}

      {isCreateOpen && typeof document !== "undefined"
        ? createPortal(<ProductCreateDialog onClose={() => setIsCreateOpen(false)} />, document.body)
        : null}

      {selectedProduct && typeof document !== "undefined"
        ? createPortal(
            <ProductDetailDialog
              product={selectedProduct}
              canManageInventory={canManageInventory}
              onClose={() => setSelectedProduct(null)}
            />,
            document.body,
          )
        : null}
    </>
  );
}
