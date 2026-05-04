"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
import { ProductDetailDialog } from "@/modules/inventory/components/product-detail-dialog";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { ProductItem } from "@/modules/inventory/inventory.types";

export function LowStockPanel({
  products,
  canManageInventory,
}: {
  products: ProductItem[];
  canManageInventory: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const visibleProducts = isExpanded ? products : products.slice(0, 3);

  return (
    <GlassPanel id="low-stock" className="scroll-mt-24 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="report" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
              Низкий остаток
            </p>
            <h2 className="mt-1 text-base font-semibold text-zinc-950">
              Позиции под контролем
            </h2>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Здесь собраны товары, которые скоро могут закончиться.
            </p>
          </div>
        </div>
        <span className="inline-flex h-8 items-center rounded-full bg-red-800 px-3 text-xs font-semibold text-white shadow-sm shadow-red-950/15">
          {products.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {products.length === 0 ? (
          <p className="rounded-[18px] border border-red-950/10 bg-white/55 px-4 py-3 text-sm text-zinc-500">
            Товары с низким остатком сейчас не найдены.
          </p>
        ) : (
          visibleProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="group block w-full rounded-[18px] border border-red-950/10 bg-white/78 px-4 py-3 text-left shadow-sm shadow-red-950/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white"
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
                <span className="inline-flex h-8 items-center rounded-full bg-red-50 px-3 text-xs font-semibold text-red-800 ring-1 ring-red-100 transition group-hover:bg-red-800 group-hover:text-white group-hover:ring-red-800">
                  Нужен контроль
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {products.length > 3 ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-5 inline-flex h-9 items-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-red-950/20"
        >
          {isExpanded ? "Скрыть" : "Показать еще"}
        </button>
      ) : null}

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
    </GlassPanel>
  );
}
