import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { EmployeeAccessForm } from "@/modules/employees/components/employee-access-form";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { EmployeeProfileClient } from "@/modules/employees/components/employee-profile-client";
import { fetchEmployeeById } from "@/modules/employees/employees.api";

export default async function EmployeeProfilePage(props: {
  params?: Promise<{ employeeId: string }>;
}) {
  const user = await requirePermission("view_employees");
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
        backHref="/dashboard/employees"
        action={
          <SessionUserActions
            user={user}
            extraAction={
              <Link
                href="/dashboard/employees"
                className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
              >
                Назад к списку
              </Link>
            }
          />
        }
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
      backHref="/dashboard/employees"
      action={
        <SessionUserActions
          user={user}
          extraAction={
            <Link
              href="/dashboard/employees"
              className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
            >
              Назад к списку
            </Link>
          }
        />
      }
    >
      <div className="space-y-6">
        {hasPermission(user, "manage_employees") ? (
          <EmployeeAccessForm employee={employee} />
        ) : null}
        <EmployeeProfileClient employee={employee} />
      </div>
    </PageShell>
  );
}
