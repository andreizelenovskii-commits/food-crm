import { PageShell } from "@/components/ui/page-shell";
import { requireSessionUser } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { USER_ROLE_LABELS } from "@/modules/auth/auth.types";

export default async function ProfilePage() {
  const user = await requireSessionUser();

  return (
    <PageShell
      title="Мой профиль"
      description="Здесь собраны данные текущей авторизованной учётной записи."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5 md:col-span-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
            Аккаунт
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
            {user.email}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Ты вошёл в систему и можешь использовать защищённые разделы CRM.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-zinc-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                ID пользователя
              </dt>
              <dd className="mt-2 text-lg font-semibold text-zinc-950">
                {user.id}
              </dd>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Роль
              </dt>
              <dd className="mt-2 text-lg font-semibold text-zinc-950">
                {USER_ROLE_LABELS[user.role]}
              </dd>
            </div>
          </dl>
        </article>

        <aside className="rounded-3xl border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm shadow-zinc-950/10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/60">
            Статус
          </p>
          <p className="mt-3 text-2xl font-semibold">Сессия активна</p>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Если нужно завершить работу, кнопка выхода остаётся справа сверху.
          </p>
        </aside>
      </section>
    </PageShell>
  );
}
