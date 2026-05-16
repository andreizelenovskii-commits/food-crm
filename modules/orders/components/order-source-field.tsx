import { ORDER_SOURCE_LABELS } from "@/modules/orders/orders.types";

export function OrderSourceField() {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-700">Источник</span>
      <select
        name="source"
        defaultValue="PHONE"
        className="w-full rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-medium text-zinc-950 shadow-sm shadow-red-950/5 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
      >
        <option value="PHONE">{ORDER_SOURCE_LABELS.PHONE}</option>
        <option value="ADMIN">{ORDER_SOURCE_LABELS.ADMIN}</option>
      </select>
    </label>
  );
}
