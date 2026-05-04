import Link from "next/link";
import { ModuleIcon } from "@/components/ui/module-icon";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
import { formatMoney } from "@/modules/inventory/components/inventory-panel-utils";

export function IncomingActEditHeader({
  actId,
  rowsCount,
  totalCents,
}: {
  actId: number;
  rowsCount: number;
  totalCents: number;
}) {
  return (
    <GlassPanel className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="receipt" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Редактирование акта</p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-zinc-950">Акт поступления #{actId}</h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500">
              Меняй состав поставки, ответственного и цены, пока акт не завершён.
            </p>
          </div>
        </div>
        <div className="grid min-w-[240px] gap-3 sm:grid-cols-2">
          <IncomingEditStat label="Строк" value={rowsCount} />
          <IncomingEditStat label="Итого" value={formatMoney(totalCents)} />
        </div>
      </div>
    </GlassPanel>
  );
}

export function IncomingActEditFields({
  supplierName,
  notes,
  onSupplierNameChange,
  onNotesChange,
}: {
  supplierName: string;
  notes: string;
  onSupplierNameChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}) {
  return (
    <GlassPanel className="p-4">
      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="text-[11px] font-semibold text-zinc-700">Поставщик</span>
          <input
            name="supplierName"
            type="text"
            value={supplierName}
            onChange={(event) => onSupplierNameChange(event.target.value)}
            placeholder="Например: Фермерский двор"
            className="h-10 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
        </label>
        <label className="space-y-2">
          <span className="text-[11px] font-semibold text-zinc-700">Комментарий</span>
          <textarea
            name="notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={4}
            placeholder="Например: поставка по вечерней закупке"
            className="w-full rounded-[18px] border border-red-950/10 bg-white/85 px-4 py-2.5 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
        </label>
      </div>
    </GlassPanel>
  );
}

export function IncomingActEditFooter({
  draftEntriesCount,
  selectedResponsibleId,
  isPending,
}: {
  draftEntriesCount: number;
  selectedResponsibleId: string;
  isPending: boolean;
}) {
  return (
    <div className="mt-4 flex flex-wrap justify-end gap-3">
      <Link href="/dashboard/inventory?tab=incoming" className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white/85 px-5 text-sm font-medium tracking-[-0.01em] text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
        Отмена
      </Link>
      <button type="submit" disabled={draftEntriesCount === 0 || !selectedResponsibleId || isPending} className="inline-flex h-10 items-center rounded-full bg-red-800 px-5 text-sm font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:shadow-none">
        {isPending ? "Сохраняем..." : "Сохранить изменения"}
      </button>
    </div>
  );
}

function IncomingEditStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/78 px-4 py-3 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{value}</p>
    </div>
  );
}
