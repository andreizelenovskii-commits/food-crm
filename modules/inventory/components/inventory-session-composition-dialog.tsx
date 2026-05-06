"use client";

import { useMemo, useState } from "react";
import type { InventoryFormAction } from "@/modules/inventory/components/inventory-audit-common";
import {
  formatMoney,
  parseQuantity,
} from "@/modules/inventory/components/inventory-panel-utils";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type {
  InventorySessionItemSummary,
  InventorySessionSummary,
} from "@/modules/inventory/inventory.types";

export function InventoryCompositionDialog({
  session,
  canManageInventory,
  isSavePending,
  saveFormAction,
  actualDrafts,
  onActualDraftChange,
  onClose,
}: {
  session: InventorySessionSummary;
  canManageInventory: boolean;
  isSavePending: boolean;
  saveFormAction?: InventoryFormAction;
  actualDrafts?: Record<number, string>;
  onActualDraftChange?: (itemId: number, value: string) => void;
  onClose: () => void;
}) {
  const canEditActuals = canManageInventory && Boolean(saveFormAction) && Boolean(onActualDraftChange);
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(session.items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(
    () => session.items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, session.items],
  );

  return (
    <div className="fixed inset-0 z-90 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button type="button" onClick={onClose} className="fixed inset-0 cursor-default" aria-label="Закрыть состав инвентаризации" />
      <section className="relative mx-auto max-w-5xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
              Состав инвентаризации #{session.id}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950">Товары в листе</h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {session.responsibleEmployeeName} • всего позиций: {session.items.length}
            </p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Закрыть
          </button>
        </div>
        <form action={canEditActuals ? saveFormAction : undefined} className="mt-3 space-y-3">
          <input type="hidden" name="sessionId" value={session.id} />
          <div className="max-h-[58vh] space-y-2 overflow-y-auto rounded-[20px] border border-red-950/10 bg-white/62 p-2">
            {pagedItems.map((item) => (
              <InventoryCompositionRow
                key={item.id}
                item={item}
                canEditActuals={canEditActuals}
                draftValue={actualDrafts?.[item.id] ?? ""}
                onActualDraftChange={onActualDraftChange}
              />
            ))}
          </div>
          <CompositionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          {canEditActuals ? (
            <div className="flex justify-end">
              <button type="submit" disabled={isSavePending} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                {isSavePending ? "Сохраняем..." : "Сохранить факт"}
              </button>
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}

function CompositionPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (update: (value: number) => number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-red-950/10 bg-white/80 px-3 py-2">
      <button
        type="button"
        onClick={() => onPageChange((value) => Math.max(1, value - 1))}
        disabled={currentPage === 1}
        className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        ← Назад
      </button>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(() => pageNumber)}
              className={`h-8 min-w-8 rounded-full px-2 text-xs font-semibold transition ${
                pageNumber === currentPage
                  ? "bg-red-800 text-white"
                  : "border border-red-100 bg-white text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onPageChange((value) => Math.min(totalPages, value + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Вперёд →
      </button>
    </div>
  );
}

function InventoryCompositionRow({
  item,
  canEditActuals,
  draftValue,
  onActualDraftChange,
}: {
  item: InventorySessionItemSummary;
  canEditActuals: boolean;
  draftValue: string;
  onActualDraftChange?: (itemId: number, value: string) => void;
}) {
  const actualQuantity = draftValue === "" ? item.actualQuantity : parseQuantity(draftValue);
  const varianceQuantity = actualQuantity === null ? null : actualQuantity - item.stockQuantity;
  const varianceValueCents = varianceQuantity === null ? null : varianceQuantity * item.priceCents;
  const varianceTone = getVarianceTone(varianceQuantity);

  return (
    <div className="grid gap-3 rounded-[16px] border border-red-950/10 bg-white/84 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_repeat(5,auto)] sm:items-center">
      <input type="hidden" name="itemId" value={item.id} />
      <div>
        <p className="text-sm font-semibold text-zinc-950">{item.productName}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{item.productCategory ?? "Без категории"}</p>
      </div>
      <CompositionValue label="Ед." value={item.productUnit} />
      <CompositionValue label="Старт" value={formatInventoryQuantity(item.stockQuantity)} />
      {canEditActuals ? (
        <label className="min-w-24 rounded-[14px] border border-red-950/10 bg-white/80 px-3 py-2 text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-800/50">Факт</p>
          <input
            name="actualQuantity"
            type="text"
            inputMode="decimal"
            value={draftValue}
            onChange={(event) => onActualDraftChange?.(item.id, event.target.value)}
            placeholder={item.actualQuantity === null ? formatInventoryQuantity(0) : formatInventoryQuantity(item.actualQuantity)}
            className="mt-0.5 h-7 w-20 rounded-full border border-red-950/10 bg-white/90 px-2 text-right text-xs font-semibold text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
        </label>
      ) : (
        <CompositionValue label="Факт" value={item.actualQuantity === null ? "Не внесён" : formatInventoryQuantity(item.actualQuantity)} />
      )}
      <CompositionValue
        label="Разница"
        valueClassName={varianceTone}
        value={varianceQuantity === null ? "—" : `${varianceQuantity > 0 ? "+" : ""}${formatInventoryQuantity(varianceQuantity)} ${item.productUnit}`}
      />
      <CompositionValue
        label="В рублях"
        valueClassName={varianceTone}
        value={varianceValueCents === null ? "—" : `${varianceValueCents > 0 ? "+" : ""}${formatMoney(varianceValueCents)}`}
      />
    </div>
  );
}

function CompositionValue({
  label,
  value,
  valueClassName = "text-zinc-950",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-20 rounded-[14px] border border-red-950/10 bg-white/80 px-3 py-2 text-right">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-800/50">{label}</p>
      <p className={`mt-0.5 text-xs font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}

function getVarianceTone(value: number | null) {
  if (value === null) {
    return "text-zinc-400";
  }
  if (value > 0) {
    return "text-emerald-700";
  }
  if (value < 0) {
    return "text-red-700";
  }
  return "text-zinc-600";
}
