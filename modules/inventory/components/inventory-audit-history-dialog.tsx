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
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
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
  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isActive = session.id === selectedSessionId;

        return (
          <button key={session.id} type="button" onClick={() => onSelectSession(session.id)} className={`w-full rounded-[12px] border px-5 py-4 text-left transition ${isActive ? "border-zinc-950 bg-zinc-950 text-white shadow-sm shadow-zinc-950/15" : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isActive ? "text-white/70" : "text-zinc-400"}`}>
              Инвентаризация #{session.id}
            </p>
            <p className={`mt-2 text-sm font-semibold ${isActive ? "text-white" : "text-zinc-950"}`}>{session.responsibleEmployeeName}</p>
            <p className={`mt-1 text-sm ${isActive ? "text-white/75" : "text-zinc-500"}`}>
              Закрыта {session.closedAt ? formatDateTime(session.closedAt) : formatDateTime(session.createdAt)}
            </p>
          </button>
        );
      })}
    </div>
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
    <div className="rounded-[14px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
      {session ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Лист инвентаризации #{session.id}</p>
            <h4 className="text-[1.3rem] font-semibold tracking-[-0.02em] text-zinc-950">{session.responsibleEmployeeName}</h4>
            <p className="text-sm text-zinc-500">{session.responsibleEmployeeRole} • Создана {formatDateTime(session.createdAt)}</p>
            {session.closedAt ? <p className="text-sm text-zinc-500">Закрыта {formatDateTime(session.closedAt)}</p> : null}
            {session.notes ? <p className="text-sm leading-6 text-zinc-600">{session.notes}</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <AuditStat label="Товаров" value={session.itemsCount} />
            <AuditStat label="Категорий" value={session.categories.length} />
            <AuditStat label="Строк с фактом" value={session.items.filter((item) => item.actualQuantity !== null).length} />
            <AuditStat label="Статус" value={<span className="text-sm font-semibold text-zinc-950">Только просмотр</span>} />
          </div>
          <ClosedSessionItemsTable items={session.items} />
          <div className="flex flex-wrap justify-end gap-3">
            <InventorySessionExportLink sessionId={session.id} variant="secondary" />
            {canManageInventory ? (
              <InventorySessionDeleteButton sessionId={session.id} sessionLabel={`#${session.id}`} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
