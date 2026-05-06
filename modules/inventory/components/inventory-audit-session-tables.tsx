import {
  formatMoney,
  parseQuantity,
} from "@/modules/inventory/components/inventory-panel-utils";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type { InventorySessionItemSummary } from "@/modules/inventory/inventory.types";

export function ActiveSessionItemsTable({
  items,
  actualDrafts,
  onActualDraftChange,
}: {
  items: InventorySessionItemSummary[];
  actualDrafts: Record<number, string>;
  onActualDraftChange: (itemId: number, value: string) => void;
}) {
  return (
    <InventoryTable headers={["Товар", "Ед.", "Система", "Факт", "Разница", "В рублях"]}>
      {items.map((item) => {
        const draftValue = actualDrafts[item.id] ?? "";
        const actualQuantity = draftValue === "" ? item.actualQuantity : parseQuantity(draftValue);
        const varianceQuantity = actualQuantity === null ? null : actualQuantity - item.currentStockQuantity;
        const varianceValueCents = varianceQuantity === null ? null : varianceQuantity * item.priceCents;
        const varianceTone = getVarianceTone(varianceQuantity);

        return (
          <tr key={item.id} className="border-t border-red-950/10 align-middle transition hover:bg-red-50/25">
            <td className="px-4 py-3.5">
              <input type="hidden" name="itemId" value={item.id} />
              <p className="text-sm font-semibold tracking-[-0.01em] text-zinc-950">{item.productName}</p>
            </td>
            <td className="px-4 py-3.5 font-medium text-zinc-600">{item.productUnit}</td>
            <td className="px-4 py-3.5 font-semibold text-zinc-950">
              {formatInventoryQuantity(item.currentStockQuantity)}
            </td>
            <td className="px-4 py-3.5">
              <input
                name="actualQuantity"
                type="text"
                inputMode="decimal"
                value={draftValue}
                onChange={(event) => onActualDraftChange(item.id, event.target.value)}
                placeholder={item.actualQuantity === null ? formatInventoryQuantity(0) : formatInventoryQuantity(item.actualQuantity)}
                className="h-10 w-28 rounded-full border border-red-950/10 bg-white/90 px-4 text-center text-[13px] font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
              />
            </td>
            <td className={`px-4 py-3.5 font-semibold ${varianceTone}`}>
              {formatQuantityVariance(varianceQuantity, item.productUnit)}
            </td>
            <td className={`px-4 py-3.5 font-semibold ${varianceTone}`}>
              {formatMoneyVariance(varianceValueCents)}
            </td>
          </tr>
        );
      })}
    </InventoryTable>
  );
}

export function ClosedSessionItemsTable({ items }: { items: InventorySessionItemSummary[] }) {
  return (
    <InventoryTable headers={["Товар", "Ед.", "Старт", "Факт", "Разница", "В рублях"]}>
      {items.map((item) => {
        const varianceQuantity =
          item.actualQuantity === null ? null : item.actualQuantity - item.stockQuantity;
        const varianceValueCents =
          varianceQuantity === null ? null : varianceQuantity * item.priceCents;
        const varianceTone = getVarianceTone(varianceQuantity);

        return (
          <tr key={item.id} className="border-t border-red-950/10 align-middle transition hover:bg-red-50/25">
            <td className="px-4 py-3.5">
              <p className="text-sm font-semibold tracking-[-0.01em] text-zinc-950">{item.productName}</p>
            </td>
            <td className="px-4 py-3.5 font-medium text-zinc-600">{item.productUnit}</td>
            <td className="px-4 py-3.5 font-semibold text-zinc-950">
              {formatInventoryQuantity(item.stockQuantity)}
            </td>
            <td className="px-4 py-3.5 font-semibold text-zinc-950">
              {item.actualQuantity === null ? "—" : formatInventoryQuantity(item.actualQuantity)}
            </td>
            <td className={`px-4 py-3.5 font-semibold ${varianceTone}`}>
              {formatQuantityVariance(varianceQuantity, item.productUnit)}
            </td>
            <td className={`px-4 py-3.5 font-semibold ${varianceTone}`}>
              {formatMoneyVariance(varianceValueCents)}
            </td>
          </tr>
        );
      })}
    </InventoryTable>
  );
}

function InventoryTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/70 bg-white/78 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-red-50/55">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function getVarianceTone(value: number | null) {
  if (value === null) {
    return "text-zinc-400";
  }
  if (value > 0) {
    return "text-red-800";
  }
  if (value < 0) {
    return "text-red-700";
  }
  return "text-zinc-600";
}

function formatQuantityVariance(value: number | null, unit: string) {
  if (value === null) {
    return "—";
  }
  return `${value > 0 ? "+" : ""}${formatInventoryQuantity(value)} ${unit}`;
}

function formatMoneyVariance(value: number | null) {
  if (value === null) {
    return "—";
  }
  return `${value > 0 ? "+" : ""}${formatMoney(value)}`;
}
