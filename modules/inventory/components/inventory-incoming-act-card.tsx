import Link from "next/link";
import { ModuleIcon } from "@/components/ui/module-icon";
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
    <article className="rounded-[20px] border border-red-950/10 bg-white/70 p-4 shadow-sm shadow-red-950/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-red-800 text-white shadow-sm shadow-red-950/15">
            <ModuleIcon name="receipt" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">Акт #{act.id}</p>
            <h3 className="mt-1 text-base font-semibold text-zinc-950">
              {act.supplierName ? `Поставка от ${act.supplierName}` : "Поступление на склад"}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {act.responsibleEmployeeName} • {canComplete ? formatDateTime(act.createdAt) : `Завершён ${act.completedAt ? formatDateTime(act.completedAt) : formatDateTime(act.createdAt)}`}
            </p>
            {act.notes ? <p className="mt-2 text-xs leading-5 text-zinc-500">{act.notes}</p> : null}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <IncomingActStat label="Строк" value={act.itemsCount} />
          <IncomingActStat label="Сумма" value={formatMoney(act.totalCents)} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[18px] border border-red-950/10 bg-white/76">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-red-50/45">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">
                <th className="px-4 py-3 font-semibold">Товар</th>
                <th className="px-4 py-3 font-semibold">{canComplete ? "Сейчас" : "Было"}</th>
                <th className="px-4 py-3 font-semibold">Поступило</th>
                <th className="px-4 py-3 font-semibold">Цена</th>
                <th className="px-4 py-3 font-semibold">{canComplete ? "После" : "Стало"}</th>
              </tr>
            </thead>
            <tbody>
              {act.items.map((item) => (
                <tr key={item.id} className="border-t border-red-950/10">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-950">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{item.productCategory ?? "Без категории"} • {item.productUnit}</p>
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
            <Link href={`/dashboard/inventory/incoming/${act.id}`} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
              Редактировать
            </Link>
          ) : null}
          <IncomingActDeleteButton actId={act.id} isCompleted={!canComplete} />
          {canComplete ? (
            <form action={completeFormAction}>
              <input type="hidden" name="actId" value={act.id} />
              <button type="submit" disabled={isCompletePending} className="inline-flex h-9 items-center rounded-full bg-red-800 px-4 text-xs font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:shadow-none">
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
    <div className="rounded-[16px] border border-red-950/10 bg-white/80 px-4 py-3 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
