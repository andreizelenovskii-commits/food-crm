"use client";

import { useMemo, useState } from "react";
import { InventorySessionDeleteButton } from "@/modules/inventory/components/inventory-session-delete-button";
import { InventorySessionExportLink } from "@/modules/inventory/components/inventory-session-export-link";
import {
  AuditDialogFrame,
  AuditDialogHeader,
  AuditEmptyState,
  AuditStat,
} from "@/modules/inventory/components/inventory-audit-common";
import { ClosedSessionItemsTable } from "@/modules/inventory/components/inventory-audit-session-tables";
import { formatDateTime } from "@/modules/inventory/components/inventory-panel-utils";
import type { InventorySessionSummary } from "@/modules/inventory/inventory.types";

export function InventoryAuditHistoryDialog({
  sessions,
  selectedSession,
  selectedSessionId,
  canManageInventory,
  onClose,
  onSelectSession,
}: {
  sessions: InventorySessionSummary[];
  selectedSession: InventorySessionSummary | null;
  selectedSessionId: number | null;
  canManageInventory: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: number) => void;
}) {
  return (
    <AuditDialogFrame title="Закрытые инвентаризации" onClose={onClose}>
      <AuditDialogHeader
        eyebrow="Архив инвентаризаций"
        title="Закрытые инвентаризации"
        description="Здесь лежат уже закрытые листы с датой завершения и зафиксированным составом инвентаризации."
        onClose={onClose}
      />
      {sessions.length === 0 ? (
        <AuditEmptyState>Пока нет ни одной закрытой инвентаризации.</AuditEmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.58fr)_minmax(0,1.42fr)]">
          <HistorySessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelectSession={onSelectSession}
          />
          <HistorySessionDetail session={selectedSession} canManageInventory={canManageInventory} />
        </div>
      )}
    </AuditDialogFrame>
  );
}

function HistorySessionList({
  sessions,
  selectedSessionId,
  onSelectSession,
}: {
  sessions: InventorySessionSummary[];
  selectedSessionId: number | null;
  onSelectSession: (sessionId: number) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visibleSessions = useMemo(
    () => sessions.slice((safePage - 1) * pageSize, safePage * pageSize),
    [safePage, sessions],
  );

  return (
    <div className="space-y-2">
      {visibleSessions.map((session) => {
        const isActive = session.id === selectedSessionId;

        return (
          <button key={session.id} type="button" onClick={() => onSelectSession(session.id)} className={`w-full rounded-[18px] border px-3 py-3 text-left shadow-sm transition ${isActive ? "border-red-800 bg-red-800 text-white shadow-red-950/15" : "border-red-950/10 bg-white/78 text-zinc-950 shadow-red-950/5 hover:border-red-200 hover:bg-white"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isActive ? "text-white/70" : "text-red-800/55"}`}>
              Инвентаризация #{session.id}
            </p>
            <p className={`mt-1 text-sm font-semibold ${isActive ? "text-white" : "text-zinc-950"}`}>{session.responsibleEmployeeName}</p>
            <p className={`mt-0.5 text-xs ${isActive ? "text-white/75" : "text-zinc-500"}`}>
              Закрыта {session.closedAt ? formatDateTime(session.closedAt) : formatDateTime(session.createdAt)}
            </p>
          </button>
        );
      })}
      {sessions.length > pageSize ? (
        <div className="rounded-[18px] border border-red-950/10 bg-white/72 p-2 shadow-sm shadow-red-950/5">
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <HistoryPageButton key={page} isActive={page === safePage} onClick={() => setCurrentPage(page)}>
                {page}
              </HistoryPageButton>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HistoryPageButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={["flex h-8 min-w-8 items-center justify-center rounded-full border px-3 text-xs font-semibold shadow-sm transition hover:border-red-800 hover:bg-red-800 hover:text-white", isActive ? "border-red-800 bg-red-800 text-white shadow-red-950/15" : "border-red-100 bg-white/90 text-red-800 shadow-red-950/5"].join(" ")} aria-current={isActive ? "page" : undefined}>
      {children}
    </button>
  );
}

function HistorySessionDetail({
  session,
  canManageInventory,
}: {
  session: InventorySessionSummary | null;
  canManageInventory: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/76 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-4">
      {session ? (
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Лист инвентаризации #{session.id}</p>
            <h4 className="mt-1 text-base font-semibold tracking-[-0.02em] text-zinc-950">{session.responsibleEmployeeName}</h4>
            <p className="mt-1 text-xs text-zinc-500">{session.responsibleEmployeeRole} • Создана {formatDateTime(session.createdAt)}</p>
            {session.closedAt ? <p className="mt-0.5 text-xs text-zinc-500">Закрыта {formatDateTime(session.closedAt)}</p> : null}
            {session.notes ? <p className="mt-1.5 text-xs leading-5 text-zinc-600">{session.notes}</p> : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <AuditStat label="Товаров" value={session.itemsCount} />
            <AuditStat label="Категорий" value={session.categories.length} />
            <AuditStat label="Строк с фактом" value={session.items.filter((item) => item.actualQuantity !== null).length} />
            <AuditStat label="Статус" value={<span className="text-sm font-semibold text-zinc-950">Только просмотр</span>} />
          </div>
          <ClosedSessionItemsTable items={session.items} />
          <div className="flex flex-wrap justify-end gap-2">
            <InventorySessionExportLink session={session} />
            {canManageInventory ? (
              <InventorySessionDeleteButton sessionId={session.id} sessionLabel={`#${session.id}`} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
