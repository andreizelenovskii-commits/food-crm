"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { ProductItem } from "@/modules/inventory/inventory.types";

export function InventoryAuditSelectedProductsDialog({
  products,
  onRemoveProduct,
  onClearProducts,
}: {
  products: ProductItem[];
  onRemoveProduct: (productId: number) => void;
  onClearProducts: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {products.map((product) => (
        <input key={product.id} type="hidden" name="productId" value={product.id} />
      ))}
      <button
        type="button"
        disabled={products.length === 0}
        onClick={() => setIsOpen(true)}
        className="h-9 w-full rounded-full border border-red-100 bg-white/90 px-4 text-[13px] font-medium tracking-[-0.01em] text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:bg-red-50 disabled:text-red-300 disabled:shadow-none"
      >
        Показать выбранные товары
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <SelectedProductsDialog
              products={products}
              onClose={() => setIsOpen(false)}
              onRemoveProduct={onRemoveProduct}
              onClearProducts={onClearProducts}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function SelectedProductsDialog({
  products,
  onClose,
  onRemoveProduct,
  onClearProducts,
}: {
  products: ProductItem[];
  onClose: () => void;
  onRemoveProduct: (productId: number) => void;
  onClearProducts: () => void;
}) {
  function clearProducts() {
    onClearProducts();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-90 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть выбранные товары" />
      <section className="relative mx-auto max-w-3xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Выбранные товары</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Товары в инвентаризации</h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500">Всего выбрано: {products.length}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Закрыть
          </button>
        </div>

        <div className="mt-3 max-h-[52vh] space-y-2 overflow-y-auto rounded-[20px] border border-red-950/10 bg-white/62 p-2">
          {products.map((product) => (
            <SelectedProductRow key={product.id} product={product} onRemove={() => onRemoveProduct(product.id)} />
          ))}
        </div>

        <div className="mt-3 flex justify-end">
          <button type="button" onClick={clearProducts} className="h-9 rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900">
            Удалить все товары
          </button>
        </div>
      </section>
    </div>
  );
}

function SelectedProductRow({ product, onRemove }: { product: ProductItem; onRemove: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-red-950/10 bg-white/84 px-3 py-2.5">
      <div>
        <p className="text-sm font-semibold text-zinc-950">{product.name}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{product.category ?? "Без категории"}{product.sku ? ` • ${product.sku}` : ""}</p>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold text-zinc-600">
          {formatInventoryQuantity(product.stockQuantity)} {product.unit}
        </p>
        <button type="button" onClick={onRemove} className="h-8 rounded-full border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
          Удалить
        </button>
      </div>
    </div>
  );
}
