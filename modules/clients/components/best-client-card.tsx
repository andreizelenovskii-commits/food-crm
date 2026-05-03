import Link from "next/link";
import { formatClientMoney } from "@/modules/clients/clients.page-model";
import type { Client } from "@/modules/clients/clients.types";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";

export function BestClientCard({ client }: { client: Client }) {
  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="flex flex-col gap-3 rounded-[18px] border border-red-950/10 bg-white/78 px-4 py-3 shadow-sm shadow-red-950/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-950">{client.name}</p>
        <p className="mt-1 text-xs font-medium text-zinc-500">{client.phone}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {client.loyaltyLevel ? (
          <span className="inline-flex h-8 items-center rounded-full bg-red-50 px-3 text-xs font-semibold text-red-800 ring-1 ring-red-100">
            {LOYALTY_LEVEL_LABELS[client.loyaltyLevel]}
          </span>
        ) : null}
        <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-xs font-semibold text-zinc-800 ring-1 ring-red-950/10">
          {formatClientMoney(client.totalSpentCents)}
        </span>
      </div>
    </Link>
  );
}
