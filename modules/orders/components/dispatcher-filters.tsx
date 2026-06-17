"use client";

import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";
import { ORDER_SOURCE_LABELS, ORDER_STATUSES, type OrderSource, type OrderStatus } from "@/modules/orders/orders.types";
import { ORDER_STATUS_LABELS } from "@/modules/orders/orders.workflow";

export function DispatcherFilters({
  searchQuery,
  statusFilter,
  sourceFilter,
  onSearchQueryChange,
  onStatusFilterChange,
  onSourceFilterChange,
}: {
  searchQuery: string;
  statusFilter: OrderStatus | "all";
  sourceFilter: OrderSource | "all";
  onSearchQueryChange: (value: string) => void;
  onStatusFilterChange: (value: OrderStatus | "all") => void;
  onSourceFilterChange: (value: OrderSource | "all") => void;
}) {
  return (
    <GlassPanel className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
        placeholder="Поиск: номер, телефон, клиент"
        className="h-10 rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
      />
      <select
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value as OrderStatus | "all")}
        className="h-10 rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-semibold text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
      >
        <option value="all">Все статусы</option>
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
        ))}
      </select>
      <select
        value={sourceFilter}
        onChange={(event) => onSourceFilterChange(event.target.value as OrderSource | "all")}
        className="h-10 rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-semibold text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
      >
        <option value="all">Все источники</option>
        {Object.entries(ORDER_SOURCE_LABELS).map(([source, label]) => (
          <option key={source} value={source}>{label}</option>
        ))}
      </select>
    </GlassPanel>
  );
}
