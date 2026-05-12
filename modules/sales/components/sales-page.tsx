import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import type { SessionUser } from "@/modules/auth/auth.types";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import {
  buildSalesAnalyticsViewModel,
  type SalesAnalyticsInput,
} from "@/modules/sales/sales.page-model";

type SalesPageProps = SalesAnalyticsInput & {
  user: SessionUser;
};

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return <KpiTile label={label} value={value} hint={hint} />;
}

function InsightList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string; hint: string }>;
}) {
  return (
    <GlassPanel className="p-4">
      <h2 className="foodlike-title-sm">{title}</h2>
      <div className="mt-3 divide-y divide-red-950/10">
        {items.length ? (
          items.map((item) => (
            <div key={`${item.label}-${item.value}`} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">{item.label}</p>
                <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.hint}</p>
              </div>
              <p className="text-sm font-semibold text-zinc-950">{item.value}</p>
            </div>
          ))
        ) : (
          <p className="foodlike-empty mt-3 px-4 py-4">Данных пока нет.</p>
        )}
      </div>
    </GlassPanel>
  );
}

export function SalesPage({
  user,
  orders,
  catalogItems,
  products,
  incomingActs,
  writeoffActs,
}: SalesPageProps) {
  const analytics = buildSalesAnalyticsViewModel({
    orders,
    catalogItems,
    products,
    incomingActs,
    writeoffActs,
  });

  return (
    <PageShell
      title="Продажи"
      description="Аналитика выручки, заказов, прайсов и складского движения."
      action={<SessionUserActions user={user} />}
    >
      <div className="foodlike-frame space-y-4 p-4 sm:p-5">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analytics.kpis.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <GlassPanel className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="foodlike-kicker">
                  Воронка
                </p>
                <h2 className="mt-1 foodlike-title-sm">
                  Заказы и деньги
                </h2>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {analytics.orderFlow.map((item) => (
                <MetricCard key={item.label} {...item} />
              ))}
            </div>
          </GlassPanel>

          <InsightList title="Движение денег" items={analytics.moneyFlow} />
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          {analytics.categoryInsights.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <InsightList title="Продающиеся товары" items={analytics.topProducts} />
          <InsightList title="Непродающиеся товары" items={analytics.silentProducts} />
          <InsightList title="Аналитика прайсов" items={analytics.priceAnalytics} />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <InsightList title="Категории склада" items={analytics.inventoryCategories} />
          <InsightList title="Закупки по категориям" items={analytics.purchaseCategories} />
          <InsightList title="Списания по категориям" items={analytics.writeoffCategories} />
        </section>

        <GlassPanel className="p-4">
          <p className="foodlike-kicker">
            Следующий уровень точности
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Для точной маржинальности по блюдам нужна детализация состава заказа:
            позиции заказа, количество каждой позиции и расчет себестоимости по
            технологическим картам. Страница уже готова под эти данные и сейчас
            считает аналитику по доступным заказам, складу, прайсам, закупкам и
            списаниям.
          </p>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
