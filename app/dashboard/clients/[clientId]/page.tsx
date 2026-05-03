import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { hasPermission } from "@/modules/auth/authz";
import { requirePermission } from "@/modules/auth/auth.session";
import { SessionUserActions } from "@/modules/auth/components/session-user-actions";
import { ClientForm } from "@/modules/clients/components/client-form";
import { fetchClientById } from "@/modules/clients/clients.api";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatClientDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value))
    : "Не указана";
}

function formatClientAddresses(address: string | null) {
  const addresses = String(address ?? "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return addresses.length > 0 ? addresses : ["Не указан"];
}

function ProfileInfoTile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-red-950/10 bg-white/72 px-4 py-3 shadow-sm shadow-red-950/5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
        {label}
      </p>
      <p
        className={`mt-1 truncate text-sm leading-6 ${
          accent ? "font-semibold text-zinc-950" : "font-medium text-zinc-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default async function ClientProfilePage(props: {
  params?: Promise<{ clientId: string }>;
  searchParams?: Promise<{ mode?: string }>;
}) {
  const user = await requirePermission("view_clients");
  const params = await props.params;
  const searchParams = await props.searchParams;
  const clientId = Number(params?.clientId);

  if (!params || !params.clientId || !Number.isInteger(clientId) || clientId <= 0) {
    notFound();
  }

  const client = await fetchClientById(clientId);

  if (!client) {
    notFound();
  }

  const averageCheckCents = client.ordersCount > 0
    ? Math.round(client.totalSpentCents / client.ordersCount)
    : 0;
  const canManageClients = hasPermission(user, "manage_clients");
  const isEditing = canManageClients && searchParams?.mode === "edit";
  const profileTitle = client.type === "ORGANIZATION" ? "Профиль организации" : "Профиль клиента";
  const editTitle = client.type === "ORGANIZATION" ? "Редактирование организации" : "Редактирование клиента";

  return (
    <PageShell
      title="Клиенты"
      description="Карточка клиента открыта поверх списка."
      backHref="/dashboard/clients"
      action={<SessionUserActions user={user} />}
    >
      <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8">
        <Link
          href="/dashboard/clients"
          className="fixed inset-0 cursor-default"
          aria-label="Закрыть профиль клиента"
        />

        <section className="relative mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />

          <div className="relative rounded-[22px] border border-white/70 bg-white/74 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">
                  {isEditing ? "Редактирование" : client.type === "ORGANIZATION" ? "Организация" : "Клиент"}
                </p>
                <h2 className="mt-1 truncate text-2xl font-semibold leading-tight text-zinc-950">
                  {isEditing ? editTitle : profileTitle}
                </h2>
                <p className="mt-1 truncate text-sm font-medium text-zinc-600">{client.name}</p>
                {!isEditing && client.loyaltyLevel ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-800 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-red-950/20">
                      {LOYALTY_LEVEL_LABELS[client.loyaltyLevel]}
                    </span>
                    <span className="text-xs leading-5 text-zinc-500">
                      {client.loyaltyNextLevel
                        ? `До ${LOYALTY_LEVEL_LABELS[client.loyaltyNextLevel]} осталось ${formatMoney(client.loyaltyAmountToNextLevelCents)}`
                        : "Максимальный уровень уже достигнут"}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {canManageClients ? (
                  isEditing ? (
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-sm font-medium text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                    >
                      К профилю
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/clients/${client.id}?mode=edit`}
                      className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-sm font-medium text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                    >
                      Редактировать
                    </Link>
                  )
                ) : null}
                <Link
                  href="/dashboard/clients"
                  className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-sm font-medium text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                >
                  Закрыть
                </Link>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-5">
                <ClientForm type={client.type} initialClient={client} />
              </div>
            ) : (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <ProfileInfoTile label="Телефон" value={client.phone} accent />
                  <ProfileInfoTile label="Email" value={client.email || "Не указан"} />
                  <ProfileInfoTile label="Дата рождения" value={formatClientDate(client.birthDate)} />
                  <ProfileInfoTile
                    label="Уровень лояльности"
                    value={client.loyaltyLevel ? LOYALTY_LEVEL_LABELS[client.loyaltyLevel] : "Не участвует"}
                  />
                  <ProfileInfoTile label="Заказы" value={client.ordersCount} />
                  <ProfileInfoTile label="Сумма заказов" value={formatMoney(client.totalSpentCents)} accent />
                  <ProfileInfoTile label="Средний чек" value={formatMoney(averageCheckCents)} />
                </div>

                <div className="mt-3 rounded-[18px] border border-red-950/10 bg-white/72 px-4 py-3 shadow-sm shadow-red-950/5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
                    Адреса
                  </p>
                  <div className="mt-2 space-y-1 text-sm leading-6 text-zinc-800">
                    {formatClientAddresses(client.address).map((address) => (
                      <p key={address}>{address}</p>
                    ))}
                  </div>
                </div>

                <div className="mt-3 rounded-[18px] border border-red-950/10 bg-white/72 px-4 py-3 shadow-sm shadow-red-950/5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
                    Заметка
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-800">
                    {client.notes || "Нет заметок"}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
