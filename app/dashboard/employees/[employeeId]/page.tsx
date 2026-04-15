import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { requireSessionUser } from "@/modules/auth/auth.session";
import { EmployeeProfileClient } from "@/modules/employees/components/employee-profile-client";
import { fetchEmployeeById } from "@/modules/employees/employees.service";

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
      <EmployeeProfileClient employee={employee} />
    </PageShell>
  );
}
