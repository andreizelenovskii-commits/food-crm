"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  LOYALTY_LEVEL_LABELS,
  type LoyaltyClient,
  type LoyaltyLevel,
  type LoyaltySnapshot,
} from "@/modules/loyalty/loyalty.types";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getLevelTone(level: LoyaltyLevel) {
  switch (level) {
    case "BRONZE":
      return {
        shortLabel: "Старт",
        accent: "bg-amber-50 text-amber-900 ring-amber-200",
        progress: "bg-amber-500",
      };
    case "SILVER":
      return {
        shortLabel: "Рост",
        accent: "bg-slate-100 text-slate-700 ring-slate-200",
        progress: "bg-slate-500",
      };
    case "GOLD":
      return {
        shortLabel: "Топ",
        accent: "bg-yellow-100 text-yellow-900 ring-yellow-200",
        progress: "bg-yellow-500",
      };
    case "PLATINUM":
      return {
        shortLabel: "VIP",
        accent: "bg-cyan-50 text-cyan-900 ring-cyan-200",
        progress: "bg-cyan-500",
      };
  }
}

function getProgressPercent(client: LoyaltyClient) {
  if (!client.nextLevel) {
    return 100;
  }

  const spent = client.totalSpentCents;
  const remaining = client.amountToNextLevelCents;
  const target = spent + remaining;

  if (target <= 0) {
    return 0;
  }

  return Math.min(Math.round((spent / target) * 100), 100);
}

function sortClientsByNextLevel(clients: LoyaltyClient[]) {
  return [...clients].sort((first, second) => {
    if (!first.nextLevel && second.nextLevel) {
      return 1;
    }

    if (first.nextLevel && !second.nextLevel) {
      return -1;
    }

    if (first.amountToNextLevelCents !== second.amountToNextLevelCents) {
      return first.amountToNextLevelCents - second.amountToNextLevelCents;
    }

    return first.name.localeCompare(second.name, "ru");
  });
}

type LevelEntry = LoyaltySnapshot["byLevel"][number];

