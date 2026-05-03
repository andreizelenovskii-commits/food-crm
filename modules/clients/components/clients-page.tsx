import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { BestClientCard } from "@/modules/clients/components/best-client-card";
import { ClientCreatePanel } from "@/modules/clients/components/client-create-panel";
import { ClientLiveSearch } from "@/modules/clients/components/client-live-search";
import {
  formatDaysUntilBirthday,
  type ClientsPageProps,
} from "@/modules/clients/clients.page-model";
import type { ClientLoyaltyLevel } from "@/modules/clients/clients.types";
import { LOYALTY_LEVEL_LABELS, LOYALTY_LEVELS } from "@/modules/loyalty/loyalty.types";

function buildClientsHref(rawQuery: string, loyaltyLevel: ClientLoyaltyLevel | null) {
  const params = new URLSearchParams();

  if (rawQuery) {
    params.set("q", rawQuery);
  }

  if (loyaltyLevel) {
    params.set("loyalty", loyaltyLevel);
  }

  const query = params.toString();

  return query ? `/dashboard/clients?${query}` : "/dashboard/clients";
}

export function ClientsPage({
  user,
  canManageClients,
  viewModel,
}: ClientsPageProps) {
  const {
    rawQuery,
    activeLoyaltyLevel,
    bestClients,
    peopleClientsTotal,
    loyaltyCounts,
    searchCandidates,
    upcomingBirthdays,
  } = viewModel;

  return (
    <PageShell
      title="Клиенты"
      description="Здесь можно вести базу клиентов, быстро видеть их контакты и понимать, у кого уже есть заказы."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.12)] sm:p-5">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-white/80 blur-3xl" />

        <div className="relative space-y-4">
          <section className="rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                  Поиск
                </p>
                <h2 className="mt-1 text-base font-semibold text-zinc-950">
                  По имени или номеру телефона
                </h2>
              </div>

              {rawQuery ? (
                <Link
                  href="/dashboard/clients"
                  className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                >
                  Сбросить
                </Link>
              ) : null}
            </div>

            <ClientLiveSearch
              initialQuery={rawQuery}
              activeLoyaltyLevel={activeLoyaltyLevel}
              clients={searchCandidates}
              action={canManageClients ? <ClientCreatePanel /> : null}
            />

            <div className="mt-4 rounded-[18px] border border-red-950/10 bg-white/55 p-2">
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
                Категория лояльности
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildClientsHref(rawQuery, null)}
                  className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition ${
                    activeLoyaltyLevel
                      ? "border border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
                      : "bg-red-800 text-white shadow-sm shadow-red-950/20"
                  }`}
                >
                  Все · {peopleClientsTotal}
                </Link>
                {LOYALTY_LEVELS.map((level) => {
                  const isActive = activeLoyaltyLevel === level;

                  return (
                    <Link
                      key={level}
                      href={buildClientsHref(rawQuery, level)}
                      className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition ${
                        isActive
                          ? "bg-red-800 text-white shadow-sm shadow-red-950/20"
                          : "border border-red-100 bg-white/80 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"
                      }`}
                    >
                      {LOYALTY_LEVEL_LABELS[level]} · {loyaltyCounts[level]}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[22px] border border-white/70 bg-white/70 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                  Скоро день рождения
                </p>
                <h2 className="mt-1 text-base font-semibold text-zinc-950">
                  Клиенты ближайшей недели
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {upcomingBirthdays.length === 0 ? (
                <p className="text-xs leading-5 text-zinc-600">
                  В ближайшую неделю дней рождения у клиентов не найдено.
                </p>
              ) : (
                upcomingBirthdays.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-[18px] border border-red-950/10 bg-white/78 px-4 py-3 shadow-sm shadow-red-950/5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-950">{client.name}</p>
                        <p className="text-xs text-zinc-500">
                          {client.formattedDate} · {client.phone}
                        </p>
                      </div>
                      <span className="inline-flex h-8 items-center rounded-full bg-red-800 px-3 text-xs font-semibold text-white">
                        {formatDaysUntilBirthday(client.daysUntilBirthday)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur-2xl sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                  Лучшие клиенты
                </p>
                <h2 className="mt-1 text-base font-semibold text-zinc-950">Топ покупок за всё время</h2>
              </div>
              <span className="inline-flex h-8 items-center rounded-full bg-red-50 px-3 text-xs font-semibold text-red-800">
                {bestClients.length}
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {bestClients.length === 0 ? (
                <p className="text-xs leading-5 text-zinc-600">
                  {rawQuery ? "Поиск не нашёл клиентов." : "Пока нет клиентов с покупками."}
                </p>
              ) : (
                bestClients.map((client) => <BestClientCard key={client.id} client={client} />)
              )}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
