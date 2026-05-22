import type { SelectedOrderItem } from "@/modules/orders/components/order-create.types";
import { formatMoney } from "@/modules/orders/components/order-create-utils";

export function OrderTotals({
  isInternal,
  deliveryFeeCents,
  discountPercent,
  discountCents,
  totalCents,
  payableTotalCents,
  selectedOrderItems,
}: {
  isInternal: boolean;
  deliveryFeeCents: number;
  discountPercent: number;
  discountCents: number;
  totalCents: number;
  payableTotalCents: number;
  selectedOrderItems: SelectedOrderItem[];
}) {
  return (
    <div className="rounded-[18px] border border-red-100 bg-white/85 p-4 shadow-sm shadow-red-950/5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-600">Выбрано позиций</span>
        <span className="text-sm font-semibold text-zinc-950">{selectedOrderItems.length}</span>
      </div>
      <div className="mt-3 space-y-2">
        {selectedOrderItems.length === 0 ? (
          <p className="text-sm text-zinc-500">Добавь позиции слева.</p>
        ) : (
          selectedOrderItems.map((entry) => (
            <div key={entry.item.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900">
                  {entry.item.name}
                  {entry.variant ? ` · ${entry.variant.label}` : ""}
                </p>
                <p className="text-zinc-500">
                  {entry.quantity} × {formatMoney(entry.variant?.priceCents ?? entry.item.priceCents)}
                </p>
              </div>
              <span className="shrink-0 font-medium text-zinc-900">{formatMoney(entry.totalCents)}</span>
            </div>
          ))
        )}
      </div>
      <TotalRow label="Подытог" value={formatMoney(totalCents)} withBorder />
      {!isInternal ? <TotalRow label="Доставка" value={formatMoney(deliveryFeeCents)} /> : null}
      {!isInternal && discountPercent > 0 ? (
        <TotalRow label={`Скидка по лояльности (${discountPercent}%)`} value={`-${formatMoney(discountCents)}`} tone="text-red-800" />
      ) : null}
      <TotalRow label="Итого" value={formatMoney(payableTotalCents)} withBorder size="lg" />
    </div>
  );
}

function TotalRow({
  label,
  value,
  tone = "text-zinc-950",
  withBorder = false,
  size = "base",
}: {
  label: string;
  value: string;
  tone?: string;
  withBorder?: boolean;
  size?: "base" | "lg";
}) {
  return (
    <div className={`${withBorder ? "mt-4 border-t border-red-100 pt-4" : "mt-3"} flex items-center justify-between gap-3`}>
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      <span className={`${size === "lg" ? "text-lg" : "text-base"} font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
