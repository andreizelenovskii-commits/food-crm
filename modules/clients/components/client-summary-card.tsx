import Link from "next/link";
import { ClientDeleteButton } from "@/modules/clients/components/client-delete-button";
import {
  formatClientAverageCheck,
  formatClientDate,
  formatClientMoney,
} from "@/modules/clients/clients.page-model";
import type { Client } from "@/modules/clients/clients.types";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";

function formatClientAddresses(address: string | null) {
  const addresses = String(address ?? "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return addresses.length > 0 ? addresses : ["Не указан"];
}

export function ClientSummaryCard({
  client,
  canManageClients,
}: {
  client: Client;
  canManageClients: boolean;
}) {
  const addresses = formatClientAddresses(client.address);

  return (
    <article className="rounded-[18px] border border-red-950/10 bg-white/78 p-3.5 shadow-sm shadow-red-950/5 transition hover:-translate-y-0.5 hover:bg-white">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
          <div className="min-w-0">
            <Link
              href={`/dashboard/clients/${client.id}`}
              className="block truncate text-sm font-semibold leading-5 text-zinc-950 hover:text-red-800"
            >
              {client.name}
            </Link>
            {client.loyaltyLevel ? (
              <span className="mt-1 inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-800 ring-1 ring-red-100">
                {LOYALTY_LEVEL_LABELS[client.loyaltyLevel]}
              </span>
            ) : null}
          </div>

          <div className="relative z-10 flex shrink-0 flex-wrap gap-2 min-[900px]:justify-end">
            <Link
              href={`/dashboard/clients/${client.id}`}
              className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            >
              Профиль
            </Link>
            {canManageClients ? (
              <ClientDeleteButton
                clientId={client.id}
                clientName={client.name}
                disabled={client.ordersCount > 0}
              />
            ) : null}
          </div>
        </div>

        <div className="grid gap-2.5 min-[720px]:grid-cols-2">
          <div className="rounded-[16px] border border-red-950/10 bg-white/70 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
              Контакты
            </p>
            <div className="mt-2 space-y-1.5">
              <InfoLine label="Телефон" value={client.phone} strong />
              {client.type === "CLIENT" ? (
                <InfoLine label="Дата рождения" value={formatClientDate(client.birthDate)} />
              ) : null}
              {client.email ? <InfoLine label="Email" value={client.email} /> : null}
            </div>
          </div>

          <div className="rounded-[16px] border border-red-950/10 bg-white/70 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
              Заказы
            </p>
            <div className="mt-2 space-y-1.5">
              <InfoLine label="Количество" value={String(client.ordersCount)} />
              <InfoLine label="Сумма" value={formatClientMoney(client.totalSpentCents)} strong />
              <InfoLine
                label="Средний чек"
                value={formatClientAverageCheck(client.totalSpentCents, client.ordersCount)}
              />
            </div>
          </div>

          <div className="rounded-[16px] border border-red-950/10 bg-white/70 px-3 py-2.5 min-[720px]:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
              Адреса
            </p>
            <div className="mt-2 space-y-1 text-xs leading-5 text-zinc-700">
              {addresses.map((address) => (
                <p key={address}>{address}</p>
              ))}
            </div>
          </div>

          {client.notes ? (
            <p className="rounded-[16px] bg-red-50/45 px-3 py-2 text-xs leading-5 text-zinc-600 ring-1 ring-red-950/10 min-[720px]:col-span-2">
              {client.notes}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function InfoLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <p className="flex min-w-0 items-baseline justify-between gap-3 text-xs leading-5">
      <span className="shrink-0 text-zinc-400">{label}</span>
      <span
        className={`min-w-0 truncate whitespace-nowrap text-right ${
          strong ? "font-semibold text-zinc-950" : "font-medium text-zinc-700"
        }`}
      >
        {value}
      </span>
    </p>
  );
}
