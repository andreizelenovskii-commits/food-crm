import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import type { SessionUser } from "@/modules/auth/auth.types";
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
  return (
    <article className="rounded-[14px] border border-red-950/10 bg-white/90 p-3.5 shadow-sm shadow-red-950/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{hint}</p>
    </article>
  );
}

function InsightList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string; hint: string }>;
}) {
  return (
    <section className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
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
          <p className="py-3 text-sm text-zinc-500">Данных пока нет.</p>
        )}
      </div>
    </section>
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
      action={<SessionUserActions user={user} />}
    >
      <div className="space-y-4">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analytics.kpis.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
                  Воронка
                </p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                  Заказы и деньги
                </h2>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {analytics.orderFlow.map((item) => (
                <MetricCard key={item.label} {...item} />
              ))}
            </div>
          </article>

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

        <section className="rounded-[16px] border border-red-950/10 bg-[#fffafa] p-4 shadow-sm shadow-red-950/5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-800/75">
            Следующий уровень точности
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Для точной маржинальности по блюдам нужна детализация состава заказа:
            позиции заказа, количество каждой позиции и расчет себестоимости по
            технологическим картам. Страница уже готова под эти данные и сейчас
            считает аналитику по доступным заказам, складу, прайсам, закупкам и
            списаниям.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
