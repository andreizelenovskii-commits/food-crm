import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { ClientCreatePanel } from "@/modules/clients/components/client-create-panel";
import { ClientDeleteButton } from "@/modules/clients/components/client-delete-button";
import { fetchClients } from "@/modules/clients/clients.service";

export default async function ClientsPage(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const user = await requirePermission("view_clients");
  const searchParams = await props.searchParams;
  const clients = await fetchClients();
  const rawQuery = searchParams?.q?.trim() ?? "";
  const normalizedQuery = rawQuery.toLowerCase();
  const queryPhone = rawQuery.replace(/\D/g, "");

  const getUpcomingBirthdayMeta = (value: string | null | undefined) => {
    if (!value) {
      return null;
    }

    const birthDate = new Date(value);

    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }

    const today = new Date();
    const currentYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate(),
    );

    const nextBirthday =
      currentYearBirthday >= new Date(today.getFullYear(), today.getMonth(), today.getDate())
        ? currentYearBirthday
        : new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilBirthday = Math.round(
      (nextBirthday.getTime() - todayStart.getTime()) / msPerDay,
    );

    if (daysUntilBirthday < 0 || daysUntilBirthday > 7) {
      return null;
    }

    return {
      daysUntilBirthday,
      formattedDate: new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
      }).format(nextBirthday),
    };
  };

  const formatDaysUntilBirthday = (daysUntilBirthday: number) => {
    if (daysUntilBirthday === 0) {
      return "сегодня";
    }

    if (daysUntilBirthday === 1) {
      return "завтра";
    }

    const lastTwoDigits = daysUntilBirthday % 100;
    const lastDigit = daysUntilBirthday % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `через ${daysUntilBirthday} дней`;
    }

    if (lastDigit === 1) {
      return `через ${daysUntilBirthday} день`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return `через ${daysUntilBirthday} дня`;
    }

    return `через ${daysUntilBirthday} дней`;
  };

  const formatDate = (value: string | null | undefined) =>
    value
      ? new Intl.DateTimeFormat("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(value))
      : "Не указана";

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const upcomingBirthdays = clients
    .filter((client) => client.type === "CLIENT")
    .map((client) => {
      const birthdayMeta = getUpcomingBirthdayMeta(client.birthDate);

      if (!birthdayMeta) {
        return null;
      }

      return {
        ...client,
        ...birthdayMeta,
      };
    })
    .filter((client): client is NonNullable<typeof client> => Boolean(client))
    .sort((left, right) => left.daysUntilBirthday - right.daysUntilBirthday);

  const filteredClients = clients.filter((client) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchablePhone = client.phone.replace(/\D/g, "");

    return (
      client.name.toLowerCase().includes(normalizedQuery) ||
      (queryPhone.length > 0 && searchablePhone.includes(queryPhone))
    );
  });

  if (queryPhone.length > 0) {
    const exactPhoneMatch = clients.find(
      (client) => client.phone.replace(/\D/g, "") === queryPhone,
    );

    if (exactPhoneMatch) {
      redirect(`/dashboard/clients/${exactPhoneMatch.id}`);
    }
  }

  const peopleClients = filteredClients.filter((client) => client.type === "CLIENT");
  const organizations = filteredClients.filter((client) => client.type === "ORGANIZATION");

  return (
    <PageShell
      title="Клиенты"
      description="Здесь можно вести базу клиентов, быстро видеть их контакты и понимать, у кого уже есть заказы."
      backHref="/dashboard"
      action={<SessionUserActions user={user} />}
    >
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Поиск
                </p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                  По имени или номеру телефона
                </h2>
              </div>

              {rawQuery ? (
                <Link
                  href="/dashboard/clients"
                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-950"
                >
                  Сбросить
                </Link>
              ) : null}
            </div>

            <form action="/dashboard/clients" className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                name="q"
                type="search"
                defaultValue={rawQuery}
                placeholder="Например: Иван Петров или 79001234567"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
              />
              <button
                type="submit"
                className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Найти
              </button>
            </form>

            {rawQuery ? (
              <p className="mt-3 text-sm text-zinc-500">
                По запросу <span className="font-medium text-zinc-900">{rawQuery}</span> найдено:{" "}
                {peopleClients.length + organizations.length}
              </p>
            ) : null}
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f8f3e9_100%)] p-6 shadow-sm shadow-zinc-950/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Скоро день рождения
                </p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                  Клиенты ближайшей недели
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {upcomingBirthdays.length === 0 ? (
                <p className="text-sm text-zinc-600">
                  В ближайшую неделю дней рождения у клиентов не найдено.
                </p>
              ) : (
                upcomingBirthdays.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-950">{client.name}</p>
                        <p className="text-sm text-zinc-500">
                          {client.formattedDate} · {client.phone}
                        </p>
                      </div>
                      <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
                        {formatDaysUntilBirthday(client.daysUntilBirthday)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Список клиентов</h2>
            <div className="mt-6 space-y-4">
              {peopleClients.length === 0 ? (
                <p className="text-sm text-zinc-600">
                  {rawQuery ? "Поиск не нашёл клиентов." : "Пока нет ни одного клиента."}
                </p>
              ) : (
                <div className="space-y-4">
                  {peopleClients.map((client) => (
                    <div
                      key={client.id}
                      className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-zinc-950">
                            <Link href={`/dashboard/clients/${client.id}`} className="hover:text-zinc-700">
                              {client.name}
                            </Link>
                          </p>
                          <p className="text-sm text-zinc-500">
                            Телефон: {client.phone}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Дата рождения: {formatDate(client.birthDate)}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Email: {client.email || "Не указан"}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Адрес: {client.address || "Не указан"}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Заказов: {client.ordersCount}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Сумма заказов: {formatMoney(client.totalSpentCents)}
                          </p>
                          {client.notes ? (
                            <p className="mt-2 text-sm leading-6 text-zinc-600">
                              {client.notes}
                            </p>
                          ) : null}
                        </div>

                        <div className="relative z-10 flex shrink-0 gap-2">
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                          >
                            Профиль
                          </Link>
                          {hasPermission(user, "manage_clients") ? (
                            <>
                              <Link
                                href={`/dashboard/clients/${client.id}/edit`}
                                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                              >
                                Редактировать
                              </Link>
                              <ClientDeleteButton
                                clientId={client.id}
                                clientName={client.name}
                                disabled={client.ordersCount > 0}
                              />
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
            <h2 className="text-xl font-semibold text-zinc-950">Список организаций</h2>
            <div className="mt-6 space-y-4">
              {organizations.length === 0 ? (
                <p className="text-sm text-zinc-600">
                  {rawQuery ? "Поиск не нашёл организаций." : "Пока нет ни одной организации."}
                </p>
              ) : (
                <div className="space-y-4">
                  {organizations.map((client) => (
                    <div
                      key={client.id}
                      className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-zinc-950">
                            <Link href={`/dashboard/clients/${client.id}`} className="hover:text-zinc-700">
                              {client.name}
                            </Link>
                          </p>
                          <p className="text-sm text-zinc-500">
                            Телефон: {client.phone}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Email: {client.email || "Не указан"}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Адрес: {client.address || "Не указан"}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Заказов: {client.ordersCount}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Сумма заказов: {formatMoney(client.totalSpentCents)}
                          </p>
                          {client.notes ? (
                            <p className="mt-2 text-sm leading-6 text-zinc-600">
                              {client.notes}
                            </p>
                          ) : null}
                        </div>

                        <div className="relative z-10 flex shrink-0 gap-2">
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                          >
                            Профиль
                          </Link>
                          {hasPermission(user, "manage_clients") ? (
                            <>
                              <Link
                                href={`/dashboard/clients/${client.id}/edit`}
                                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                              >
                                Редактировать
                              </Link>
                              <ClientDeleteButton
                                clientId={client.id}
                                clientName={client.name}
                                disabled={client.ordersCount > 0}
                              />
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {hasPermission(user, "manage_clients") ? (
          <div className="space-y-6">
            <ClientCreatePanel />
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
