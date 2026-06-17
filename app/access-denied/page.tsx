import { StaffShell } from "@/modules/auth/components/staff-shell";
import { requireSessionUser } from "@/modules/auth/auth.session";
import { getUserHomePath } from "@/modules/auth/auth.redirect";

export default async function AccessDeniedPage() {
  const user = await requireSessionUser();

  return (
    <StaffShell
      user={user}
      title="Нет доступа"
      subtitle="У этой роли нет доступа к выбранному разделу"
      navItems={[]}
      activeHref="/access-denied"
    >
      <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-8 text-sm text-red-800">
        <p className="font-semibold">Раздел закрыт для вашей роли.</p>
        <a
          href={getUserHomePath(user)}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-red-800 px-4 text-sm font-semibold text-white transition hover:bg-red-900"
        >
          Перейти на рабочий экран
        </a>
      </div>
    </StaffShell>
  );
}
