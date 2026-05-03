import Link from "next/link";
import { IncomingActDeleteButton } from "@/modules/inventory/components/incoming-act-delete-button";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { IncomingActSummary } from "@/modules/inventory/inventory.types";
import {
  formatDateTime,
  formatMoney,
} from "@/modules/inventory/components/inventory-panel-utils";

export function InventoryIncomingActCard({
  act,
  canComplete,
  canManageInventory,
  isCompletePending,
  completeFormAction,
}: {
  act: IncomingActSummary;
  canComplete: boolean;
  canManageInventory: boolean;
  isCompletePending: boolean;
  completeFormAction: (formData: FormData) => void;
}) {
  return (
    <article className="rounded-[14px] border border-zinc-200 bg-zinc-50/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Акт #{act.id}</p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-950">
            {act.supplierName ? `Поставка от ${act.supplierName}` : "Поступление на склад"}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {act.responsibleEmployeeName} • {canComplete ? formatDateTime(act.createdAt) : `Завершён ${act.completedAt ? formatDateTime(act.completedAt) : formatDateTime(act.createdAt)}`}
          </p>
          {act.notes ? <p className="mt-2 text-sm leading-6 text-zinc-600">{act.notes}</p> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <IncomingActStat label="Строк" value={act.itemsCount} />
          <IncomingActStat label="Сумма" value={formatMoney(act.totalCents)} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">{canComplete ? "Сейчас на складе" : "Было"}</th>
                <th className="px-4 py-3 font-medium">Поступило</th>
                <th className="px-4 py-3 font-medium">Закупочная цена</th>
                <th className="px-4 py-3 font-medium">{canComplete ? "После завершения" : "Стало"}</th>
              </tr>
            </thead>
            <tbody>
              {act.items.map((item) => (
                <tr key={item.id} className="border-t border-zinc-200">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-950">{item.productName}</p>
                    <p className="text-zinc-500">{item.productCategory ?? "Без категории"} • {item.productUnit}</p>
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {formatInventoryQuantity(canComplete ? item.currentStockQuantity : (item.stockQuantityBefore ?? item.currentStockQuantity))} {item.productUnit}
                  </td>
                  <td className="px-4 py-4 font-medium text-red-800">
                    +{formatInventoryQuantity(item.quantity)} {item.productUnit}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">{formatMoney(item.priceCents)}</td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {formatInventoryQuantity(canComplete ? item.currentStockQuantity + item.quantity : (item.stockQuantityAfter ?? item.currentStockQuantity))} {item.productUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canManageInventory ? (
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          {canComplete ? (
            <Link href={`/dashboard/inventory/incoming/${act.id}`} className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950">
              Редактировать
            </Link>
          ) : null}
          <IncomingActDeleteButton actId={act.id} isCompleted={!canComplete} />
          {canComplete ? (
            <form action={completeFormAction}>
              <input type="hidden" name="actId" value={act.id} />
              <button type="submit" disabled={isCompletePending} className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400">
                {isCompletePending ? "Проводим..." : "Завершить акт"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function IncomingActStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
