import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";

export default async function ReviewsPage() {
  const user = await requirePermission("view_dashboard");

  return (
    <PageShell
      title="Отзывы"
      description="Здесь будет единый раздел отзывов клиентов: оценки, комментарии и история обработки."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f3efe7_100%)] p-6 shadow-sm shadow-zinc-950/5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Обратная связь
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Оценки и комментарии клиентов
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Здесь будем собирать отзывы, среднюю оценку, жалобы и благодарности по заказам.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Отзывов</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Средняя оценка</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">-</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
              <p className="text-sm font-medium text-zinc-500">Новых сегодня</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">0</p>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Что будет здесь</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
            <p>Лента отзывов по заказам и клиентам.</p>
            <p>Фильтр по оценке, дате и статусу обработки.</p>
            <p>Отдельная отметка для жалоб и нерешённых кейсов.</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
