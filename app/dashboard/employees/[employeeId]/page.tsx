import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { requirePermission } from "@/modules/auth/auth.session";
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
        <div className="rounded-[18px] border border-red-200 bg-red-50 p-4 text-red-800 sm:p-5">
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
      backHref="/dashboard/employees"
      compact
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
      <div className="relative overflow-hidden rounded-[22px] border border-red-950/12 bg-[linear-gradient(165deg,#fffdfc_0%,#fde8e6_42%,#f3dedc_100%)] shadow-[0_20px_64px_rgba(127,29,29,0.14)]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-red-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-[12%] h-64 w-64 rounded-full bg-white/55 blur-3xl" />
        <div className="relative">
          <EmployeeProfileClient
            employee={employee}
          />
        </div>
      </div>
    </PageShell>
  );
}
