import { PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { logoutAction } from "@/modules/auth/auth.actions";
import { requireSessionUser } from "@/modules/auth/auth.session";
import { getDashboardMetrics } from "@/modules/dashboard/dashboard.service";

export default async function DashboardPage() {
  const user = await requireSessionUser();
  const metrics = getDashboardMetrics();

  return (
    <PageShell
      title="Dashboard CRM"
      description={`Ты вошёл как ${user.email}. Экран получает только готовые данные и не хранит внутри себя auth-логику.`}
      action={
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
          >
            Выйти
          </button>
        </form>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </section>
    </PageShell>
  );
}