export function LoyaltyLevelCards({ levels }: { levels: LoyaltySnapshot["byLevel"] }) {
  const [selectedLevel, setSelectedLevel] = useState<LevelEntry | null>(null);

  return (
    <>
      <section className="grid gap-3 xl:grid-cols-4">
        {levels.map((entry) => {
          const tone = getLevelTone(entry.level);
          const sortedClients = sortClientsByNextLevel(entry.clients);
          const closestClient = sortedClients.find((client) => client.nextLevel);

          return (
            <button
              key={entry.level}
              type="button"
              onClick={() => setSelectedLevel(entry)}
              className="group rounded-[18px] border border-red-950/10 bg-white/78 p-4 text-left shadow-sm shadow-red-950/5 outline-none transition hover:-translate-y-1 hover:border-red-200 hover:bg-white focus-visible:ring-2 focus-visible:ring-red-800/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                    {tone.shortLabel}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                    {LOYALTY_LEVEL_LABELS[entry.level]}
                  </h3>
                </div>
                <span className={`inline-flex h-8 min-w-12 items-center justify-center rounded-full px-3 text-xs font-semibold ring-1 ${tone.accent}`}>
                  {entry.config.discountPercent}%
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-600">
                От {formatMoney(entry.config.minSpentCents)} общего оборота.
              </p>

              <div className="mt-4 rounded-[16px] border border-red-950/10 bg-white/70 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-zinc-500">Участников</p>
                  <p className="text-sm font-semibold text-zinc-950">{entry.clients.length}</p>
                </div>
              </div>

              {closestClient ? (
                <div className="mt-4 rounded-[16px] border border-red-950/10 bg-red-50/45 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
                    Скоро следующий уровень
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-950">
                    {closestClient.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                    Осталось {formatMoney(closestClient.amountToNextLevelCents)}
                  </p>
                </div>
              ) : null}

              <div className="mt-3 space-y-2">
                {entry.config.perks.map((perk) => (
                  <p key={perk} className="text-xs leading-5 text-zinc-500">
                    {perk}
                  </p>
                ))}
              </div>

              <span className="mt-4 inline-flex h-8 items-center rounded-full border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 transition group-hover:border-red-800 group-hover:bg-red-800 group-hover:text-white">
                Открыть клиентов
              </span>
            </button>
          );
        })}
      </section>

      {selectedLevel && typeof document !== "undefined"
        ? createPortal(
            <LoyaltyLevelDialog entry={selectedLevel} onClose={() => setSelectedLevel(null)} />,
            document.body,
          )
        : null}
    </>
  );
}

function LoyaltyLevelDialog({ entry, onClose }: {
  entry: LevelEntry;
  onClose: () => void;
}) {
  const tone = getLevelTone(entry.level);
  const sortedClients = sortClientsByNextLevel(entry.clients);

  return (
    <div className="fixed inset-0 z-80 overflow-y-auto bg-zinc-950/35 px-4 py-6 backdrop-blur-sm sm:py-8">
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
        aria-label="Закрыть клиентов уровня"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Клиенты уровня ${LOYALTY_LEVEL_LABELS[entry.level]}`}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5"
      >
        <div className="rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                {tone.shortLabel}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold leading-tight text-zinc-950">
                  {LOYALTY_LEVEL_LABELS[entry.level]}
                </h2>
                <span className={`inline-flex h-8 min-w-12 items-center justify-center rounded-full px-3 text-xs font-semibold ring-1 ${tone.accent}`}>
                  {entry.config.discountPercent}%
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                Клиенты отсортированы по близости к следующему уровню.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-full border border-red-100 bg-white/90 px-4 text-sm font-medium text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
            >
              Закрыть
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[16px] border border-red-950/10 bg-white/70 px-3 py-2.5">
              <p className="text-xs font-medium text-zinc-500">Участников</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">{entry.clients.length}</p>
            </div>
            <div className="rounded-[16px] border border-red-950/10 bg-white/70 px-3 py-2.5">
              <p className="text-xs font-medium text-zinc-500">Порог</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">
                {formatMoney(entry.config.minSpentCents)}
              </p>
            </div>
            <div className="rounded-[16px] border border-red-950/10 bg-white/70 px-3 py-2.5">
              <p className="text-xs font-medium text-zinc-500">Скидка</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">
                {entry.config.discountPercent}%
              </p>
            </div>
          </div>

          <div className="mt-4 max-h-[58vh] space-y-3 overflow-y-auto pr-1">
            {sortedClients.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-red-950/10 bg-white/58 px-4 py-6 text-sm text-zinc-500">
                Пока никто не попал в этот уровень.
              </div>
            ) : (
              sortedClients.map((client) => (
                <LoyaltyClientRow key={client.id} client={client} tone={tone} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function LoyaltyClientRow({ client, tone }: {
  client: LoyaltyClient;
  tone: ReturnType<typeof getLevelTone>;
}) {
  const progressPercent = getProgressPercent(client);

  return (
    <article className="rounded-[18px] border border-red-950/10 bg-white/78 p-4 shadow-sm shadow-red-950/5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.36fr)] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/clients/${client.id}`}
              className="truncate text-base font-semibold text-zinc-950 hover:text-red-800"
            >
              {client.name}
            </Link>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-800">
              {client.ordersCount} заказов
            </span>
          </div>
          <div className="mt-2 grid gap-2 text-sm text-zinc-600 sm:grid-cols-3">
            <p className="truncate">Телефон: {client.phone}</p>
            <p>Оборот: {formatMoney(client.totalSpentCents)}</p>
            <p>Следующий: {client.nextLevel ? LOYALTY_LEVEL_LABELS[client.nextLevel] : "Максимальный"}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-red-50">
            <div
              className={`h-full rounded-full ${tone.progress}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-[16px] border border-red-950/10 bg-white/70 px-4 py-3 lg:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
            До следующего уровня
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-950">{client.nextLevel ? formatMoney(client.amountToNextLevelCents) : "Достигнут"}</p>
        </div>
      </div>
    </article>
  );
}
