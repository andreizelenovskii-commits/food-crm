import { PaginatedList } from "@/components/ui/paginated-list";
import { ModuleIcon } from "@/components/ui/module-icon";
import { InventoryWriteoffActCard } from "@/modules/inventory/components/inventory-writeoff-act-card";
import {
  formatDateTime,
  formatMoney,
} from "@/modules/inventory/components/inventory-panel-utils";
import type {
  WriteoffActSummary,
  WriteoffReason,
} from "@/modules/inventory/inventory.types";

type FormAction = (formData: FormData) => void;

export function WriteoffCompletedActsDialog({
  groups,
  visibleReason,
  visibleActs,
  canManageInventory,
  isCompletePending,
  completeFormAction,
  onReasonChange,
  onClose,
  onDelete,
}: {
  groups: Array<{ reason: WriteoffReason; acts: WriteoffActSummary[] }>;
  visibleReason: WriteoffReason | "";
  visibleActs: WriteoffActSummary[];
  canManageInventory: boolean;
  isCompletePending: boolean;
  completeFormAction: FormAction;
  onReasonChange: (reason: WriteoffReason) => void;
  onClose: () => void;
  onDelete: (act: WriteoffActSummary) => void;
}) {
  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Архив завершённых актов списания" className="relative mx-auto max-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-y-auto rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5" onClick={(event) => event.stopPropagation()}>
        <DialogHeader
          eyebrow="Архив списаний"
          title="Все завершённые акты списания"
          description="Здесь собраны все завершённые акты, начиная с самого нового."
          onClose={onClose}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.reason}
              type="button"
              onClick={() => onReasonChange(group.reason)}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold shadow-sm shadow-red-950/5 transition ${group.reason === visibleReason ? "border-red-800 bg-red-800 text-white" : "border-red-100 bg-white/85 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"}`}
            >
              {group.reason} {group.acts.length}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-[18px] border border-red-950/10 bg-white/70 px-4 py-3 shadow-sm shadow-red-950/5">
          <p className="text-sm font-semibold text-zinc-950">{visibleReason}</p>
          <p className="text-xs text-zinc-500">
            {visibleActs.length} актов в выбранной категории списания
          </p>
        </div>
        <div className="mt-4">
          <PaginatedList itemLabel="актов">
            {visibleActs.map((act) => (
              <InventoryWriteoffActCard
                key={act.id}
                act={act}
                canComplete={false}
                canManageInventory={canManageInventory}
                isCompletePending={isCompletePending}
                completeFormAction={completeFormAction}
                onDelete={onDelete}
              />
            ))}
          </PaginatedList>
        </div>
      </div>
    </div>
  );
}

export function WriteoffDeleteDialog({
  act,
  isDeletePending,
  deleteFormAction,
  onClose,
}: {
  act: WriteoffActSummary;
  isDeletePending: boolean;
  deleteFormAction: FormAction;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-80 flex items-start justify-center bg-zinc-950/30 px-4 py-8 backdrop-blur-sm" onClick={() => (isDeletePending ? null : onClose())} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Подтверждение удаления акта списания" className="w-full max-w-xl rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5" onClick={(event) => event.stopPropagation()}>
        <DialogHeader
          eyebrow="Подтверждение удаления"
          title={`Удалить акт списания #${act.id}?`}
          description={buildDeleteDescription(act)}
          onClose={onClose}
          isCloseDisabled={isDeletePending}
          tone="danger"
        />
        <div className="mt-4 rounded-[18px] border border-red-100 bg-red-50/70 p-4">
          <p className="text-sm font-medium text-zinc-950">
            {act.responsibleEmployeeName} • {formatDateTime(act.createdAt)}
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Позиций в акте: {act.itemsCount}. Сумма: {formatMoney(act.totalCents)}.
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Статус: {act.isCompleted ? "завершён, остатки будут восстановлены" : "открыт, удаление без движения остатков"}
          </p>
        </div>
        <form action={deleteFormAction} className="mt-4 flex flex-wrap justify-end gap-3">
          <input type="hidden" name="actId" value={act.id} />
          <button type="button" onClick={onClose} disabled={isDeletePending} className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white/85 px-5 text-sm font-medium tracking-[-0.01em] text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
            Отмена
          </button>
          <button type="submit" disabled={isDeletePending} className="inline-flex h-10 items-center rounded-full bg-red-800 px-5 text-sm font-medium text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300">
            {isDeletePending ? "Удаляем..." : "Подтвердить удаление"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DialogHeader({
  eyebrow,
  title,
  description,
  onClose,
  isCloseDisabled = false,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  onClose: () => void;
  isCloseDisabled?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
          <ModuleIcon name={tone === "danger" ? "report" : "receipt"} className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{eyebrow}</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
        </div>
      </div>
      <button type="button" onClick={onClose} disabled={isCloseDisabled} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
        Закрыть
      </button>
    </div>
  );
}

function buildDeleteDescription(act: WriteoffActSummary) {
  return (
    <>
      Будет удалён акт с причиной <span className="font-medium text-zinc-950">{act.reason}</span>.
      {act.isCompleted
        ? " При удалении завершённого акта остатки по его товарам будут возвращены на склад. Это действие нельзя отменить."
        : " Это действие нельзя отменить."}
    </>
  );
}
