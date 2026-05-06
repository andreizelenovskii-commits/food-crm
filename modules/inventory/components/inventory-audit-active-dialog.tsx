import { InventorySessionExportLink } from "@/modules/inventory/components/inventory-session-export-link";
import {
  AuditDialogFrame,
  AuditDialogHeader,
  AuditEmptyState,
  AuditMessage,
  type InventoryFormAction,
} from "@/modules/inventory/components/inventory-audit-common";
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
      <SessionHeader
        session={session}
        canManageInventory={canManageInventory}
        isSavePending={isSavePending}
        saveFormAction={saveFormAction}
        actualDrafts={actualDrafts}
        onActualDraftChange={onActualDraftChange}
      />
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

function SessionHeader({
  session,
  canManageInventory,
  isSavePending,
  saveFormAction,
  actualDrafts,
  onActualDraftChange,
}: {
  session: InventorySessionSummary;
  canManageInventory: boolean;
  isSavePending: boolean;
  saveFormAction: InventoryFormAction;
  actualDrafts: Record<number, string>;
  onActualDraftChange: (itemId: number, value: string) => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/76 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-4">
      <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/65">Инвентаризация #{session.id}</p>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-800 ring-1 ring-red-100">
              {session.notes ?? "Инвентаризация"}
            </span>
          </div>
          <h4 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-950">{session.responsibleEmployeeName}</h4>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {session.responsibleEmployeeRole} • создана {formatDateTime(session.createdAt)}
          </p>
        </div>

        <div className="space-y-2 2xl:min-w-[620px]">
          <div className="rounded-[18px] border border-red-950/10 bg-white/68 p-2 shadow-sm shadow-red-950/5">
            <InventorySessionExportLink
              session={session}
              canManageInventory={canManageInventory}
              isSavePending={isSavePending}
              saveFormAction={saveFormAction}
              actualDrafts={actualDrafts}
              onActualDraftChange={onActualDraftChange}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <SessionMetric label="Товаров" value={session.itemsCount} />
            <SessionMetric label="Категорий" value={session.categories.length} />
            <SessionMetric label="Статус" value="Открыта" tone="red" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "red";
}) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 px-3 py-2.5 shadow-sm shadow-red-950/5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-red-800/50">{label}</p>
      <p className={["mt-1 text-lg font-semibold tracking-[-0.03em]", tone === "red" ? "text-red-800" : "text-zinc-950"].join(" ")}>
        {value}
      </p>
    </div>
  );
}
