import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { fetchLoyaltySnapshot } from "@/modules/loyalty/loyalty.api";
import {
  LOYALTY_LEVEL_LABELS,
  LOYALTY_LEVEL_STYLES,
} from "@/modules/loyalty/loyalty.types";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function LoyaltyPage() {
  const user = await requirePermission("view_dashboard");
  const snapshot = await fetchLoyaltySnapshot();

  return (
    <PageShell
      title="Система лояльности"
      description="Здесь живут уровни лояльности клиентов: бронзовый, серебряный, золотой и платиновый."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="space-y-5">
        <section className="rounded-[14px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f1_100%)] p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Лояльность
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Четыре уровня клиентов
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
            Базовая логика уже готова: уровень клиента определяется по общей сумме покупок, а дальше на этой основе можно строить скидки, бонусы и персональные предложения.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Участников</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{snapshot.participantsCount}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Активных уровней</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{snapshot.activeLevelsCount}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Клиентов с заказами</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{snapshot.monthlyParticipantsCount}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          {snapshot.byLevel.map((entry) => (
            <article
              key={entry.level}
              className={`rounded-[14px] border bg-gradient-to-br p-5 shadow-sm shadow-zinc-950/5 ${LOYALTY_LEVEL_STYLES[entry.level]}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                {LOYALTY_LEVEL_LABELS[entry.level]}
              </p>
              <p className="mt-3 text-2xl font-semibold">{entry.config.discountPercent}%</p>
              <p className="mt-2 text-sm opacity-80">
                от {formatMoney(entry.config.minSpentCents)} общего оборота клиента
              </p>
              <p className="mt-4 text-sm font-medium">
                Участников: {entry.clients.length}
              </p>
              <div className="mt-4 space-y-2 text-sm leading-6 opacity-80">
                {entry.config.perks.map((perk) => (
                  <p key={perk}>{perk}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Клиенты по уровням</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Здесь видно, кто уже дошёл до более высокого уровня и сколько осталось до следующего.
          </p>

          <div className="mt-4 space-y-5">
            {snapshot.byLevel.map((entry) => (
              <section key={entry.level} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-zinc-950">
                    {LOYALTY_LEVEL_LABELS[entry.level]}
                  </h3>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
                    {entry.clients.length} клиентов
                  </span>
                </div>

                {entry.clients.length === 0 ? (
                  <div className="rounded-[14px] border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500">
                    Пока никто не попал в этот уровень.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entry.clients.map((client) => (
                      <article
                        key={client.id}
                        className="rounded-[14px] border border-zinc-200 bg-zinc-50 p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-zinc-950">{client.name}</h4>
                            <div className="grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                              <p>Телефон: {client.phone}</p>
                              <p>Заказов: {client.ordersCount}</p>
                              <p>Оборот: {formatMoney(client.totalSpentCents)}</p>
                              <p>
                                Следующий уровень:{" "}
                                {client.nextLevel ? LOYALTY_LEVEL_LABELS[client.nextLevel] : "Максимальный"}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm shadow-zinc-950/5">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                              До следующего уровня
                            </p>
                            <p className="mt-2 text-lg font-semibold text-zinc-950">
                              {client.nextLevel ? formatMoney(client.amountToNextLevelCents) : "Достигнут"}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
