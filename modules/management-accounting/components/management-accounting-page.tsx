import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import { ManagementAccountingDayActions } from "@/modules/management-accounting/components/management-accounting-day-actions";
import { ManagementAccountingManualPanel } from "@/modules/management-accounting/components/management-accounting-manual-panel";
import { ManagementAccountingPositionPanel } from "@/modules/management-accounting/components/management-accounting-position-panel";
import type {
  ManagementAccountingMetric,
  ManagementAccountingStaffMember,
  ManagementAccountingViewModel,
} from "@/modules/management-accounting/management-accounting.types";

type ManagementAccountingPageProps = {
  accounting: ManagementAccountingViewModel;
};

function toDateInputValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

const MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

function formatMoney(cents: number) {
  return MONEY_FORMATTER.format(cents / 100);
}

function formatHours(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value);
}

function ToneTile(metric: ManagementAccountingMetric) {
  const toneClass =
    metric.tone === "danger"
      ? "border-red-200 bg-red-50/80"
      : metric.tone === "warning"
        ? "border-amber-200 bg-amber-50/80"
        : "border-emerald-100 bg-emerald-50/70";

  return (
    <article className={`rounded-[18px] border p-4 shadow-sm shadow-red-950/5 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
        {metric.label}
      </p>
      <p className="mt-2 text-2xl font-semibold leading-none text-zinc-950">{metric.value ?? ""}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-600">{metric.hint}</p>
    </article>
  );
}

function ShiftPanel({ accounting }: { accounting: ManagementAccountingViewModel }) {
  const shift = accounting.shift;

  return (
    <GlassPanel className="p-4">
      <p className="foodlike-kicker">Автоматически</p>
      <h2 className="mt-1 foodlike-title-sm">Смена и продажи</h2>
      {shift ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <KpiTile label={`Смена ${shift.number}`} value={shift.status === "CLOSED" ? "Закрыта" : "Открыта"} hint={shift.closedAt ? "Смена закрыта и зафиксирована" : "Смена еще может меняться"} />
          <KpiTile label="Выручка смены" value={formatMoney(shift.revenueCents)} hint={`${shift.checksCount} чеков · ${shift.totalOrdersCount} заказов`} />
          <KpiTile label="Отмены" value={shift.cancelledOrdersCount} hint="Заказы в статусе отмены" />
          <KpiTile label="Дата учета" value={accounting.range.date} hint="Данные привязаны к бизнес-дню смены" />
        </div>
      ) : (
        <p className="foodlike-empty mt-4 px-4 py-4">
          Смена за этот день не найдена. Продажи считаются по заказам за календарный день.
        </p>
      )}
    </GlassPanel>
  );
}

function StaffPanel({ members }: { members: ManagementAccountingStaffMember[] }) {
  return (
    <GlassPanel className="p-4">
      <p className="foodlike-kicker">Автоматически</p>
      <h2 className="mt-1 foodlike-title-sm">Персонал за день</h2>
      <div className="mt-3 divide-y divide-red-950/10">
        {members.length ? (
          members.map((member) => (
            <div key={member.employeeId} className="grid gap-2 py-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">{member.name}</p>
                <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                  {member.role} · {formatHours(member.scheduledHours)} ч · {member.ordersCount} заказов
                </p>
              </div>
              <div className="grid gap-1 text-sm font-semibold text-zinc-950 sm:grid-cols-4 sm:text-right">
                <span>Аванс {formatMoney(member.advancesCents)}</span>
                <span>Штраф {formatMoney(member.finesCents)}</span>
                <span>Долг {formatMoney(member.debtCents)}</span>
                <span>Итого {formatMoney(member.payoutCents)}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="foodlike-empty mt-4 px-4 py-4">
            По графику, заказам и выплатам за этот день сотрудников пока нет.
          </p>
        )}
      </div>
    </GlassPanel>
  );
}

function MetricRows({
  title,
  eyebrow,
  items,
}: {
  title: string;
  eyebrow: string;
  items: ManagementAccountingMetric[];
}) {
  return (
    <GlassPanel className="p-4">
      <div>
        <p className="foodlike-kicker">{eyebrow}</p>
        <h2 className="mt-1 foodlike-title-sm">{title}</h2>
      </div>
      <div className="mt-3 divide-y divide-red-950/10">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900">{item.label}</p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.hint}</p>
            </div>
            <p
              className={[
                "text-sm font-semibold text-zinc-950",
                item.tone === "danger" ? "text-red-800" : "",
                item.tone === "warning" ? "text-amber-700" : "",
                item.tone === "good" ? "text-emerald-700" : "",
              ].join(" ")}
            >
              {item.value ?? ""}
            </p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function DatePanel({ accounting }: { accounting: ManagementAccountingViewModel }) {
  const day = accounting.accountingDay;
  const statusLabel =
    day.status === "OPEN"
      ? "Учет открыт"
      : day.status === "CLOSED"
        ? "Учет закрыт"
        : "Учет не начат";
  const statusHint =
    day.status === "OPEN"
      ? "Можно вносить ручные расходы и доходы."
      : day.status === "CLOSED"
        ? "День зафиксирован, статистика ниже показана из сохраненного закрытия."
        : "Начните учет, чтобы добавить ручные статьи за смену.";

  return (
    <GlassPanel className="relative z-30 overflow-visible p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="foodlike-kicker">День учета</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{accounting.range.label}</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Ежедневная сводка продаж, себестоимости, расходов и прибыли.
          </p>
        </div>
        <form action="/dashboard/management-accounting" className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={toDateInputValue(accounting.range.date)}
            className="h-10 rounded-full border border-red-100 bg-white/90 px-4 text-sm font-semibold text-zinc-900 shadow-sm shadow-red-950/5 outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-800/15"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full border border-red-800 bg-red-800 px-4 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900"
          >
            Показать
          </button>
        </form>
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-red-950/10 bg-white/72 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-950">{statusLabel}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{statusHint}</p>
        </div>
        <ManagementAccountingDayActions day={day} date={accounting.range.date} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PanelLink href={accounting.previousHref}>Предыдущий день</PanelLink>
        <PanelLink href={accounting.nextHref}>Следующий день</PanelLink>
      </div>
    </GlassPanel>
  );
}

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/80 px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
    >
      {children}
    </Link>
  );
}

export function ManagementAccountingPage({ accounting }: ManagementAccountingPageProps) {
  const positionEyebrow =
    accounting.accountingDay.status === "CLOSED" ? "Снимок закрытия" : "Предпросмотр";

  return (
    <PageShell
      title="Управленческий учет"
      description="Ежедневная сводка для расчета фудкоста, маржинальности и чистой прибыли."
    >
      <div className="foodlike-frame space-y-4 p-4 sm:p-5">
        <DatePanel accounting={accounting} />

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {accounting.kpis.map((item) =>
            item.tone ? (
              <ToneTile key={item.label} {...item} />
            ) : (
              <KpiTile key={item.label} label={item.label} value={item.value ?? ""} hint={item.hint} />
            ),
          )}
        </section>

        <section className="grid items-start gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid content-start gap-4">
            <ShiftPanel accounting={accounting} />
            <MetricRows title="Продажи за день" eyebrow="Продажи" items={accounting.sales} />
            <MetricRows title="Доходы" eyebrow="Поступления" items={accounting.income} />
            <MetricRows title="Фудкост" eyebrow="Себестоимость" items={accounting.foodCost} />
            <ManagementAccountingPositionPanel
              title="Топ позиции"
              eyebrow={positionEyebrow}
              items={accounting.topPositions}
              emptyText="Продаж по позициям за этот день пока нет."
            />
          </div>
          <div className="grid content-start gap-4">
            <ManagementAccountingManualPanel accounting={accounting} />
            <StaffPanel members={accounting.staff.members} />
            <MetricRows title="Расходы" eyebrow="Затраты" items={accounting.expenses} />
            <MetricRows title="Прибыль и маржа" eyebrow="Итог" items={accounting.profit} />
            <ManagementAccountingPositionPanel
              title="Плохие позиции"
              eyebrow={positionEyebrow}
              items={accounting.badPositions}
              emptyText="Позиции с отрицательной или слабой маржой за этот день пока не найдены."
            />
            <MetricRows title="Что нужно завести дальше" eyebrow="Основа" items={accounting.dataGaps} />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
