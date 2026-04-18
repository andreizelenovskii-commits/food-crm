import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";

export default async function LoyaltyPage() {
  const user = await requirePermission("view_dashboard");

  return (
    <PageShell
      title="Система лояльности"
      description="Здесь будет управление бонусами, скидками, уровнями клиентов и специальными предложениями."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#edf4ea_100%)] p-6 shadow-sm shadow-zinc-950/5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Лояльность
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Баллы, скидки и статусы
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Здесь будем хранить бонусные счета клиентов, скидочные уровни и персональные предложения.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Участников</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Активных уровней</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Начислений сегодня</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Что будет здесь</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
            <p>Настройка бонусных правил и скидок.</p>
            <p>Уровни клиента: базовый, серебро, золото и другие.</p>
            <p>История начислений, списаний и персональных акций.</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
