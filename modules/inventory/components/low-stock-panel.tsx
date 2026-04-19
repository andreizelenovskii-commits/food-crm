"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductItem } from "@/modules/inventory/inventory.types";

export function LowStockPanel({ products }: { products: ProductItem[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleProducts = isExpanded ? products : products.slice(0, 3);

  return (
    <section className="rounded-3xl border border-amber-200 bg-[linear-gradient(180deg,#fffaf2_0%,#fff3df_100%)] p-6 shadow-sm shadow-amber-950/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-700/80">
            Низкий остаток
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            Позиции под контролем
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Здесь собраны товары, которые скоро могут закончиться.
          </p>
        </div>
        <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
          {products.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Товары с низким остатком сейчас не найдены.
          </p>
        ) : (
          visibleProducts.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/inventory/${product.id}`}
              className="block rounded-2xl border border-white/80 bg-white/90 px-4 py-3 transition hover:border-amber-200 hover:bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-950">{product.name}</p>
                  <p className="text-sm text-zinc-500">
                    Остаток: {product.stockQuantity} {product.unit}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Код: {product.sku ?? `PRD-${String(product.id).padStart(5, "0")}`}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  Нужен контроль
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {products.length > 3 ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-5 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:border-amber-300 hover:bg-amber-50"
        >
          {isExpanded ? "Скрыть" : "Показать еще"}
        </button>
      ) : null}
    </section>
  );
}
