"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import { IncomingActDeleteButton } from "@/modules/inventory/components/incoming-act-delete-button";
import { IncomingActEditForm } from "@/modules/inventory/components/incoming-act-edit-form";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type {
  IncomingActSummary,
  InventoryResponsibleOption,
  ProductItem,
} from "@/modules/inventory/inventory.types";
import {
  formatDateTime,
  formatMoney,
} from "@/modules/inventory/components/inventory-panel-utils";

export function InventoryIncomingActCard({
  act,
  canComplete,
  canManageInventory,
  isCompletePending,
  completeFormAction,
  products,
  responsibleOptions,
}: {
  act: IncomingActSummary;
  canComplete: boolean;
  canManageInventory: boolean;
  isCompletePending: boolean;
  completeFormAction: (formData: FormData) => void;
  products: ProductItem[];
  responsibleOptions: InventoryResponsibleOption[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  if (!canComplete) {
    return (
      <>
        <article className="rounded-[18px] border border-red-950/10 bg-white/70 p-3 shadow-sm shadow-red-950/5">
          <div className="grid gap-3 md:grid-cols-[0.35fr_1fr_0.8fr_0.55fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Акт</p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">№{act.id}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Поставка</p>
              <p className="mt-1 truncate text-sm font-semibold text-zinc-950">
                {act.supplierName ?? "Поставщик не указан"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Завершён</p>
              <p className="mt-1 text-sm font-medium text-zinc-700">
                {formatDateTime(act.completedAt ?? act.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Сумма</p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">{formatMoney(act.totalCents)}</p>
            </div>
            <button type="button" onClick={() => setIsViewOpen(true)} className="inline-flex h-9 items-center justify-center rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900">
              Просмотр
            </button>
          </div>
        </article>
        {isViewOpen && typeof document !== "undefined"
          ? createPortal(
              <IncomingActViewDialog act={act} onClose={() => setIsViewOpen(false)} />,
              document.body,
            )
          : null}
      </>
    );
  }

  return (
    <>
    <article className="rounded-[20px] border border-red-950/10 bg-white/70 p-4 shadow-sm shadow-red-950/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="receipt" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Акт #{act.id}</p>
            <h3 className="mt-1 text-base font-semibold text-zinc-950">
              {act.supplierName ? `Поставка от ${act.supplierName}` : "Поступление на склад"}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {act.responsibleEmployeeName} • {canComplete ? formatDateTime(act.createdAt) : `Завершён ${act.completedAt ? formatDateTime(act.completedAt) : formatDateTime(act.createdAt)}`}
            </p>
            {act.notes ? <p className="mt-2 text-xs leading-5 text-zinc-500">{act.notes}</p> : null}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <IncomingActStat label="Строк" value={act.itemsCount} />
          <IncomingActStat label="Сумма" value={formatMoney(act.totalCents)} />
        </div>
      </div>

      <div className="mt-4">
        <IncomingActItemsTable act={act} canComplete={canComplete} />
      </div>

      {canManageInventory ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2 rounded-[18px] border border-red-950/10 bg-white/55 p-2">
          {canComplete ? (
            <button type="button" onClick={() => setIsEditOpen(true)} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Редактировать
            </button>
          ) : null}
          <IncomingActDeleteButton actId={act.id} isCompleted={!canComplete} />
          {canComplete ? (
            <form action={completeFormAction}>
              <input type="hidden" name="actId" value={act.id} />
              <button type="submit" disabled={isCompletePending} className="inline-flex h-9 items-center rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:shadow-none">
                {isCompletePending ? "Проводим..." : "Завершить акт"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
    {isEditOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-80 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
            <button type="button" onClick={() => setIsEditOpen(false)} className="fixed inset-0 cursor-default" aria-label="Закрыть редактирование акта" />
            <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
              <div className="relative space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
                      <ModuleIcon name="receipt" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Редактирование акта</p>
                      <h2 className="mt-1 text-lg font-semibold text-zinc-950">Акт поступления #{act.id}</h2>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsEditOpen(false)} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
                    Закрыть
                  </button>
                </div>
                <IncomingActEditForm act={act} products={products} responsibleOptions={responsibleOptions} onClose={() => setIsEditOpen(false)} variant="dialog" />
              </div>
            </section>
          </div>,
          document.body,
        )
      : null}
    </>
  );
}

function IncomingActViewDialog({
  act,
  onClose,
}: {
  act: IncomingActSummary;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-80 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть просмотр акта" />
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
                <ModuleIcon name="receipt" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Просмотр акта</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">Акт поступления #{act.id}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {act.supplierName ?? "Поставщик не указан"} • Завершён {formatDateTime(act.completedAt ?? act.createdAt)}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Закрыть
            </button>
          </div>
          <article className="rounded-[20px] border border-red-950/10 bg-white/70 p-4 shadow-sm shadow-red-950/5">
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              <IncomingActStat label="Строк" value={act.itemsCount} />
              <IncomingActStat label="Сумма" value={formatMoney(act.totalCents)} />
            </div>
            <IncomingActItemsTable act={act} canComplete={false} />
          </article>
        </div>
      </section>
    </div>
  );
}

function IncomingActItemsTable({
  act,
  canComplete,
}: {
  act: IncomingActSummary;
  canComplete: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-red-950/10 bg-white/76">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-red-50/45">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">
              <th className="px-4 py-3 font-semibold">Товар</th>
              <th className="px-4 py-3 font-semibold">{canComplete ? "Сейчас" : "Было"}</th>
              <th className="px-4 py-3 font-semibold">Поступило</th>
              <th className="px-4 py-3 font-semibold">Цена</th>
              <th className="px-4 py-3 font-semibold">{canComplete ? "После" : "Стало"}</th>
            </tr>
          </thead>
          <tbody>
            {act.items.map((item) => (
              <tr key={item.id} className="border-t border-red-950/10">
                <td className="px-4 py-4">
                  <p className="font-semibold text-zinc-950">{item.productName}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{item.productCategory ?? "Без категории"} • {item.productUnit}</p>
                </td>
                <td className="px-4 py-4 font-medium text-zinc-950">
                  {formatInventoryQuantity(canComplete ? item.currentStockQuantity : (item.stockQuantityBefore ?? item.currentStockQuantity))} {item.productUnit}
                </td>
                <td className="px-4 py-4 font-medium text-red-800">
                  +{formatInventoryQuantity(item.quantity)} {item.productUnit}
                </td>
                <td className="px-4 py-4 font-medium text-zinc-950">{formatMoney(item.priceCents)}</td>
                <td className="px-4 py-4 font-medium text-zinc-950">
                  {formatInventoryQuantity(canComplete ? item.currentStockQuantity + item.quantity : (item.stockQuantityAfter ?? item.currentStockQuantity))} {item.productUnit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IncomingActStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[16px] border border-red-950/10 bg-white/80 px-4 py-3 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
