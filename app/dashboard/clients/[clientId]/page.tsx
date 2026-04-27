import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { fetchClientById } from "@/modules/clients/clients.api";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";

export default async function ClientProfilePage(props: {
  params?: Promise<{ clientId: string }>;
}) {
  const user = await requirePermission("view_clients");
  const params = await props.params;
  const clientId = Number(params?.clientId);

  if (!params || !params.clientId || !Number.isInteger(clientId) || clientId <= 0) {
    notFound();
  }

  const client = await fetchClientById(clientId);

  if (!client) {
    notFound();
  }

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  return (
    <PageShell
      title={client.type === "ORGANIZATION" ? "Профиль организации" : "Профиль клиента"}
      description={`Здесь собраны контактные данные и рабочая информация по записи ${client.name}.`}
      backHref="/dashboard/clients"
      action={<SessionUserActions user={user} />}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                {client.type === "ORGANIZATION" ? "Организация" : "Клиент"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950">{client.name}</h2>
              {client.loyaltyLevel ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
                    {LOYALTY_LEVEL_LABELS[client.loyaltyLevel]}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {client.loyaltyNextLevel
                      ? `До ${LOYALTY_LEVEL_LABELS[client.loyaltyNextLevel]} осталось ${formatMoney(client.loyaltyAmountToNextLevelCents)}`
                      : "Максимальный уровень уже достигнут"}
                  </span>
                </div>
              ) : null}
            </div>
            {hasPermission(user, "manage_clients") ? (
              <Link
                href={`/dashboard/clients/${client.id}/edit`}
                className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
              >
                Редактировать
              </Link>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Телефон
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-950">{client.phone}</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Email
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-950">
                {client.email || "Не указан"}
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Дата рождения
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-950">
                {client.birthDate
                  ? new Intl.DateTimeFormat("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(client.birthDate))
                  : "Не указана"}
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Уровень лояльности
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-950">
                {client.loyaltyLevel ? LOYALTY_LEVEL_LABELS[client.loyaltyLevel] : "Не участвует"}
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Заказы
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-950">{client.ordersCount}</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Сумма заказов
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-950">
                {formatMoney(client.totalSpentCents)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Адрес
            </p>
            <p className="mt-2 text-base text-zinc-950">{client.address || "Не указан"}</p>
          </div>

          <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Заметка
            </p>
            <p className="mt-2 text-base text-zinc-950">{client.notes || "Нет заметок"}</p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
