import { InventorySessionExportLink } from "@/modules/inventory/components/inventory-session-export-link";
import {
  AuditDialogFrame,
  AuditDialogHeader,
  AuditEmptyState,
  AuditMessage,
  AuditStat,
  type InventoryFormAction,
} from "@/modules/inventory/components/inventory-audit-common";
import { ActiveSessionItemsTable } from "@/modules/inventory/components/inventory-audit-session-tables";
import { formatDateTime } from "@/modules/inventory/components/inventory-panel-utils";
import type { InventorySessionSummary } from "@/modules/inventory/inventory.types";

export function InventoryAuditActiveDialog({
  sessions,
  selectedSession,
  selectedSessionId,
  actualDrafts,
  canManageInventory,
  isSavePending,
  isClosePending,
  saveErrorMessage,
  saveSuccessMessage,
  closeErrorMessage,
  closeSuccessMessage,
  saveFormAction,
  closeFormAction,
  onClose,
  onSelectSession,
  onActualDraftChange,
}: {
  sessions: InventorySessionSummary[];
  selectedSession: InventorySessionSummary | null;
  selectedSessionId: number | null;
  actualDrafts: Record<number, string>;
  canManageInventory: boolean;
  isSavePending: boolean;
  isClosePending: boolean;
  saveErrorMessage: string | null;
  saveSuccessMessage: string | null;
  closeErrorMessage: string | null;
  closeSuccessMessage: string | null;
  saveFormAction: InventoryFormAction;
  closeFormAction: InventoryFormAction;
  onClose: () => void;
  onSelectSession: (sessionId: number) => void;
  onActualDraftChange: (itemId: number, value: string) => void;
}) {
  return (
    <AuditDialogFrame title="Действующие инвентаризации" onClose={onClose}>
      <AuditDialogHeader
        eyebrow="Действующие инвентаризации"
        title="Открытые листы пересчёта"
        description="Здесь хранятся незакрытые инвентаризации. Для каждой позиции видно программный остаток, факт и расхождения."
        onClose={onClose}
      />
      {sessions.length === 0 ? (
        <AuditEmptyState>Сейчас нет ни одной действующей инвентаризации.</AuditEmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.58fr)_minmax(0,1.42fr)]">
          <SessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelectSession={onSelectSession}
          />
          {selectedSession ? (
            <ActiveSessionDetail
              session={selectedSession}
              actualDrafts={actualDrafts}
              canManageInventory={canManageInventory}
              isSavePending={isSavePending}
              isClosePending={isClosePending}
              saveErrorMessage={saveErrorMessage}
              saveSuccessMessage={saveSuccessMessage}
              closeErrorMessage={closeErrorMessage}
              closeSuccessMessage={closeSuccessMessage}
              saveFormAction={saveFormAction}
              closeFormAction={closeFormAction}
              onActualDraftChange={onActualDraftChange}
            />
          ) : null}
        </div>
      )}
    </AuditDialogFrame>
  );
}

