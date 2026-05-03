import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PaginatedList } from "@/components/ui/paginated-list";
import { hasPermission } from "@/modules/auth/authz";
import { EmployeeDeleteButton } from "@/modules/employees/components/employee-delete-button";
import { EmployeeForm } from "@/modules/employees/components/employee-form";
import { fetchEmployees } from "@/modules/employees/employees.api";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";

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
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Список сотрудников</h2>
            <div className="mt-4 space-y-4">
              {employees.length === 0 ? (
                <p className="text-sm text-zinc-600">Пока нет ни одного сотрудника.</p>
              ) : (
                <PaginatedList itemLabel="сотрудников">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="group relative rounded-[14px] border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-white"
                    >
                      <Link
                        href={`/dashboard/employees/${employee.id}`}
                        aria-label={`Открыть профиль сотрудника ${employee.name}`}
                        className="absolute inset-0 rounded-[14px]"
                      />
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-zinc-950 transition group-hover:text-zinc-700">
                            {employee.name}
                          </p>
                          <p className="text-sm text-zinc-500">
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

        {hasPermission(user, "manage_employees") ? (
          <div className="space-y-5">
            <EmployeeForm />
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
