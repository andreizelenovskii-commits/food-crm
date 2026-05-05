"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ModuleIcon } from "@/components/ui/module-icon";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { WriteoffActSummary } from "@/modules/inventory/inventory.types";
import {
  formatDateTime,
  formatMoney,
} from "@/modules/inventory/components/inventory-panel-utils";

type FormAction = (formData: FormData) => void;

export function InventoryWriteoffActCard({
  act,
  canComplete,
  canManageInventory,
  isCompletePending,
  completeFormAction,
  onDelete,
}: {
  act: WriteoffActSummary;
  canComplete: boolean;
  canManageInventory: boolean;
  isCompletePending: boolean;
  completeFormAction: FormAction;
  onDelete: (act: WriteoffActSummary) => void;
}) {
  if (!canComplete) {
    return <WriteoffActHistoryRow act={act} />;
  }

  return (
    <article className="rounded-[20px] border border-red-950/10 bg-white/70 p-4 shadow-sm shadow-red-950/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="receipt" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Акт #{act.id}</p>
            <h3 className="mt-1 text-base font-semibold text-zinc-950">{act.reason}</h3>
            <p className="mt-1 text-xs text-zinc-500">{formatWriteoffActMeta(act, canComplete)}</p>
            {act.notes ? <p className="mt-2 text-xs leading-5 text-zinc-500">{act.notes}</p> : null}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <WriteoffActStat label="Строк" value={act.itemsCount} />
          <WriteoffActStat label="Сумма" value={formatMoney(act.totalCents)} />
        </div>
      </div>

      <WriteoffActItemsTable act={act} canComplete={canComplete} />

      {canManageInventory ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2 rounded-[18px] border border-red-950/10 bg-white/55 p-2">
          <button
            type="button"
            onClick={() => onDelete(act)}
            className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Удалить
          </button>
          {canComplete ? (
            <form action={completeFormAction}>
              <input type="hidden" name="actId" value={act.id} />
              <button
                type="submit"
                disabled={isCompletePending}
                className="inline-flex h-9 items-center rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:shadow-none"
              >
                {isCompletePending ? "Проводим..." : "Завершить акт"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function WriteoffActHistoryRow({ act }: { act: WriteoffActSummary }) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const completedAt = act.completedAt ? formatDateTime(act.completedAt) : formatDateTime(act.createdAt);

  return (
    <article className="rounded-[20px] border border-red-950/10 bg-white/72 p-3 shadow-sm shadow-red-950/5">
      <div className="grid items-center gap-3 xl:grid-cols-[0.8fr_1.4fr_1fr_1fr_1.2fr_1.4fr_auto]">
        <WriteoffHistoryCell label="Акт" value={`#${act.id}`} strong />
        <WriteoffHistoryCell label="Ответственный" value={act.responsibleEmployeeName} />
        <WriteoffHistoryCell label="Кол-во" value={formatInventoryQuantity(act.totalQuantity)} />
        <WriteoffHistoryCell label="Сумма" value={formatMoney(act.totalCents)} />
        <WriteoffHistoryCell label="Дата" value={completedAt} />
        <WriteoffHistoryCell label="Причина" value={act.reason} />
        <button
          type="button"
          onClick={() => setIsViewOpen(true)}
          className="inline-flex h-9 items-center justify-center rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900"
        >
          Просмотр
        </button>
      </div>

      {isViewOpen && typeof document !== "undefined"
        ? createPortal(<WriteoffActViewDialog act={act} onClose={() => setIsViewOpen(false)} />, document.body)
        : null}
    </article>
  );
}

function WriteoffHistoryCell({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string | number;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-[16px] border border-red-950/10 bg-white/68 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-800/50">{label}</p>
      <p className={["mt-0.5 truncate text-xs text-zinc-950", strong ? "font-semibold" : "font-medium"].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function WriteoffActViewDialog({ act, onClose }: { act: WriteoffActSummary; onClose: () => void }) {
  const completedAt = act.completedAt ? formatDateTime(act.completedAt) : formatDateTime(act.createdAt);

  return (
    <div className="fixed inset-0 z-80 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть просмотр" />
      <section className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
                <ModuleIcon name="receipt" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Просмотр акта</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">Акт списания #{act.id}</h2>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {act.responsibleEmployeeName} • {act.reason} • {completedAt}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Закрыть
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <WriteoffActStat label="Кол-во списания" value={formatInventoryQuantity(act.totalQuantity)} />
            <WriteoffActStat label="Сумма" value={formatMoney(act.totalCents)} />
            <WriteoffActStat label="Позиций" value={act.itemsCount} />
          </div>

          <WriteoffActItemsTable act={act} canComplete={false} />
        </div>
      </section>
    </div>
  );
}

function WriteoffActItemsTable({
  act,
  canComplete,
}: {
  act: WriteoffActSummary;
  canComplete: boolean;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-[18px] border border-red-950/10 bg-white/76">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-red-50/45">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">
              <th className="px-4 py-3 font-semibold">Товар</th>
              <th className="px-4 py-3 font-semibold">{canComplete ? "В наличии сейчас" : "Было"}</th>
              <th className="px-4 py-3 font-semibold">Списать</th>
              <th className="px-4 py-3 font-semibold">{canComplete ? "После завершения" : "Стало"}</th>
            </tr>
          </thead>
          <tbody>
            {act.items.map((item) => (
              <tr key={item.id} className="border-t border-red-950/10">
                <td className="px-4 py-4">
                  <p className="font-semibold text-zinc-950">{item.productName}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {item.productCategory ?? "Без категории"} • Списание в {item.productUnit}
                  </p>
                </td>
                <td className="px-4 py-4 font-medium text-zinc-950">
                  {formatInventoryQuantity(
                    canComplete ? item.currentStockQuantity : (item.stockQuantityBefore ?? item.currentStockQuantity),
                  )}{" "}
                  {item.productUnit}
                </td>
                <td className="px-4 py-4 font-medium text-red-700">
                  -{formatInventoryQuantity(item.quantity)} {item.productUnit}
                </td>
                <td className="px-4 py-4 font-medium text-zinc-950">
                  {formatInventoryQuantity(
                    canComplete ? item.currentStockQuantity - item.quantity : (item.stockQuantityAfter ?? item.currentStockQuantity),
                  )}{" "}
                  {item.productUnit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatWriteoffActMeta(act: WriteoffActSummary, canComplete: boolean) {
  if (canComplete) {
    return `${act.responsibleEmployeeName} • ${act.responsibleEmployeeRole} • ${formatDateTime(act.createdAt)}`;
  }

  const completedAt = act.completedAt ? formatDateTime(act.completedAt) : formatDateTime(act.createdAt);
  return `${act.responsibleEmployeeName} • Завершён ${completedAt}`;
}

function WriteoffActStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[16px] border border-red-950/10 bg-white/80 px-4 py-3 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
