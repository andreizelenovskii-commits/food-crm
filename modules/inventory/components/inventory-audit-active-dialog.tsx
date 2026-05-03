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
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
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
    <div className="space-y-3">
      {sessions.map((session) => {
        const isActive = session.id === selectedSessionId;
        const countedItems = session.items.filter((item) => item.actualQuantity !== null).length;

        return (
          <button key={session.id} type="button" onClick={() => onSelectSession(session.id)} className={`w-full rounded-[12px] border px-5 py-4 text-left transition ${isActive ? "border-zinc-950 bg-zinc-950 text-white shadow-sm shadow-zinc-950/15" : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isActive ? "text-white/70" : "text-zinc-400"}`}>
              Инвентаризация #{session.id}
            </p>
            <p className={`mt-2 text-sm font-semibold ${isActive ? "text-white" : "text-zinc-950"}`}>{session.responsibleEmployeeName}</p>
            <p className={`mt-1 text-sm ${isActive ? "text-white/75" : "text-zinc-500"}`}>
              {session.responsibleEmployeeRole} • {formatDateTime(session.createdAt)}
            </p>
            <p className={`mt-2 text-sm ${isActive ? "text-white/75" : "text-zinc-600"}`}>
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
    <div className="space-y-4">
      {saveErrorMessage ? <AuditMessage>{saveErrorMessage}</AuditMessage> : null}
      {saveSuccessMessage ? <AuditMessage>{saveSuccessMessage}</AuditMessage> : null}
      {closeErrorMessage ? <AuditMessage>{closeErrorMessage}</AuditMessage> : null}
      {closeSuccessMessage ? <AuditMessage>{closeSuccessMessage}</AuditMessage> : null}
      <SessionHeader session={session} />
      <form action={canManageInventory ? saveFormAction : undefined} className="space-y-4">
        <input type="hidden" name="sessionId" value={session.id} />
        <ActiveSessionItemsTable
          items={session.items}
          actualDrafts={actualDrafts}
          onActualDraftChange={onActualDraftChange}
        />
        <div className="flex flex-wrap justify-end gap-3">
          <button type="submit" disabled={!canManageInventory || isSavePending || isClosePending} className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50">
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
        <button type="submit" disabled={!canManageInventory || isSavePending || isClosePending} className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400">
          {isClosePending ? "Закрываем..." : "Закрыть инвентаризацию"}
        </button>
      </form>
    </div>
  );
}

function SessionHeader({ session }: { session: InventorySessionSummary }) {
  return (
    <div className="rounded-[14px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Инвентаризация #{session.id}</p>
          <h4 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.02em] text-zinc-950">{session.responsibleEmployeeName}</h4>
          <p className="mt-1 text-sm text-zinc-500">{session.responsibleEmployeeRole} • {formatDateTime(session.createdAt)}</p>
          {session.notes ? <p className="mt-2 text-sm leading-6 text-zinc-600">{session.notes}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-3">
          <InventorySessionExportLink sessionId={session.id} variant="secondary" />
          <div className="grid gap-3 sm:grid-cols-3">
            <AuditStat label="Товаров" value={session.itemsCount} />
            <AuditStat label="Категорий" value={session.categories.length} />
            <AuditStat label="Статус" value={<span className="text-sm font-semibold text-amber-700">Открыта</span>} />
          </div>
        </div>
      </div>
    </div>
  );
}
