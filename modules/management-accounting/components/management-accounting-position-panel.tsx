import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
import type { ManagementAccountingPositionMetric } from "@/modules/management-accounting/management-accounting.types";

const MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

function formatMoney(cents: number) {
  return MONEY_FORMATTER.format(cents / 100);
}

export function ManagementAccountingPositionPanel({
  title,
  eyebrow,
  items,
  emptyText,
}: {
  title: string;
  eyebrow: string;
  items: ManagementAccountingPositionMetric[];
  emptyText: string;
}) {
  return (
    <GlassPanel className="p-4">
      <div>
        <p className="foodlike-kicker">{eyebrow}</p>
        <h2 className="mt-1 foodlike-title-sm">{title}</h2>
      </div>
      <div className="mt-3 divide-y divide-red-950/10">
        {items.length ? (
          items.map((item) => (
            <div key={`${title}-${item.label}`} className="py-3">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-zinc-900">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.hint}</p>
                </div>
                <p className={["text-sm font-semibold", item.marginCents < 0 ? "text-red-800" : "text-emerald-700"].join(" ")}>
                  {formatMoney(item.marginCents)}
                </p>
              </div>
              <div className="mt-2 grid gap-2 text-xs font-semibold text-zinc-600 sm:grid-cols-2 2xl:grid-cols-4">
                <span>Кол-во {item.quantity}</span>
                <span>Выручка {formatMoney(item.revenueCents)}</span>
                <span>Себес {formatMoney(item.costCents)}</span>
                <span>Фудкост {item.foodCostPercent}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="foodlike-empty mt-4 px-4 py-4">{emptyText}</p>
        )}
      </div>
    </GlassPanel>
  );
}
