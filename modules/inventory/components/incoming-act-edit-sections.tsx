import Link from "next/link";
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
    <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f1_100%)] p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Редактирование акта</p>
          <h2 className="text-[1.9rem] font-semibold tracking-[-0.03em] text-zinc-950">Акт поступления #{actId}</h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            Меняй состав поставки, ответственного и цены, пока акт не завершён и остатки ещё не проведены по складу.
          </p>
        </div>
        <div className="grid min-w-[240px] gap-3 sm:grid-cols-2">
          <IncomingEditStat label="Строк" value={rowsCount} />
          <IncomingEditStat label="Итого" value={formatMoney(totalCents)} />
        </div>
      </div>
    </section>
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
    <section className="rounded-[14px] border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5">
      <div className="grid gap-5">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Поставщик</span>
          <input
            name="supplierName"
            type="text"
            value={supplierName}
            onChange={(event) => onSupplierNameChange(event.target.value)}
            placeholder="Например: Фермерский двор"
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Комментарий</span>
          <textarea
            name="notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={4}
            placeholder="Например: поставка по вечерней закупке"
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
          />
        </label>
      </div>
    </section>
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
      <Link href="/dashboard/inventory?tab=incoming" className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950">
        Отмена
      </Link>
      <button type="submit" disabled={draftEntriesCount === 0 || !selectedResponsibleId || isPending} className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400">
        {isPending ? "Сохраняем..." : "Сохранить изменения"}
      </button>
    </div>
  );
}

function IncomingEditStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
