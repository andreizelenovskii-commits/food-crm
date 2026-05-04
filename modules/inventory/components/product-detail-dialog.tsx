"use client";

import { ModuleIcon } from "@/components/ui/module-icon";
import { ProductDeleteButton } from "@/modules/inventory/components/product-delete-button";
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

function ProductMetric({
  label,
  value,
  tone = "text-zinc-950",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-3.5 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">
        {label}
      </p>
      <p className={`mt-2 text-lg font-semibold leading-none ${tone}`}>{value}</p>
    </div>
  );
}

export function ProductDetailDialog({
  product,
  canManageInventory,
  onClose,
}: {
  product: ProductItem;
  canManageInventory: boolean;
  onClose: () => void;
}) {
  const stockTone =
    product.stockQuantity === 0
      ? "text-red-700"
      : product.stockQuantity <= 5
        ? "text-amber-600"
        : "text-red-800";

  return (
    <div className="fixed inset-0 z-80 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
        aria-label="Закрыть карточку товара"
      />

      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />

        <div className="relative grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <article className="rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
                    <ModuleIcon name="box" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                      Карточка товара
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold leading-tight text-zinc-950">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Все параметры позиции, текущий остаток и средняя закупочная цена.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-red-950/20"
                >
                  Закрыть
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ProductMetric label="Код товара" value={product.sku ?? "Не присвоен"} />
                <ProductMetric
                  label="Остаток"
                  value={`${formatInventoryQuantity(product.stockQuantity)} ${product.unit}`}
                  tone={stockTone}
                />
                <ProductMetric label="Средняя закупочная" value={formatMoney(product.priceCents)} />
                <ProductMetric
                  label="Сумма остатка"
                  value={formatMoney(product.stockQuantity * product.priceCents)}
                />
              </div>
            </article>

            <article className="rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                Подробности
              </p>
              <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                <p>Категория: <span className="font-medium text-zinc-900">{product.category ?? "Не указана"}</span></p>
                <p>Ед. измерения: <span className="font-medium text-zinc-900">{product.unit}</span></p>
                <p>Использований: <span className="font-medium text-zinc-900">{product.orderItemsCount}</span></p>
              </div>
              <div className="mt-4 rounded-[18px] border border-red-950/10 bg-white/65 p-3.5">
                <p className="text-xs font-semibold text-zinc-700">Описание</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {product.description || "Описание для этого товара пока не заполнено."}
                </p>
              </div>
            </article>

            {canManageInventory ? (
              <div className="flex justify-end">
                <ProductDeleteButton
                  productId={product.id}
                  productName={product.name}
                  disabled={product.orderItemsCount > 0}
                  redirectTo="/dashboard/inventory"
                />
              </div>
            ) : null}
          </div>

          {canManageInventory ? <ProductForm initialProduct={product} /> : null}
        </div>
      </section>
    </div>
  );
}
