"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClientSearchResultCard } from "@/modules/clients/components/client-search-result-card";
import type { Client, ClientLoyaltyLevel } from "@/modules/clients/clients.types";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function matchesClientSearch(client: Client, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return false;
  }

  const queryPhone = normalizePhone(normalizedQuery);
  const nameTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const normalizedName = client.name.toLowerCase();
  const searchablePhone = normalizePhone(client.phone);
  const matchesName = nameTokens.every((token) => normalizedName.includes(token));
  const matchesPhone = queryPhone.length > 0 && searchablePhone.includes(queryPhone);

  return matchesName || matchesPhone;
}

export function ClientLiveSearch({
  initialQuery,
  activeLoyaltyLevel,
  clients,
  action,
}: {
  initialQuery: string;
  activeLoyaltyLevel: ClientLoyaltyLevel | null;
  clients: Client[];
  action?: React.ReactNode;
}) {
  const [query, setQuery] = useState(initialQuery);
  const trimmedQuery = query.trim();
  const results = useMemo(
    () => clients.filter((client) => matchesClientSearch(client, query)).slice(0, 5),
    [clients, query],
  );

  return (
    <>
      <div className="mt-4 flex flex-col gap-2 lg:flex-row">
        <form action="/dashboard/clients" className="flex min-w-0 flex-1 gap-2">
          {activeLoyaltyLevel ? (
            <input type="hidden" name="loyalty" value={activeLoyaltyLevel} />
          ) : null}
          <input
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: Иван Петров или 6741"
            className="h-9 min-w-0 flex-1 rounded-full border border-red-950/10 bg-white/85 px-4 text-xs font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
          />
          <button
            type="submit"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white hover:shadow-sm hover:shadow-red-950/20"
          >
            Найти
          </button>
        </form>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {trimmedQuery ? (
        <div className="mt-3 rounded-[18px] border border-red-950/10 bg-white/55 p-2">
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
              Найденные клиенты
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-red-800">{results.length}</span>
              {initialQuery ? (
                <Link
                  href="/dashboard/clients"
                  className="text-xs font-semibold text-red-800 transition hover:text-red-950"
                >
                  Сбросить
                </Link>
              ) : null}
            </div>
          </div>
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((client) => (
                <ClientSearchResultCard key={client.id} client={client} />
              ))}
            </div>
          ) : (
            <p className="px-2 py-1 text-xs leading-5 text-zinc-500">
              Клиент не найден. Можно искать по имени, фамилии или последним 4 цифрам телефона.
            </p>
          )}
        </div>
      ) : null}
    </>
  );
}
