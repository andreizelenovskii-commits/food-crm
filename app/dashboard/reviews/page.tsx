import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";

export default async function ReviewsPage() {
  const user = await requirePermission("view_dashboard");

  return (
    <PageShell
      title="Отзывы"
      description="Здесь будет единый раздел отзывов клиентов: оценки, комментарии и история обработки."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="foodlike-frame grid gap-4 p-4 sm:p-5 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel className="p-4 sm:p-5">
          <p className="foodlike-kicker">
            Обратная связь
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Оценки и комментарии клиентов
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Здесь будем собирать отзывы, среднюю оценку, жалобы и благодарности по заказам.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <KpiTile label="Отзывов" value={0} hint="Всего в системе" />
            <KpiTile label="Средняя оценка" value="-" hint="После подключения отзывов" />
            <KpiTile label="Новых сегодня" value={0} hint="За текущий день" />
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-5">
          <h2 className="foodlike-title-sm">Что будет здесь</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
            <p>Лента отзывов по заказам и клиентам.</p>
            <p>Фильтр по оценке, дате и статусу обработки.</p>
            <p>Отдельная отметка для жалоб и нерешённых кейсов.</p>
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
