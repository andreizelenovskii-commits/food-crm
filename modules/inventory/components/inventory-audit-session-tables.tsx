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
    <InventoryTable headers={["Товар", "Ед.", "Программный остаток", "Фактический остаток", "Разница", "Разница в рублях"]}>
      {items.map((item) => {
        const draftValue = actualDrafts[item.id] ?? "";
        const actualQuantity = draftValue === "" ? item.actualQuantity : parseQuantity(draftValue);
        const varianceQuantity = actualQuantity === null ? null : actualQuantity - item.currentStockQuantity;
        const varianceValueCents = varianceQuantity === null ? null : varianceQuantity * item.priceCents;
        const varianceTone = getVarianceTone(varianceQuantity);

        return (
          <tr key={item.id} className="border-t border-zinc-200 align-top">
            <td className="px-4 py-4">
              <input type="hidden" name="itemId" value={item.id} />
              <div className="space-y-1">
                <p className="font-semibold text-zinc-950">{item.productName}</p>
                <p className="text-zinc-500">{item.productCategory ?? "Без категории"}</p>
              </div>
            </td>
            <td className="px-4 py-4 font-medium text-zinc-600">{item.productUnit}</td>
            <td className="px-4 py-4 font-medium text-zinc-950">
              {formatInventoryQuantity(item.currentStockQuantity)}
            </td>
            <td className="px-4 py-4">
              <input
                name="actualQuantity"
                type="text"
                inputMode="decimal"
                value={draftValue}
                onChange={(event) => onActualDraftChange(item.id, event.target.value)}
                placeholder={item.actualQuantity === null ? formatInventoryQuantity(0) : formatInventoryQuantity(item.actualQuantity)}
                className="w-28 rounded-xl border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
              />
            </td>
            <td className={`px-4 py-4 font-medium ${varianceTone}`}>
              {formatQuantityVariance(varianceQuantity, item.productUnit)}
            </td>
            <td className={`px-4 py-4 font-medium ${varianceTone}`}>
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
    <InventoryTable headers={["Товар", "Ед.", "Остаток на старте", "Факт при закрытии", "Разница", "Разница в рублях"]}>
      {items.map((item) => {
        const varianceTone = getVarianceTone(item.varianceQuantity);

        return (
          <tr key={item.id} className="border-t border-zinc-200 align-top">
            <td className="px-4 py-4">
              <div className="space-y-1">
                <p className="font-semibold text-zinc-950">{item.productName}</p>
                <p className="text-zinc-500">{item.productCategory ?? "Без категории"}</p>
              </div>
            </td>
            <td className="px-4 py-4 font-medium text-zinc-600">{item.productUnit}</td>
            <td className="px-4 py-4 font-medium text-zinc-950">
              {formatInventoryQuantity(item.stockQuantity)}
            </td>
            <td className="px-4 py-4 font-medium text-zinc-950">
              {item.actualQuantity === null ? "—" : formatInventoryQuantity(item.actualQuantity)}
            </td>
            <td className={`px-4 py-4 font-medium ${varianceTone}`}>
              {formatQuantityVariance(item.varianceQuantity, item.productUnit)}
            </td>
            <td className={`px-4 py-4 font-medium ${varianceTone}`}>
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
    <div className="overflow-hidden rounded-[14px] border border-zinc-200 bg-white shadow-sm shadow-zinc-950/5">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr className="text-left text-zinc-500">
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">{header}</th>
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
