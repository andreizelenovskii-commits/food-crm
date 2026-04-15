import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { requireSessionUser } from "@/modules/auth/auth.session";
import { EmployeeAdjustmentForm } from "@/modules/employees/components/employee-adjustment-form";
import { EmployeeEditForm } from "@/modules/employees/components/employee-edit-form";
import { EMPLOYEE_ADJUSTMENT_LABELS } from "@/modules/employees/employees.types";
import { fetchEmployeeById } from "@/modules/employees/employees.service";

function formatMoney(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".00", "")} ₽`;
}

export default async function EmployeeProfilePage(props: {
  params?: Promise<{ employeeId: string }>;
}) {
  await requireSessionUser();
  const params = await props.params;
  const employeeId = Number(params?.employeeId);

  if (!params || !params.employeeId || !Number.isInteger(employeeId) || employeeId <= 0) {
    notFound();
  }

  const employee = await fetchEmployeeById(employeeId);

  if (!employee) {
    return (
      <PageShell
        title="Сотрудник не найден"
        description="Проверь ссылку или вернись к списку сотрудников."
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Сотрудник не найден.
        </div>
        <Link href="/dashboard/employees" className="text-sm text-zinc-700 underline">
          Вернуться к списку сотрудников
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Профиль: ${employee.name}`}
      description="Здесь будут ключевые показатели сотрудника за месяц и текущие данные."
      action={
        <Link
          href="/dashboard/employees"
          className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
        >
          Назад к списку
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_0.7fr]">
        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Контакты</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-700">
            <p>
              <span className="font-medium text-zinc-900">Роль:</span> {employee.role}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Телефон:</span> {employee.phone || "Не указан"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Мессенджер:</span>{" "}
              {employee.messenger ? (
                <a
                  href={employee.messenger}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {employee.messenger}
                </a>
              ) : (
                "Не указан"
              )}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Дата создания:</span> {new Date(employee.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium text-zinc-900">График работы:</span> {employee.schedule ? JSON.stringify(employee.schedule, null, 2) : "Не указан"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Часы работы за месяц:</span> {employee.monthlyHours ?? "Не рассчитано"}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Показатели</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Авансы за месяц</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.advancesCents)}</p>
            </div>
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Штрафы</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.finesCents)}</p>
            </div>
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Долги</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.debtCents)}</p>
            </div>
            <div className="rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">КПД</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{employee.kpd}%</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
        <h2 className="text-xl font-semibold text-zinc-950">Рабочие результаты</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500">Заказы за месяц</p>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">{employee.ordersThisMonth}</p>
          </div>
          <div className="rounded-3xl bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500">Зарплата на сегодня</p>
            <p className="mt-3 text-2xl font-semibold text-zinc-950">{formatMoney(employee.salaryTodayCents)}</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-zinc-600">
          Показатели пока считаются как заглушка. Логику расчёта можно подключить позже.
        </p>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">Записи по сотруднику</h2>
          <div className="mt-5 space-y-4">
            {employee.adjustments.length === 0 ? (
              <p className="text-sm text-zinc-600">Пока нет записей по авансам, штрафам и долгам.</p>
            ) : (
              <div className="space-y-4">
                {employee.adjustments.map((adjustment) => (
                  <div key={adjustment.id} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-zinc-950">{EMPLOYEE_ADJUSTMENT_LABELS[adjustment.type]}</p>
                      <p className="text-sm text-zinc-700">{new Date(adjustment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">{adjustment.comment || "Без комментария"}</p>
                    <p className="mt-3 text-xl font-semibold text-zinc-950">{formatMoney(adjustment.amountCents)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div>
          <EmployeeEditForm employee={employee} />
          <div className="mt-6">
            <EmployeeAdjustmentForm employeeId={employee.id} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
