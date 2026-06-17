"use client";

import { useMemo, useState } from "react";
import type { Client } from "@/modules/clients/clients.types";

function normalizeSearch(value: string) {
  return value.trim().toLowerCase().replace(/\D/g, "");
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value))
    : "Не указана";
}

export function SimpleDispatcherClients({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");
  const filteredClients = useMemo(() => {
    const normalizedText = query.trim().toLowerCase();
    const normalizedPhone = normalizeSearch(query);

    return clients.filter((client) => {
      if (!normalizedText && !normalizedPhone) {
        return true;
      }

      const matchesName = normalizedText.length > 0 && client.name.toLowerCase().includes(normalizedText);
      const matchesPhone = normalizedPhone.length > 0 && client.phone.replace(/\D/g, "").includes(normalizedPhone);

      return matchesName || matchesPhone;
    });
  }, [clients, query]);

  return (
    <section className="space-y-4">
      <div className="rounded-[22px] border border-red-950/10 bg-white/86 p-4 shadow-sm shadow-red-950/5">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск клиента по имени или телефону"
          className="h-12 w-full rounded-full border border-red-950/10 bg-white px-4 text-base font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-4 focus:ring-red-800/10"
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-red-200 bg-white/70 px-4 py-14 text-center">
          <p className="text-lg font-semibold text-zinc-950">Клиентов пока нет</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client) => (
            <article key={client.id} className="rounded-[22px] border border-red-100 bg-white p-4 shadow-sm shadow-red-950/5">
              <p className="text-lg font-black text-zinc-950">{client.name}</p>
              <div className="mt-3 space-y-2 text-sm">
                <ClientFact label="Телефон" value={client.phone} />
                <ClientFact label="Адрес" value={client.address ?? "Не указан"} />
                <ClientFact label="Заказы" value={String(client.ordersCount)} />
                <ClientFact label="Клиент с" value={formatDate(client.createdAt)} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ClientFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-red-50 bg-red-50/40 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-700">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-zinc-700">{value}</p>
    </div>
  );
}