function SessionList({
  sessions,
  selectedSessionId,
  onSelectSession,
}: {
  sessions: InventorySessionSummary[];
  selectedSessionId: number | null;
  onSelectSession: (sessionId: number) => void;
}) {
  return (
    <div className="space-y-2">
      {sessions.map((session) => {
        const isActive = session.id === selectedSessionId;
        const countedItems = session.items.filter((item) => item.actualQuantity !== null).length;

        return (
          <button key={session.id} type="button" onClick={() => onSelectSession(session.id)} className={`w-full rounded-[18px] border px-3 py-3 text-left shadow-sm transition ${isActive ? "border-red-800 bg-red-800 text-white shadow-red-950/15" : "border-red-950/10 bg-white/78 text-zinc-950 shadow-red-950/5 hover:border-red-200 hover:bg-white"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isActive ? "text-white/70" : "text-red-800/55"}`}>
              Инвентаризация #{session.id}
            </p>
            <p className={`mt-1 text-sm font-semibold ${isActive ? "text-white" : "text-zinc-950"}`}>{session.responsibleEmployeeName}</p>
            <p className={`mt-0.5 text-xs ${isActive ? "text-white/75" : "text-zinc-500"}`}>
              {session.responsibleEmployeeRole} • {formatDateTime(session.createdAt)}
            </p>
            <p className={`mt-1.5 text-xs font-medium ${isActive ? "text-white/75" : "text-zinc-600"}`}>
              Заполнено строк: {countedItems} из {session.itemsCount}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function ActiveSessionDetail({
  session,
  actualDrafts,
  canManageInventory,
  isSavePending,
  isClosePending,
  saveErrorMessage,
  saveSuccessMessage,
  closeErrorMessage,
  closeSuccessMessage,
  saveFormAction,
  closeFormAction,
  onActualDraftChange,
}: {
  session: InventorySessionSummary;
  actualDrafts: Record<number, string>;
  canManageInventory: boolean;
  isSavePending: boolean;
  isClosePending: boolean;
  saveErrorMessage: string | null;
  saveSuccessMessage: string | null;
  closeErrorMessage: string | null;
  closeSuccessMessage: string | null;
  saveFormAction: InventoryFormAction;
  closeFormAction: InventoryFormAction;
  onActualDraftChange: (itemId: number, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {saveErrorMessage ? <AuditMessage>{saveErrorMessage}</AuditMessage> : null}
      {saveSuccessMessage ? <AuditMessage>{saveSuccessMessage}</AuditMessage> : null}
      {closeErrorMessage ? <AuditMessage>{closeErrorMessage}</AuditMessage> : null}
      {closeSuccessMessage ? <AuditMessage>{closeSuccessMessage}</AuditMessage> : null}
      <SessionHeader session={session} />
      <form action={canManageInventory ? saveFormAction : undefined} className="space-y-3">
        <input type="hidden" name="sessionId" value={session.id} />
        <ActiveSessionItemsTable
          items={session.items}
          actualDrafts={actualDrafts}
          onActualDraftChange={onActualDraftChange}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <button type="submit" disabled={!canManageInventory || isSavePending || isClosePending} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
            {isSavePending ? "Сохраняем..." : "Сохранить факт"}
          </button>
        </div>
      </form>
      <form action={canManageInventory ? closeFormAction : undefined} className="flex justify-end">
        <input type="hidden" name="sessionId" value={session.id} />
        {session.items.map((item) => (
          <div key={item.id}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="actualQuantity" value={actualDrafts[item.id] ?? (item.actualQuantity === null ? "" : String(item.actualQuantity))} />
          </div>
        ))}
        <button type="submit" disabled={!canManageInventory || isSavePending || isClosePending} className="inline-flex h-9 items-center rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:shadow-none">
          {isClosePending ? "Закрываем..." : "Закрыть инвентаризацию"}
        </button>
      </form>
    </div>
  );
}

function SessionHeader({ session }: { session: InventorySessionSummary }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/76 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Инвентаризация #{session.id}</p>
          <h4 className="mt-1 text-base font-semibold tracking-[-0.02em] text-zinc-950">{session.responsibleEmployeeName}</h4>
          <p className="mt-1 text-xs text-zinc-500">{session.responsibleEmployeeRole} • {formatDateTime(session.createdAt)}</p>
          {session.notes ? <p className="mt-1.5 text-xs leading-5 text-zinc-600">{session.notes}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <InventorySessionExportLink sessionId={session.id} variant="secondary" />
          <div className="grid gap-2 sm:grid-cols-3">
            <AuditStat label="Товаров" value={session.itemsCount} />
            <AuditStat label="Категорий" value={session.categories.length} />
            <AuditStat label="Статус" value={<span className="text-sm font-semibold text-amber-700">Открыта</span>} />
          </div>
        </div>
      </div>
    </div>
  );
}
