"use client";

import { FormEvent, useId, useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import { PublicBirthDatePicker } from "@/modules/catalog/components/public-birth-date-picker";
import {
  PublicModalCloseButton,
  PublicModalOverlay,
} from "@/modules/catalog/components/public-modal-shell";
import { ClientAddressFieldsWithDefaults } from "@/modules/clients/components/client-address-fields";
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

function getProfileInitial(name: string) {
  return name.trim().slice(0, 1).toLocaleUpperCase("ru-RU") || "F";
}

function getProgress(client: PublicClientProfile) {
  if (!client.loyaltyLevel || !client.loyaltyNextLevel) return 100;

  const current = LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyLevel)?.minSpentCents ?? 0;
  const next = LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyNextLevel)?.minSpentCents ?? current;
  return Math.min(Math.max(((client.totalSpentCents - current) / Math.max(next - current, 1)) * 100, 4), 100);
}

function getAddressFromFormData(formData: FormData) {
  const addressesJson = String(formData.get("addressesJson") ?? "").trim();

  if (!addressesJson) {
    return "";
  }

  try {
    const parsed = JSON.parse(addressesJson) as unknown;

    if (!Array.isArray(parsed)) {
      return "";
    }

    return parsed
      .map((address) => String(address ?? "").trim())
      .filter(Boolean)
      .join("\n");
  } catch {
    return "";
  }
}

export function PublicProfileModal({
  client,
  onClose,
}: {
  client: PublicClientProfile;
  onClose: () => void;
}) {
  const titleId = useId();
  const [isPending, setIsPending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const progress = getProgress(client);
  const name = splitName(client.name);
  const profileInitial = getProfileInitial(name.firstName || client.name);

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
          address: getAddressFromFormData(formData),
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
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-[860px] overflow-y-auto rounded-[28px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(80,8,16,0.24)]">
        <div className="relative overflow-hidden border-b border-[#f6e2e5] bg-[linear-gradient(135deg,#fff8f8_0%,#ffffff_45%,#fff1f2_100%)] p-5 sm:p-7">
          <div className="absolute right-10 top-8 h-24 w-24 rounded-full bg-[#d50014]/8 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <span className="flex size-20 shrink-0 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#d50014_0%,#f04455_55%,#ff8a95_100%)] text-4xl font-black text-white shadow-[0_18px_34px_rgba(213,0,20,0.22)] sm:size-24 sm:text-5xl">
                {profileInitial}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d50014]">
                  Личный кабинет
                </p>
                <h2 id={titleId} className="mt-2 truncate text-3xl font-black leading-tight text-[#241316] sm:text-4xl">
                  {client.name}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#f0d9dc] bg-white px-3 py-1.5 text-sm font-bold text-[#7b5e64]">
                    {client.phone}
                  </span>
                  <span className="rounded-full bg-[#d50014] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white">
                    {client.loyaltyLevel ? LOYALTY_LEVEL_LABELS[client.loyaltyLevel] : "Клиент"}
                  </span>
                </div>
              </div>
            </div>
            <PublicModalCloseButton label="Закрыть профиль" onClose={onClose} />
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-5 p-5 font-semibold sm:p-7">
          <section className="grid gap-4 sm:grid-cols-2">
            <ProfileInput name="firstName" label="Имя" defaultValue={name.firstName} />
            <ProfileInput name="lastName" label="Фамилия" defaultValue={name.lastName} />
            <PublicBirthDatePicker defaultValue={client.birthDate} />
            <ProfileTile label="Телефон" value={client.phone} />
          </section>

          <section className="rounded-[22px] border border-[#f3dadd] bg-[#fffafa] p-4 shadow-sm shadow-[#d50014]/5">
            <div className="mb-4">
              <p className="text-sm font-black text-[#241316]">Адреса доставки</p>
              <p className="mt-1 text-sm leading-6 text-[#7b5e64]">
                Формат такой же, как в CRM: город, улица, дом и детали квартиры или частного дома.
              </p>
            </div>
            <ClientAddressFieldsWithDefaults defaultAddress={client.address} />
          </section>

          <section className="rounded-[22px] border border-[#f3dadd] bg-[#fffafa] p-4 shadow-sm shadow-[#d50014]/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d50014]">
                  Лояльность
                </p>
                <h3 className="mt-1 text-2xl font-black text-[#241316]">
                  {client.loyaltyLevel ? LOYALTY_LEVEL_LABELS[client.loyaltyLevel] : "Клиент"}
                </h3>
              </div>
              <a href="#orders" className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#d50014] px-5 text-sm font-black text-white shadow-sm shadow-[#d50014]/20 transition hover:bg-[#b90012]">
                Все заказы
              </a>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#f6e2e5]">
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
            <button type="submit" disabled={isPending} className="min-h-[52px] rounded-full bg-[#d50014] px-7 text-sm font-black text-white shadow-[0_14px_28px_rgba(213,0,20,0.20)] transition hover:bg-[#b90012] disabled:opacity-60">
              {isPending ? "Сохраняем..." : "Сохранить профиль"}
            </button>
            <button type="button" onClick={logout} disabled={isLoggingOut} className="min-h-[52px] rounded-full border border-[#f0d9dc] bg-white px-7 text-sm font-black text-[#b00012] shadow-sm shadow-[#d50014]/5 transition hover:border-[#d50014] hover:bg-[#fff1f2] disabled:opacity-60">
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
      <input name={name} type={type} defaultValue={defaultValue} className="foodlike-field min-h-[54px] rounded-[16px] bg-white shadow-sm shadow-[#d50014]/5" required />
    </label>
  );
}

function ProfileTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-[78px] rounded-[16px] border border-[#f6e2e5] bg-white px-4 py-3 shadow-sm shadow-[#d50014]/5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b00012]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#3a292d]">{value}</p>
    </div>
  );
}
