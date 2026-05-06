"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { InventoryFormAction } from "@/modules/inventory/components/inventory-audit-common";
import { InventoryCompositionDialog } from "@/modules/inventory/components/inventory-session-composition-dialog";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { InventorySessionSummary } from "@/modules/inventory/inventory.types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(cents: number | null) {
  if (cents === null) return "";

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function escapeCell(value: string | number | null) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function InventorySessionExportLink({
  session,
  canManageInventory = false,
  isSavePending = false,
  saveFormAction,
  actualDrafts,
  onActualDraftChange,
}: {
  session: InventorySessionSummary;
  canManageInventory?: boolean;
  isSavePending?: boolean;
  saveFormAction?: InventoryFormAction;
  actualDrafts?: Record<number, string>;
  onActualDraftChange?: (itemId: number, value: string) => void;
}) {
  const [isCompositionOpen, setIsCompositionOpen] = useState(false);

  function openPrintWindow() {
    window.open(`/dashboard/inventory/sessions/${session.id}/print?autoPrint=1`, "_blank", "noopener,noreferrer");
  }

  function downloadExcel() {
    const rows = session.items.map((item, index) => [
      index + 1,
      item.productName,
      item.productCategory ?? "Без категории",
      item.productUnit,
      formatInventoryQuantity(item.currentStockQuantity),
      item.actualQuantity === null ? "" : formatInventoryQuantity(item.actualQuantity),
      item.varianceQuantity === null ? "" : formatInventoryQuantity(item.varianceQuantity),
      formatMoney(item.varianceValueCents),
    ]);
    const tableRows = [
      ["#", "Товар", "Категория", "Ед.", "Остаток в системе", "Факт", "Разница", "Сумма откл."],
      ...rows,
    ]
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeCell(cell)}</td>`).join("")}</tr>`)
      .join("");
    const html = `<!doctype html><html><head><meta charset="UTF-8"></head><body><h2>Инвентаризация #${session.id}</h2><p>Ответственный: ${escapeCell(session.responsibleEmployeeName)} · ${escapeCell(session.responsibleEmployeeRole)}</p><p>Создана: ${formatDateTime(session.createdAt)}</p><table border="1">${tableRows}</table></body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `inventory-session-${session.id}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="relative z-20 grid gap-2 sm:grid-cols-3">
        <ExportButton onClick={() => setIsCompositionOpen(true)} icon="list" label="Просмотреть состав" />
        <ExportButton onClick={openPrintWindow} icon="print" label="Распечатать" />
        <ExportButton onClick={downloadExcel} icon="excel" label="Выгрузить в Excel" />
      </div>
      {isCompositionOpen && typeof document !== "undefined"
        ? createPortal(
            <InventoryCompositionDialog
              session={session}
              canManageInventory={canManageInventory}
              isSavePending={isSavePending}
              saveFormAction={saveFormAction}
              actualDrafts={actualDrafts}
              onActualDraftChange={onActualDraftChange}
              onClose={() => setIsCompositionOpen(false)}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function ExportButton({ icon, label, onClick }: { icon: "print" | "excel" | "list"; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={(event) => { event.stopPropagation(); onClick(); }} className="group flex min-h-11 items-center gap-3 rounded-[16px] border border-red-100 bg-white/92 px-4 text-left text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-red-50 text-red-800 transition group-hover:bg-white/15 group-hover:text-white">
        {icon === "print" ? <PrintIcon /> : icon === "excel" ? <ExcelIcon /> : <ListIcon />}
      </span>
      <span className="min-w-0">
        <span className="block whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em]">{label}</span>
        <span className="mt-0.5 block text-[10px] font-medium text-red-800/55 transition group-hover:text-white/70">
          {icon === "print" ? "Открыть окно печати" : icon === "excel" ? "Скачать файл" : "Товары листа"}
        </span>
      </span>
    </button>
  );
}

function PrintIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M7 9V4h10v5" />
      <path d="M7 14H6a2 2 0 0 1-2-2v-1.5A2.5 2.5 0 0 1 6.5 8h11A2.5 2.5 0 0 1 20 10.5V12a2 2 0 0 1-2 2h-1" />
      <path d="M7 12h10v8H7z" />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h8M8 16h8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
