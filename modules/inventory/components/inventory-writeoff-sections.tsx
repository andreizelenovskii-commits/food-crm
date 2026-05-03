import { PaginatedList } from "@/components/ui/paginated-list";
import { InventoryWriteoffActCard } from "@/modules/inventory/components/inventory-writeoff-act-card";
import { formatMoney } from "@/modules/inventory/components/inventory-panel-utils";
import type { WriteoffActSummary } from "@/modules/inventory/inventory.types";

type FormAction = (formData: FormData) => void;

export function WriteoffOverview({
  openCount,
  completedCount,
  totalCompletedCents,
}: {
  openCount: number;
  completedCount: number;
  totalCompletedCents: number;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff0ef_100%)] p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">Списание товара</p>
      <h2 className="mt-2 text-xl font-semibold text-zinc-950">Потери, расход и отрицательные остатки</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        Создавай акты списания, проводи их отдельно и при завершении система уменьшит остаток товара даже ниже нуля.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <WriteoffOverviewStat label="Открытых актов" value={openCount} />
        <WriteoffOverviewStat label="Завершённых актов" value={completedCount} />
        <WriteoffOverviewStat label="Сумма списаний" value={formatMoney(totalCompletedCents)} />
      </div>
    </section>
  );
}

export function InventoryPanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </div>
  );
}

export function WriteoffOpenActsSection({
  acts,
  canManageInventory,
  isCompletePending,
  completeFormAction,
  onDelete,
}: {
  acts: WriteoffActSummary[];
  canManageInventory: boolean;
  isCompletePending: boolean;
  completeFormAction: FormAction;
  onDelete: (act: WriteoffActSummary) => void;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <h2 className="text-xl font-semibold text-zinc-950">Открытые акты списания</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        В открытом акте состав уже зафиксирован, но остатки на складе изменятся только после завершения.
      </p>
      <div className="mt-4 space-y-4">
        {acts.length === 0 ? (
          <EmptyWriteoffState>Пока нет ни одного открытого акта списания.</EmptyWriteoffState>
        ) : (
          <PaginatedList itemLabel="актов">
            {acts.map((act) => (
              <InventoryWriteoffActCard
                key={act.id}
                act={act}
                canComplete
                canManageInventory={canManageInventory}
                isCompletePending={isCompletePending}
                completeFormAction={completeFormAction}
                onDelete={onDelete}
              />
            ))}
          </PaginatedList>
        )}
      </div>
    </section>
  );
}

export function WriteoffCompletedActsSection({
  latestAct,
  totalCount,
  canManageInventory,
  isCompletePending,
  completeFormAction,
  onOpenArchive,
  onDelete,
}: {
  latestAct: WriteoffActSummary | null;
  totalCount: number;
  canManageInventory: boolean;
  isCompletePending: boolean;
  completeFormAction: FormAction;
  onOpenArchive: () => void;
  onDelete: (act: WriteoffActSummary) => void;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950">Завершённые акты списания</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            После завершения остаток товара уменьшается на количество в акте. Отрицательные остатки допустимы.
          </p>
        </div>
        {totalCount > 1 ? (
          <button type="button" onClick={onOpenArchive} className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950">
            Показать ещё
          </button>
        ) : null}
      </div>
      <div className="mt-4 space-y-4">
        {latestAct === null ? (
          <EmptyWriteoffState>Пока нет завершённых актов списания.</EmptyWriteoffState>
        ) : (
          <>
            <InventoryWriteoffActCard
              act={latestAct}
              canComplete={false}
              canManageInventory={canManageInventory}
              isCompletePending={isCompletePending}
              completeFormAction={completeFormAction}
              onDelete={onDelete}
            />
            {totalCount > 1 ? (
              <p className="text-sm text-zinc-500">
                Показан последний завершённый акт. Остальные доступны в архиве по кнопке выше.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

function WriteoffOverviewStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function EmptyWriteoffState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-dashed border-zinc-300 bg-zinc-50 p-4 sm:p-5 text-sm text-zinc-500">
      {children}
    </div>
  );
}
