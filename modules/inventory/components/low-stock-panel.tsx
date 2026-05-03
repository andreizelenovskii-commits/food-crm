"use client";

import Link from "next/link";
import { useState } from "react";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { ProductItem } from "@/modules/inventory/inventory.types";

export function LowStockPanel({ products }: { products: ProductItem[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleProducts = isExpanded ? products : products.slice(0, 3);

  return (
    <section className="rounded-[22px] border border-amber-100 bg-[linear-gradient(180deg,#fffdf7_0%,#fff5e6_100%)] p-4 shadow-[0_18px_60px_rgba(146,64,14,0.08)] backdrop-blur-2xl sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700/80">
            Низкий остаток
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-950">
            Позиции под контролем
          </h2>
          <p className="mt-2 text-xs leading-5 text-zinc-600">
            Здесь собраны товары, которые скоро могут закончиться.
          </p>
        </div>
        <span className="inline-flex h-8 items-center rounded-full bg-zinc-950 px-3 text-xs font-semibold text-white">
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
            className="block rounded-[18px] border border-white/80 bg-white/90 px-4 py-3 shadow-sm shadow-amber-950/5 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-950">{product.name}</p>
                  <p className="text-xs text-zinc-500">
                    Остаток: {formatInventoryQuantity(product.stockQuantity)} {product.unit}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Код: {product.sku ?? `PRD-${String(product.id).padStart(5, "0")}`}
                  </p>
                </div>
                <span className="inline-flex h-8 items-center rounded-full bg-amber-100 px-3 text-xs font-semibold text-amber-800">
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
          className="mt-5 inline-flex h-8 items-center rounded-full border border-amber-200 bg-white px-3 text-xs font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-50"
        >
          {isExpanded ? "Скрыть" : "Показать еще"}
        </button>
      ) : null}
    </section>
  );
}
