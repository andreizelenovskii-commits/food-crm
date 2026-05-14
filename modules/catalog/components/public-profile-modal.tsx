"use client";

import { useEffect, useId, useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";
import { LOYALTY_LEVEL_CONFIG } from "@/modules/loyalty/loyalty.rules";
import { browserBackendJson } from "@/shared/api/browser-backend";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

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

export function PublicProfileModal({
  client,
  onClose,
}: {
  client: PublicClientProfile;
  onClose: () => void;
}) {
  const titleId = useId();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const progress = getProgress(client);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function logout() {
    setIsLoggingOut(true);
    await browserBackendJson("/api/v1/public-auth/logout");
    window.location.reload();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#211316]/58 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] rounded-[24px] border border-[#f3dadd] bg-white p-5 shadow-2xl shadow-black/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d50014]">
              Профиль FoodLike
            </p>
            <h2 id={titleId} className="mt-2 text-3xl font-semibold text-[#241316]">
              {client.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full border border-[#f1d6d9] text-[#6b5960] transition hover:border-[#d50014] hover:text-[#d50014]"
            aria-label="Закрыть профиль"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ProfileTile label="Телефон" value={client.phone} />
          <ProfileTile label="Дата рождения" value={formatBirthDate(client.birthDate)} />
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
            <span className="rounded-full bg-[#fff1f2] px-3 py-1 text-sm font-semibold text-[#b00012]">
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

        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="mt-5 min-h-11 w-full rounded-full border border-[#f0d9dc] bg-white px-4 text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2] disabled:opacity-60"
        >
          {isLoggingOut ? "Выходим..." : "Выйти из профиля"}
        </button>
      </div>
    </div>
  );
}

function ProfileTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-[#fff5f6] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b00012]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#3a292d]">{value}</p>
    </div>
  );
}
