import { PaginatedList } from "@/components/ui/paginated-list";
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/50 px-4 py-8 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Архив завершённых актов списания" className="max-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-y-auto rounded-[14px] border border-zinc-200 bg-[#fffdfc] p-4 sm:p-5 shadow-2xl shadow-zinc-950/20" onClick={(event) => event.stopPropagation()}>
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
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${group.reason === visibleReason ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/10" : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"}`}
            >
              {group.reason} {group.acts.length}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
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
    <div className="fixed inset-0 z-60 flex items-start justify-center bg-zinc-950/55 px-4 py-8 backdrop-blur-sm" onClick={() => (isDeletePending ? null : onClose())} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Подтверждение удаления акта списания" className="w-full max-w-xl rounded-[14px] border border-zinc-200 bg-[#fffdfc] p-4 sm:p-5 shadow-2xl shadow-zinc-950/20" onClick={(event) => event.stopPropagation()}>
        <DialogHeader
          eyebrow="Подтверждение удаления"
          title={`Удалить акт списания #${act.id}?`}
          description={buildDeleteDescription(act)}
          onClose={onClose}
          isCloseDisabled={isDeletePending}
          tone="danger"
        />
        <div className="mt-4 rounded-[12px] border border-red-100 bg-red-50/70 p-4">
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
          <button type="button" onClick={onClose} disabled={isDeletePending} className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50">
            Отмена
          </button>
          <button type="submit" disabled={isDeletePending} className="rounded-2xl bg-red-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300">
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
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${tone === "danger" ? "text-red-700" : "text-zinc-500"}`}>
          {eyebrow}
        </p>
        <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-zinc-950">{title}</h3>
        <p className="text-sm leading-6 text-zinc-600">{description}</p>
      </div>
      <button type="button" onClick={onClose} disabled={isCloseDisabled} className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50">
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
