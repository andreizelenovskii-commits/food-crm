import { PageShell } from "@/components/ui/page-shell";
import { requireSessionUser } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { fetchEmployeeById, fetchEmployees } from "@/modules/employees/employees.api";
import { EmployeeSelfProfilePage } from "@/modules/profile/components/profile-page";
import { normalizeProfileMonth } from "@/modules/profile/profile.page-model";

export default async function ProfilePage(props: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const user = await requireSessionUser();
  const searchParams = await props.searchParams;
  const month = normalizeProfileMonth(searchParams?.month);
  const employees = await fetchEmployees();
  const currentEmployee = employees.find(
    (employee) => employee.email?.toLowerCase() === user.email.toLowerCase(),
  );

  if (!currentEmployee) {
    return (
      <PageShell title="Мой профиль" action={<SessionUserActions user={user} />}>
        <section className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
            Профиль сотрудника
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            Карточка сотрудника не найдена
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Для этого аккаунта нужен сотрудник с таким же email в разделе
            “Сотрудники”. После связки здесь появятся имя и фамилия, график,
            зарплата, авансы, штрафы, долги и показатели за месяц.
          </p>
          <div className="mt-4 rounded-[14px] border border-red-950/10 bg-[#fffafa] p-3.5 text-sm text-zinc-700">
            Текущий email: <span className="font-semibold text-zinc-950">{user.email}</span>
          </div>
        </section>
      </PageShell>
    );
  }

  const employee = await fetchEmployeeById(currentEmployee.id);

  if (!employee) {
    return (
      <PageShell title="Мой профиль" action={<SessionUserActions user={user} />}>
        <section className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
          <h2 className="text-xl font-semibold text-zinc-950">
            Не удалось загрузить карточку сотрудника
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Сотрудник найден в списке, но подробный профиль недоступен.
          </p>
        </section>
      </PageShell>
    );
  }

  return <EmployeeSelfProfilePage user={user} employee={employee} month={month} />;
}
