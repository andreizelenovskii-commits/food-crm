import { PaginatedList } from "@/components/ui/paginated-list";
import { ModuleIcon } from "@/components/ui/module-icon";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
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
    <GlassPanel className="p-4 sm:p-5">
      <SectionHeader
        icon="receipt"
        eyebrow="Списание товара"
        title="Потери, расход и контроль остатков"
        description="Создавай акты списания и проводи их отдельно. Остаток товара уменьшится после завершения акта."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <WriteoffOverviewStat label="Открытых актов" value={openCount} />
        <WriteoffOverviewStat label="Завершённых актов" value={completedCount} />
        <WriteoffOverviewStat label="Сумма списаний" value={formatMoney(totalCompletedCents)} />
      </div>
    </GlassPanel>
  );
}

export function InventoryPanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-red-100 bg-red-50/80 px-4 py-3 text-xs font-semibold leading-5 text-red-800 shadow-sm shadow-red-950/5">
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
    <GlassPanel className="p-4 sm:p-5">
      <SectionHeader
        icon="receipt"
        eyebrow="В работе"
        title="Открытые акты списания"
        description="Состав уже зафиксирован, но остатки на складе изменятся только после завершения."
      />
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
    </GlassPanel>
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
    <GlassPanel className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader
          icon="report"
          eyebrow="История"
          title="Завершённые списания"
          description="После завершения остаток товара уменьшается на количество в акте."
        />
        {totalCount > 1 ? (
          <button type="button" onClick={onOpenArchive} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Все списания · {totalCount}
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
    </GlassPanel>
  );
}

function WriteoffOverviewStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
    </div>
  );
}

function EmptyWriteoffState({ children }: { children: React.ReactNode }) {
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
