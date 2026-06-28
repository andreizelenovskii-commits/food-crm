import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
import {
  createManagementAccountingEntry,
  deleteManagementAccountingEntry,
} from "@/modules/management-accounting/management-accounting.actions";
import type {
  ManagementAccountingManualEntry,
  ManagementAccountingViewModel,
} from "@/modules/management-accounting/management-accounting.types";

const MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

function formatMoney(cents: number) {
  return MONEY_FORMATTER.format(cents / 100);
}

function ManualEntryList({ entries }: { entries: ManagementAccountingManualEntry[] }) {
  return (
    <div className="mt-4 divide-y divide-red-950/10">
      {entries.length ? (
        entries.map((entry) => (
          <div key={entry.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900">
                {entry.category}
                <span className={entry.type === "INCOME" ? "ml-2 text-emerald-700" : "ml-2 text-red-800"}>
                  {entry.type === "INCOME" ? "Доход" : "Расход"}
                </span>
              </p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500">{entry.comment || "Без комментария"}</p>
            </div>
            <p className="text-sm font-semibold text-zinc-950">{formatMoney(entry.amountCents)}</p>
            <form action={deleteManagementAccountingEntry}>
              <input type="hidden" name="entryId" value={entry.id} />
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white/80 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
              >
                Удалить
              </button>
            </form>
          </div>
        ))
      ) : (
        <p className="foodlike-empty px-4 py-4">
          Ручных статей пока нет. Добавь бензин, аренду, свет, комиссии или другой расход за день.
        </p>
      )}
    </div>
  );
}

export function ManagementAccountingManualPanel({ accounting }: { accounting: ManagementAccountingViewModel }) {
  return (
    <GlassPanel className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="foodlike-kicker">Ручные данные</p>
          <h2 className="mt-1 foodlike-title-sm">Расходы и доходы дня</h2>
        </div>
        <p className="rounded-full border border-red-100 bg-white/80 px-3 py-1 text-xs font-semibold text-red-800">
          {accounting.manualEntries.length} статей
        </p>
      </div>
      <form action={createManagementAccountingEntry} className="mt-4 grid gap-2 lg:grid-cols-[150px_1fr_150px_1fr_auto]">
        <input type="hidden" name="date" value={accounting.range.date} />
        <select
          name="type"
          className="h-10 rounded-full border border-red-100 bg-white/90 px-3 text-sm font-semibold text-zinc-900 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/15"
          defaultValue="EXPENSE"
        >
          <option value="EXPENSE">Расход</option>
          <option value="INCOME">Доход</option>
        </select>
        <input
          name="category"
          placeholder="Бензин, аренда, свет"
          className="h-10 rounded-full border border-red-100 bg-white/90 px-4 text-sm font-semibold text-zinc-900 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/15"
          required
        />
        <input
          name="amount"
          type="number"
          min="1"
          step="0.01"
          placeholder="Сумма"
          className="h-10 rounded-full border border-red-100 bg-white/90 px-4 text-sm font-semibold text-zinc-900 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/15"
          required
        />
        <input
          name="comment"
          placeholder="Комментарий"
          className="h-10 rounded-full border border-red-100 bg-white/90 px-4 text-sm font-semibold text-zinc-900 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/15"
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-full border border-red-800 bg-red-800 px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900"
        >
          Добавить
        </button>
      </form>
      <ManualEntryList entries={accounting.manualEntries} />
    </GlassPanel>
  );
}
