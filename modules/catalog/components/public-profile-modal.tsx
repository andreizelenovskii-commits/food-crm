"use client";

import { useEffect, useId, useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import {
  PublicModalCloseButton,
  PublicModalOverlay,
} from "@/modules/catalog/components/public-modal-shell";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";
import { LOYALTY_LEVEL_CONFIG } from "@/modules/loyalty/loyalty.rules";
import { browserBackendJson } from "@/shared/api/browser-backend";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatBirthDate(value: string | null) {
  if (!value) {
    return "Не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getProgress(client: PublicClientProfile) {
  if (!client.loyaltyLevel || !client.loyaltyNextLevel) {
    return 100;
  }

  const current = LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyLevel)?.minSpentCents ?? 0;
  const next = LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyNextLevel)?.minSpentCents ?? current;
  return Math.min(Math.max(((client.totalSpentCents - current) / Math.max(next - current, 1)) * 100, 4), 100);
}

const SYSTEM_AVATARS = [
  { id: "heart", label: "Классика", mark: "FL", className: "from-[#d50014] to-[#8b0010]" },
  { id: "fire", label: "Горячий", mark: "HOT", className: "from-[#ef4444] to-[#f59e0b]" },
  { id: "mint", label: "Свежий", mark: "M", className: "from-[#0f766e] to-[#86efac]" },
  { id: "night", label: "Ночной", mark: "N", className: "from-[#241316] to-[#7c2d12]" },
] as const;

type AvatarId = (typeof SYSTEM_AVATARS)[number]["id"];

export function PublicProfileModal({
  client,
  onClose,
}: {
  client: PublicClientProfile;
  onClose: () => void;
}) {
  const titleId = useId();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<AvatarId>("heart");
  const progress = getProgress(client);
  const selectedAvatar =
    SYSTEM_AVATARS.find((avatar) => avatar.id === avatarId) ?? SYSTEM_AVATARS[0];

  useEffect(() => {
    const saved = window.localStorage.getItem("foodlike-public-avatar");
    const timerId = window.setTimeout(() => {
      if (SYSTEM_AVATARS.some((avatar) => avatar.id === saved)) {
        setAvatarId(saved as AvatarId);
      }
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  async function logout() {
    setIsLoggingOut(true);

    try {
      setErrorMessage(null);
      await browserBackendJson("/api/v1/public-auth/logout");
      window.location.reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось выйти из профиля");
      setIsLoggingOut(false);
    }
  }

  function selectAvatar(nextAvatarId: AvatarId) {
    setAvatarId(nextAvatarId);
    window.localStorage.setItem("foodlike-public-avatar", nextAvatarId);
  }

  return (
    <PublicModalOverlay labelledBy={titleId} onClose={onClose}>
      <div className="w-full max-w-[680px] overflow-hidden rounded-[24px] border border-[#f3dadd] bg-white shadow-2xl shadow-black/20">
        <div className="relative overflow-hidden border-b border-[#f6e2e5] bg-[#fff7f8] p-5 sm:p-6">
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,#d50014_0%,#ff6b6b_100%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-end gap-4 pt-10">
              <div
                className={`flex size-24 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br ${selectedAvatar.className} text-xl font-black tracking-[0.14em] text-white shadow-[0_18px_42px_rgba(80,8,18,0.25)]`}
              >
                {selectedAvatar.mark}
              </div>
              <div className="pb-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d50014]">
                  Профиль FoodLike
                </p>
                <h2 id={titleId} className="mt-2 text-3xl font-semibold text-[#241316]">
                  {client.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-[#7b5e64]">
                  {client.loyaltyLevel ? LOYALTY_LEVEL_LABELS[client.loyaltyLevel] : "Гость FoodLike"}
                </p>
              </div>
            </div>
            <PublicModalCloseButton label="Закрыть профиль" onClose={onClose} />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-[18px] border border-[#f3dadd] bg-[#fffafa] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#241316]">Системная аватарка</p>
                <p className="mt-1 text-sm text-[#7b5e64]">Выбери стиль профиля без загрузки фото.</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SYSTEM_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => selectAvatar(avatar.id)}
                    className={`flex size-12 items-center justify-center rounded-[14px] bg-gradient-to-br ${avatar.className} text-xs font-black tracking-[0.12em] text-white ring-offset-2 transition ${
                      avatar.id === avatarId ? "ring-2 ring-[#d50014]" : "opacity-80 hover:opacity-100"
                    }`}
                    aria-label={avatar.label}
                  >
                    {avatar.mark}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ProfileTile label="Телефон" value={client.phone} />
            <ProfileTile label="Дата рождения" value={formatBirthDate(client.birthDate)} />
            <ProfileTile label="Адрес" value={client.address ?? "Можно указать при заказе"} />
            <ProfileTile label="За всё время" value={formatMoney(client.totalSpentCents)} />
          </div>

          <div className="mt-4 rounded-[18px] border border-[#f3dadd] bg-[#fffafa] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d50014]">
                  Лояльность
                </p>
                <h3 className="mt-1 text-xl font-semibold text-[#241316]">
                  {client.loyaltyLevel ? LOYALTY_LEVEL_LABELS[client.loyaltyLevel] : "Клиент"}
                </h3>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#b00012] shadow-sm">
                {formatMoney(client.totalSpentCents)}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f6e2e5]">
              <div className="h-full rounded-full bg-[#d50014]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6b5960]">
              {client.loyaltyNextLevel
                ? `До уровня ${LOYALTY_LEVEL_LABELS[client.loyaltyNextLevel]} осталось ${formatMoney(client.loyaltyAmountToNextLevelCents)}.`
                : "У вас максимальный уровень лояльности."}
            </p>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-[14px] border border-[#ffc9cf] bg-[#fff4f5] px-4 py-3 text-sm text-[#a00010]">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            className="mt-5 min-h-12 w-full rounded-[16px] border border-[#f0d9dc] bg-white px-4 text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2] disabled:opacity-60"
          >
            {isLoggingOut ? "Выходим..." : "Выйти из профиля"}
          </button>
        </div>
      </div>
    </PublicModalOverlay>
  );
}

function ProfileTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#f6e2e5] bg-white px-4 py-3 shadow-sm shadow-[#d50014]/5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b00012]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#3a292d]">{value}</p>
    </div>
  );
}
