"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import { InventoryProductsDialog } from "@/modules/inventory/components/inventory-products-dialog";
import type { ProductItem } from "@/modules/inventory/inventory.types";

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function InventoryProductsDialogButton({
  products,
  canManageInventory,
}: {
  products: ProductItem[];
  canManageInventory: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="group rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white/82">
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
              <ModuleIcon name="box" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                Складские позиции
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">Все товары</h2>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Открой список товаров с поиском, категориями и постраничным просмотром.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-800 px-5 text-[13px] font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 hover:shadow-red-950/25"
          >
            Все товары · {products.length}
            <ArrowIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <InventoryProductsDialog
              products={products}
              canManageInventory={canManageInventory}
              onClose={() => setIsOpen(false)}
            />,
            document.body,
          )
        : null}
    </>
  );
}
