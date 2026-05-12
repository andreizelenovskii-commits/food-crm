import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import { LoyaltyLevelCards } from "@/modules/loyalty/components/loyalty-level-cards";
import { fetchLoyaltySnapshot } from "@/modules/loyalty/loyalty.api";

export default async function LoyaltyPage() {
  const user = await requirePermission("view_dashboard");
  const snapshot = await fetchLoyaltySnapshot();

  return (
    <PageShell
      title="Система лояльности"
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff2f2_46%,#f8eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.12)] sm:p-5">
        <div className="relative space-y-4">
          <section className="grid gap-4 xl:grid-cols-[minmax(300px,0.92fr)_minmax(420px,1.08fr)]">
            <GlassPanel className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-800/75">
                FoodLike loyalty
              </p>
              <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
                Единая система уровней для постоянных клиентов
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
                Уровень считается по общей сумме покупок. В карточке клиента и заказе сразу видно,
                какую скидку получает гость и сколько осталось до следующего статуса.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link
                  href="/dashboard/clients"
                  className="inline-flex h-10 items-center rounded-full bg-red-800 px-4 text-sm font-medium text-white shadow-sm shadow-red-950/20 transition hover:bg-red-900"
                >
                  Открыть клиентов
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="inline-flex h-10 items-center rounded-full border border-red-100 bg-white/90 px-4 text-sm font-medium text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                >
                  К заказам
                </Link>
              </div>
            </GlassPanel>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <KpiTile
                label="Участников"
                value={snapshot.participantsCount}
                hint="Клиенты в программе"
              />
              <KpiTile
                label="Активных уровней"
                value={snapshot.activeLevelsCount}
                hint="Статусы с клиентами"
              />
              <KpiTile
                label="С заказами"
                value={snapshot.monthlyParticipantsCount}
                hint="Клиенты с покупками"
              />
            </div>
          </section>

          <LoyaltyLevelCards levels={snapshot.byLevel} />
        </div>
      </div>
    </PageShell>
  );
}
