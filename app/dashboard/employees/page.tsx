import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PaginatedList } from "@/components/ui/paginated-list";
import { hasPermission } from "@/modules/auth/authz";
import { EmployeeDeleteButton } from "@/modules/employees/components/employee-delete-button";
import { EmployeeCreateDialogButton } from "@/modules/employees/components/employee-create-dialog";
import { fetchEmployees } from "@/modules/employees/employees.api";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { GlassPanel } from "@/modules/dashboard/components/dashboard-widgets";

export default async function EmployeesPage() {
  const user = await requirePermission("view_employees");
  const employees = await fetchEmployees();

  const getAgeLabel = (value: string | null | undefined) => {
    if (!value) {
      return null;
    }

    const birthDate = new Date(value);

    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    if (age < 0) {
      return null;
    }

    const lastTwoDigits = age % 100;
    const lastDigit = age % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${age} лет`;
    }

    if (lastDigit === 1) {
      return `${age} год`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${age} года`;
    }

    return `${age} лет`;
  };

  const formatDate = (value: string | null | undefined) =>
    value
      ? new Intl.DateTimeFormat("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(value))
      : "Не указана";

  return (
    <PageShell
      title="Сотрудники"
      description="Добавляй новых сотрудников и переходи на их профиль для детальной статистики."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff2f2_46%,#f8eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.12)] sm:p-5">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-white/80 blur-3xl" />

        <div className="relative grid gap-4">
          <GlassPanel className="foodlike-float-soft p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-800/75">
              FoodLike team
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
              Управление сотрудниками
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              Карточки сотрудников, контакты, доступ в систему, графики и
              финансовые корректировки в едином рабочем формате.
            </p>
            {hasPermission(user, "manage_employees") ? (
              <div className="mt-4">
                <EmployeeCreateDialogButton />
              </div>
            ) : null}
          </GlassPanel>
        </div>

        <div className="relative mt-4 grid gap-5">
          <section className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">Список сотрудников</h2>
            <div className="mt-4 space-y-4">
              {employees.length === 0 ? (
                <p className="rounded-[18px] border border-dashed border-red-950/14 bg-white/70 p-5 text-sm leading-6 text-zinc-500">
                  Пока нет ни одного сотрудника.
                </p>
              ) : (
                <PaginatedList itemLabel="сотрудников">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="group relative rounded-[18px] border border-red-950/10 bg-white/84 p-4 shadow-sm shadow-red-950/5 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-white"
                    >
                      <Link
                        href={`/dashboard/employees/${employee.id}`}
                        aria-label={`Открыть профиль сотрудника ${employee.name}`}
                        className="absolute inset-0 rounded-[18px]"
                      />
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-base font-semibold tracking-[-0.01em] text-zinc-950 transition group-hover:text-red-800">
                            {employee.name}
                          </p>
                          <p className="mt-0.5 text-sm text-zinc-500">
                            Дата рождения: {formatDate(employee.birthDate)}
                            {getAgeLabel(employee.birthDate)
                              ? ` · ${getAgeLabel(employee.birthDate)}`
                              : ""}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Телефон: {employee.phone || "Не указан"}
                          </p>
                        </div>

                        {hasPermission(user, "manage_employees") ? (
                          <EmployeeDeleteButton
                            employeeId={employee.id}
                            employeeName={employee.name}
                            disabled={employee.ordersCount > 0}
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </PaginatedList>
              )}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
