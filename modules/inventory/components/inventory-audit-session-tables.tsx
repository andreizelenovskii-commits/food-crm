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
          <tr key={item.id} className="border-t border-red-950/10 align-top">
            <td className="px-3 py-3">
              <input type="hidden" name="itemId" value={item.id} />
              <div>
                <p className="font-semibold text-zinc-950">{item.productName}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{item.productCategory ?? "Без категории"}</p>
              </div>
            </td>
            <td className="px-3 py-3 font-medium text-zinc-600">{item.productUnit}</td>
            <td className="px-3 py-3 font-medium text-zinc-950">
              {formatInventoryQuantity(item.currentStockQuantity)}
            </td>
            <td className="px-3 py-3">
              <input
                name="actualQuantity"
                type="text"
                inputMode="decimal"
                value={draftValue}
                onChange={(event) => onActualDraftChange(item.id, event.target.value)}
                placeholder={item.actualQuantity === null ? formatInventoryQuantity(0) : formatInventoryQuantity(item.actualQuantity)}
                className="h-9 w-24 rounded-[14px] border border-red-950/10 bg-white/85 px-3 text-xs font-medium text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
              />
            </td>
            <td className={`px-3 py-3 font-medium ${varianceTone}`}>
              {formatQuantityVariance(varianceQuantity, item.productUnit)}
            </td>
            <td className={`px-3 py-3 font-medium ${varianceTone}`}>
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
        const varianceTone = getVarianceTone(item.varianceQuantity);

        return (
          <tr key={item.id} className="border-t border-red-950/10 align-top">
            <td className="px-3 py-3">
              <div>
                <p className="font-semibold text-zinc-950">{item.productName}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{item.productCategory ?? "Без категории"}</p>
              </div>
            </td>
            <td className="px-3 py-3 font-medium text-zinc-600">{item.productUnit}</td>
            <td className="px-3 py-3 font-medium text-zinc-950">
              {formatInventoryQuantity(item.stockQuantity)}
            </td>
            <td className="px-3 py-3 font-medium text-zinc-950">
              {item.actualQuantity === null ? "—" : formatInventoryQuantity(item.actualQuantity)}
            </td>
            <td className={`px-3 py-3 font-medium ${varianceTone}`}>
              {formatQuantityVariance(item.varianceQuantity, item.productUnit)}
            </td>
            <td className={`px-3 py-3 font-medium ${varianceTone}`}>
              {formatMoneyVariance(item.varianceValueCents)}
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
    <div className="overflow-hidden rounded-[18px] border border-red-950/10 bg-white/76 shadow-sm shadow-red-950/5">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-red-50/45">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">
              {headers.map((header) => (
                <th key={header} className="px-3 py-2.5 font-semibold">{header}</th>
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
