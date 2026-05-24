"use client";

import { FormEvent, useId, useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import {
  PublicAvatarBadge,
  SYSTEM_AVATARS,
  usePublicAvatar,
} from "@/modules/catalog/components/public-avatar";
import {
  PublicModalCloseButton,
  PublicModalOverlay,
} from "@/modules/catalog/components/public-modal-shell";
import { LOYALTY_LEVEL_CONFIG } from "@/modules/loyalty/loyalty.rules";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";
import { browserBackendJson } from "@/shared/api/browser-backend";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    currency: "RUB",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

function splitName(name: string) {
  const [firstName = "", ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

function getProgress(client: PublicClientProfile) {
  if (!client.loyaltyLevel || !client.loyaltyNextLevel) return 100;

  const current = LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyLevel)?.minSpentCents ?? 0;
  const next = LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyNextLevel)?.minSpentCents ?? current;
  return Math.min(Math.max(((client.totalSpentCents - current) / Math.max(next - current, 1)) * 100, 4), 100);
}

export function PublicProfileModal({
  client,
  onClose,
}: {
  client: PublicClientProfile;
  onClose: () => void;
}) {
  const titleId = useId();
  const { avatarId, setAvatarId } = usePublicAvatar();
  const [isPending, setIsPending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const progress = getProgress(client);
  const name = splitName(client.name);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsPending(true);
    setMessage(null);

    try {
      await browserBackendJson("/api/v1/public-auth/me", {
        method: "PATCH",
        body: {
          firstName: String(formData.get("firstName") ?? "").trim(),
          lastName: String(formData.get("lastName") ?? "").trim(),
          birthDate: String(formData.get("birthDate") ?? "").trim(),
          address: String(formData.get("address") ?? "").trim(),
        },
      });
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить профиль");
      setIsPending(false);
    }
  }

  async function logout() {
    setIsLoggingOut(true);

    try {
      setMessage(null);
      await browserBackendJson("/api/v1/public-auth/logout");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выйти из профиля");
      setIsLoggingOut(false);
    }
  }

  return (
    <PublicModalOverlay labelledBy={titleId} onClose={onClose}>
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[24px] border border-[#f3dadd] bg-white shadow-2xl shadow-black/20">
        <div className="border-b border-[#f6e2e5] bg-[#fff8f8] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <PublicAvatarBadge avatarId={avatarId} className="size-20 shrink-0 rounded-[22px] text-3xl" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d50014]">
                  Личный кабинет
                </p>
                <h2 id={titleId} className="mt-2 truncate text-3xl font-semibold text-[#241316]">
                  {client.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-[#7b5e64]">{client.phone}</p>
              </div>
            </div>
            <PublicModalCloseButton label="Закрыть профиль" onClose={onClose} />
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4 p-5 sm:p-6">
          <section className="rounded-[18px] border border-[#f3dadd] bg-[#fffafa] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#241316]">Аватарка</p>
                <p className="mt-1 text-sm text-[#7b5e64]">Только системные, без загрузки фото.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SYSTEM_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setAvatarId(avatar.id)}
                    className={`flex size-12 items-center justify-center rounded-[14px] bg-gradient-to-br ${avatar.className} text-xl font-black text-white ring-offset-2 transition ${
                      avatar.id === avatarId ? "ring-2 ring-[#d50014]" : "opacity-82 hover:opacity-100"
                    }`}
                    aria-label={avatar.label}
                  >
                    {avatar.mark}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <ProfileInput name="firstName" label="Имя" defaultValue={name.firstName} />
            <ProfileInput name="lastName" label="Фамилия" defaultValue={name.lastName} />
            <ProfileInput name="birthDate" label="Дата рождения" type="date" defaultValue={client.birthDate ?? ""} />
            <ProfileTile label="Телефон" value={client.phone} />
          </section>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#3a292d]">Адреса доставки</span>
            <textarea
              name="address"
              defaultValue={client.address ?? ""}
              placeholder="Каждый адрес с новой строки"
              className="foodlike-field min-h-28 rounded-[16px] py-3"
            />
          </label>

          <section className="rounded-[18px] border border-[#f3dadd] bg-[#fffafa] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d50014]">
                  Лояльность
                </p>
                <h3 className="mt-1 text-xl font-semibold text-[#241316]">
                  {client.loyaltyLevel ? LOYALTY_LEVEL_LABELS[client.loyaltyLevel] : "Клиент"}
                </h3>
              </div>
              <a href="#orders" className="rounded-full bg-[#d50014] px-4 py-2 text-sm font-semibold text-white">
                Все заказы
              </a>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f6e2e5]">
              <div className="h-full rounded-full bg-[#d50014]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6b5960]">
              Потрачено {formatMoney(client.totalSpentCents)}.
              {client.loyaltyNextLevel
                ? ` До уровня ${LOYALTY_LEVEL_LABELS[client.loyaltyNextLevel]} осталось ${formatMoney(client.loyaltyAmountToNextLevelCents)}.`
                : " У вас максимальный уровень лояльности."}
            </p>
          </section>

          {message ? (
            <p className="rounded-[14px] border border-[#ffc9cf] bg-[#fff4f5] px-4 py-3 text-sm text-[#a00010]">
              {message}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button type="submit" disabled={isPending} className="min-h-12 rounded-[16px] bg-[#d50014] px-5 text-sm font-semibold text-white transition hover:bg-[#b90012] disabled:opacity-60">
              {isPending ? "Сохраняем..." : "Сохранить профиль"}
            </button>
            <button type="button" onClick={logout} disabled={isLoggingOut} className="min-h-12 rounded-[16px] border border-[#f0d9dc] bg-white px-5 text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2] disabled:opacity-60">
              {isLoggingOut ? "Выходим..." : "Выйти"}
            </button>
          </div>
        </form>
      </div>
    </PublicModalOverlay>
  );
}

function ProfileInput({ defaultValue, label, name, type = "text" }: { defaultValue: string; label: string; name: string; type?: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#3a292d]">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className="foodlike-field min-h-12 rounded-[16px]" required />
    </label>
  );
}

function ProfileTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#f6e2e5] bg-white px-4 py-3 shadow-sm shadow-[#d50014]/5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b00012]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#3a292d]">{value}</p>
    </div>
  );
}
