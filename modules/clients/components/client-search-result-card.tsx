import Link from "next/link";
import { formatClientMoney } from "@/modules/clients/clients.page-model";
import type { Client } from "@/modules/clients/clients.types";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";

export function ClientSearchResultCard({ client }: { client: Client }) {
  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="flex flex-col gap-2 rounded-[16px] border border-red-950/10 bg-white/80 px-3 py-2.5 shadow-sm shadow-red-950/5 transition hover:border-red-200 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-zinc-950">{client.name}</p>
          {client.loyaltyLevel ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-800 ring-1 ring-red-100">
              {LOYALTY_LEVEL_LABELS[client.loyaltyLevel]}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs font-medium text-zinc-500">{client.phone}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs">
        <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-zinc-700 ring-1 ring-red-950/10">
          {client.ordersCount} заказов
        </span>
        <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-800 ring-1 ring-red-100">
          {formatClientMoney(client.totalSpentCents)}
        </span>
      </div>
    </Link>
  );
}
