"use client";

import { PageShell } from "@/components/ui/page-shell";
import { useEmployeeSession } from "@/modules/auth/components/employee-session-provider";
import { GlassPanel, KpiTile } from "@/modules/dashboard/components/dashboard-widgets";
import { EMPLOYEE_ADJUSTMENT_LABELS } from "@/modules/employees/employees.types";
import type { EmployeeProfile } from "@/modules/employees/employees.types";
import { ChangePasswordCard } from "@/modules/profile/components/change-password-card";
import { buildProfileViewModel } from "@/modules/profile/profile.page-model";
import { formatRuMobileLoginDigits } from "@/shared/phone";

type ProfilePageProps = {
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
    <KpiTile label={label} value={value} hint={hint} />
  );
}

export function EmployeeSelfProfilePage({ employee, month }: ProfilePageProps) {
  const { user } = useEmployeeSession();
  const profile = buildProfileViewModel(employee, month);

  return (
    <PageShell
      title="Мой профиль"
      description="Личные данные, зарплата, результаты месяца и доступ к CRM."
    >
      <div className="foodlike-frame space-y-4 p-4 sm:p-5">
        <GlassPanel className="p-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.65fr)_1fr] xl:items-end">
            <div>
              <p className="foodlike-kicker">
                Профиль сотрудника
              </p>
              <h2 className="mt-1 foodlike-title-sm">
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
                  className="foodlike-field mt-1"
                />
              </label>
              <button
                type="submit"
                className="foodlike-button-primary"
              >
                Показать
              </button>
            </form>
          </div>
        </GlassPanel>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <GlassPanel className="p-4">
            <p className="foodlike-kicker">
              Вход в CRM
            </p>
            <h2 className="mt-2 foodlike-title-sm">Телефон для входа</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Номер, который ты вводишь на странице входа. Изменить его может только руководитель с правом
              управления сотрудниками — в карточке сотрудника в разделе «Сотрудники».
            </p>
            <p className="foodlike-card mt-3 px-4 py-3 text-sm font-semibold text-zinc-950">
              {formatRuMobileLoginDigits(user?.phone ?? "")}
            </p>
          </GlassPanel>

          <ChangePasswordCard />
        </div>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {profile.employeeInfo.map((item) => (
            <InfoCard key={item.label} {...item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <GlassPanel className="p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="foodlike-kicker">
                  Начисления
                </p>
                <h2 className="mt-1 foodlike-title-sm">
                  Зарплата и удержания
                </h2>
              </div>
              <p className="foodlike-pill capitalize">
                {profile.monthLabel}
              </p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {profile.payroll.map((item) => (
                <InfoCard key={item.label} {...item} />
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-4">
            <p className="foodlike-kicker">
              Результаты
            </p>
            <h2 className="mt-1 foodlike-title-sm">
              Результаты месяца
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {profile.performance.map((item) => (
                <InfoCard key={item.label} {...item} />
              ))}
            </div>
          </GlassPanel>
        </section>

        <GlassPanel className="p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="foodlike-kicker">
                История начислений
              </p>
              <h2 className="mt-1 foodlike-title-sm">
                Авансы, штрафы и долги за месяц
              </h2>
            </div>
            <p className="foodlike-pill capitalize">
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
              <p className="foodlike-empty mt-3 px-4 py-4">
                За выбранный месяц записей нет.
              </p>
            )}
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
