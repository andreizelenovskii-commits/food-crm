import { PaginatedList } from "@/components/ui/paginated-list";
import { InventoryIncomingActCard } from "@/modules/inventory/components/inventory-incoming-act-card";
import { formatMoney } from "@/modules/inventory/components/inventory-panel-utils";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { IncomingActSummary } from "@/modules/inventory/inventory.types";

type FormAction = (formData: FormData) => void;

export function IncomingOverview({
  openCount,
  incomingTodayCount,
  totalCompletedCents,
}: {
  openCount: number;
  incomingTodayCount: number;
  totalCompletedCents: number;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f1_100%)] p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">Поступление товара</p>
      <h2 className="mt-2 text-xl font-semibold text-zinc-950">Приход на склад</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        Создавай акты поступления только по товарам, которые уже заведены на склад, и проводи их отдельно.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <IncomingOverviewStat label="Открытых актов" value={openCount} />
        <IncomingOverviewStat label="Приходов сегодня" value={incomingTodayCount} />
        <IncomingOverviewStat label="Проведено на сумму закупок" value={formatMoney(totalCompletedCents)} />
      </div>
    </section>
  );
}

export function IncomingPanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </div>
  );
}

export function IncomingOpenActsSection({
  acts,
  canManageInventory,
  isCompletePending,
  completeFormAction,
}: {
  acts: IncomingActSummary[];
  canManageInventory: boolean;
  isCompletePending: boolean;
  completeFormAction: FormAction;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <h2 className="text-xl font-semibold text-zinc-950">Открытые акты поступления</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        В открытом акте приход зафиксирован, но остаток на складе увеличится только после завершения.
      </p>
      <div className="mt-4 space-y-4">
        {acts.length === 0 ? (
          <EmptyIncomingState>Пока нет ни одного открытого акта поступления.</EmptyIncomingState>
        ) : (
          <PaginatedList itemLabel="актов">
            {acts.map((act) => (
              <InventoryIncomingActCard
                key={act.id}
                act={act}
                canComplete
                canManageInventory={canManageInventory}
                isCompletePending={isCompletePending}
                completeFormAction={completeFormAction}
              />
            ))}
          </PaginatedList>
        )}
      </div>
    </section>
  );
}

export function IncomingCompletedActsSection({
  acts,
  totalCompletedUnits,
  canManageInventory,
  isCompletePending,
  completeFormAction,
}: {
  acts: IncomingActSummary[];
  totalCompletedUnits: number;
  canManageInventory: boolean;
  isCompletePending: boolean;
  completeFormAction: FormAction;
}) {
  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <h2 className="text-xl font-semibold text-zinc-950">Завершённые поступления</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        После завершения акта остатки по товарам увеличиваются на количество в приходе.
      </p>
      <div className="mt-4 space-y-4">
        {acts.length === 0 ? (
          <EmptyIncomingState>Пока нет завершённых поступлений.</EmptyIncomingState>
        ) : (
          <>
            <PaginatedList itemLabel="актов">
              {acts.map((act) => (
                <InventoryIncomingActCard
                  key={act.id}
                  act={act}
                  canComplete={false}
                  canManageInventory={canManageInventory}
                  isCompletePending={isCompletePending}
                  completeFormAction={completeFormAction}
                />
              ))}
            </PaginatedList>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Всего проведено единиц товара:{" "}
              <span className="font-semibold text-zinc-950">
                {formatInventoryQuantity(totalCompletedUnits)}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function IncomingOverviewStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function EmptyIncomingState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-dashed border-zinc-300 bg-zinc-50 p-4 sm:p-5 text-sm text-zinc-500">
      {children}
    </div>
  );
}
