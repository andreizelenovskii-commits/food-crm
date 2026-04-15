import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { EmployeeForm } from "@/modules/employees/components/employee-form";
import { fetchEmployees } from "@/modules/employees/employees.service";
import { requireSessionUser } from "@/modules/auth/auth.session";

export default async function EmployeesPage() {
  await requireSessionUser();
  const employees = await fetchEmployees();

  return (
    <PageShell
      title="Сотрудники"
      description="Добавляй новых сотрудников и переходи на их профиль для детальной статистики."
    >
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Список сотрудников</h2>
            <div className="mt-6 space-y-4">
              {employees.length === 0 ? (
                <p className="text-sm text-zinc-600">Пока нет ни одного сотрудника.</p>
              ) : (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <Link
                        href={`/dashboard/employees/${employee.id}`}
                        className="text-base font-semibold text-zinc-950 hover:text-zinc-700"
                      >
                        {employee.name}
                      </Link>
                      <p className="text-sm text-zinc-600">{employee.messenger || "Мессенджер не указан"}</p>
                      <p className="mt-1 text-sm text-zinc-500">{employee.role}</p>
                      <p className="text-sm text-zinc-500">{employee.phone || "Телефон не указан"}</p>
                      <p className="text-sm text-zinc-500">Часы: {employee.monthlyHours ?? "Не рассчитано"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <EmployeeForm />
        </div>
      </div>
    </PageShell>
  );
}
