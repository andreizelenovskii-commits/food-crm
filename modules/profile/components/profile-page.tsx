import { PageShell } from "@/components/ui/page-shell";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import type { SessionUser } from "@/modules/auth/auth.types";
import { EMPLOYEE_ADJUSTMENT_LABELS } from "@/modules/employees/employees.types";
import type { EmployeeProfile } from "@/modules/employees/employees.types";
import { buildProfileViewModel } from "@/modules/profile/profile.page-model";

type ProfilePageProps = {
  user: SessionUser;
  employee: EmployeeProfile;
  month: string;
};

function InfoCard({
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
      <p className="mt-1.5 text-lg font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{hint}</p>
    </article>
  );
}

export function EmployeeSelfProfilePage({ user, employee, month }: ProfilePageProps) {
  const profile = buildProfileViewModel(employee, month);

  return (
    <PageShell title="Мой профиль" action={<SessionUserActions user={user} />}>
      <div className="space-y-4">
        <section className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
          <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.65fr)_1fr] xl:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
                Employee profile
              </p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">
                {employee.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Все данные подтягиваются из карточки сотрудника.
              </p>
            </div>
            <form action="/dashboard/profile" className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-end">
              <label className="block">
                <span className="text-xs font-medium text-zinc-500">Месяц</span>
                <input
                  type="month"
                  name="month"
                  defaultValue={profile.selectedMonth}
                  className="mt-1 h-10 rounded-[12px] border border-red-950/10 bg-white px-3 text-sm font-medium text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
                />
              </label>
              <button
                type="submit"
                className="h-10 rounded-[12px] bg-red-800 px-4 text-sm font-medium text-white transition hover:bg-red-900"
              >
                Показать
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {profile.employeeInfo.map((item) => (
            <InfoCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
                  Payroll
                </p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                  Зарплата и удержания
                </h2>
              </div>
              <p className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium capitalize text-red-800">
                {profile.monthLabel}
              </p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {profile.payroll.map((item) => (
                <InfoCard key={item.label} {...item} />
              ))}
            </div>
          </article>

          <article className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
              Performance
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">
              Результаты месяца
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {profile.performance.map((item) => (
                <InfoCard key={item.label} {...item} />
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
                История начислений
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                Авансы, штрафы и долги за месяц
              </h2>
            </div>
            <p className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium capitalize text-red-800">
              {profile.monthLabel}
            </p>
          </div>

          <div className="mt-3 divide-y divide-red-950/10">
            {profile.monthAdjustments.length ? (
              profile.monthAdjustments.map((adjustment) => (
                <div
                  key={adjustment.id}
                  className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">
                      {EMPLOYEE_ADJUSTMENT_LABELS[adjustment.type]} · {adjustment.date}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                      {adjustment.comment}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-950">
                    {adjustment.amount}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-3 text-sm text-zinc-500">
                За выбранный месяц записей нет.
              </p>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
