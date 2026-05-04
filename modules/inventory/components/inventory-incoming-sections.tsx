import { PaginatedList } from "@/components/ui/paginated-list";
import { ModuleIcon } from "@/components/ui/module-icon";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
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
    <GlassPanel className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
          <ModuleIcon name="receipt" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
            Поступление товара
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">Приход на склад</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Создавай акты по заведённым товарам и проводи их отдельно.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <IncomingOverviewStat label="Открытых актов" value={openCount} />
        <IncomingOverviewStat label="Приходов сегодня" value={incomingTodayCount} />
        <IncomingOverviewStat label="Проведено на сумму закупок" value={formatMoney(totalCompletedCents)} />
      </div>
    </GlassPanel>
  );
}

export function IncomingPanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-red-100 bg-red-50/80 px-4 py-3 text-xs font-semibold leading-5 text-red-800 shadow-sm shadow-red-950/5">
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
    <GlassPanel className="p-4 sm:p-5">
      <SectionHeader
        icon="receipt"
        eyebrow="В работе"
        title="Открытые акты поступления"
        description="Приход зафиксирован, но остаток увеличится только после завершения."
      />
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
    </GlassPanel>
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
    <GlassPanel className="p-4 sm:p-5">
      <SectionHeader
        icon="report"
        eyebrow="История"
        title="Завершённые поступления"
        description="После завершения акта остатки по товарам увеличиваются на количество в приходе."
      />
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
            <div className="rounded-[18px] border border-red-950/10 bg-white/65 px-4 py-3 text-sm text-zinc-500">
              Всего проведено единиц товара:{" "}
              <span className="font-semibold text-zinc-950">
                {formatInventoryQuantity(totalCompletedUnits)}
              </span>
            </div>
          </>
        )}
      </div>
    </GlassPanel>
  );
}

function IncomingOverviewStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
    </div>
  );
}

function EmptyIncomingState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-dashed border-red-200 bg-white/55 p-4 text-sm text-zinc-500">
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: "receipt" | "report";
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
        <ModuleIcon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h2>
        <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
