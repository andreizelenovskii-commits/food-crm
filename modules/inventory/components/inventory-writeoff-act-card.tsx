import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { WriteoffActSummary } from "@/modules/inventory/inventory.types";
import {
  formatDateTime,
  formatMoney,
} from "@/modules/inventory/components/inventory-panel-utils";

type FormAction = (formData: FormData) => void;

export function InventoryWriteoffActCard({
  act,
  canComplete,
  canManageInventory,
  isCompletePending,
  completeFormAction,
  onDelete,
}: {
  act: WriteoffActSummary;
  canComplete: boolean;
  canManageInventory: boolean;
  isCompletePending: boolean;
  completeFormAction: FormAction;
  onDelete: (act: WriteoffActSummary) => void;
}) {
  return (
    <article className="rounded-[14px] border border-zinc-200 bg-zinc-50/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Акт #{act.id}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-950">{act.reason}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {formatWriteoffActMeta(act, canComplete)}
          </p>
          {act.notes ? <p className="mt-2 text-sm leading-6 text-zinc-600">{act.notes}</p> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <WriteoffActStat label="Строк" value={act.itemsCount} />
          <WriteoffActStat label="Сумма" value={formatMoney(act.totalCents)} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">
                  {canComplete ? "В наличии сейчас" : "Было"}
                </th>
                <th className="px-4 py-3 font-medium">Списать</th>
                <th className="px-4 py-3 font-medium">
                  {canComplete ? "После завершения" : "Стало"}
                </th>
              </tr>
            </thead>
            <tbody>
              {act.items.map((item) => (
                <tr key={item.id} className="border-t border-zinc-200">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-950">{item.productName}</p>
                    <p className="text-zinc-500">
                      {item.productCategory ?? "Без категории"} • Списание в {item.productUnit}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {formatInventoryQuantity(
                      canComplete
                        ? item.currentStockQuantity
                        : (item.stockQuantityBefore ?? item.currentStockQuantity),
                    )}{" "}
                    {item.productUnit}
                  </td>
                  <td className="px-4 py-4 font-medium text-red-700">
                    -{formatInventoryQuantity(item.quantity)} {item.productUnit}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {formatInventoryQuantity(
                      canComplete
                        ? item.currentStockQuantity - item.quantity
                        : (item.stockQuantityAfter ?? item.currentStockQuantity),
                    )}{" "}
                    {item.productUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canManageInventory ? (
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => onDelete(act)}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-800 transition hover:border-red-200 hover:bg-red-100"
          >
            Удалить акт
          </button>
          {canComplete ? (
            <form action={completeFormAction}>
              <input type="hidden" name="actId" value={act.id} />
              <button
                type="submit"
                disabled={isCompletePending}
                className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isCompletePending ? "Проводим..." : "Завершить акт"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function formatWriteoffActMeta(act: WriteoffActSummary, canComplete: boolean) {
  if (canComplete) {
    return `${act.responsibleEmployeeName} • ${act.responsibleEmployeeRole} • ${formatDateTime(act.createdAt)}`;
  }

  const completedAt = act.completedAt ? formatDateTime(act.completedAt) : formatDateTime(act.createdAt);
  return `${act.responsibleEmployeeName} • Завершён ${completedAt}`;
}

function WriteoffActStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
