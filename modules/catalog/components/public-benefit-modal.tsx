"use client";

import { useEffect, useId } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import { LOYALTY_LEVEL_CONFIG } from "@/modules/loyalty/loyalty.rules";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";

export type PublicBenefitKind = "loyalty" | "giveaways";

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

export function PublicBenefitModal({
  client,
  kind,
  onAuth,
  onClose,
}: {
  client: PublicClientProfile | null;
  kind: PublicBenefitKind;
  onAuth: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const isLoyalty = kind === "loyalty";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

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
      <div className="w-full max-w-[680px] overflow-hidden rounded-[8px] border border-[#f3dadd] bg-white shadow-2xl shadow-black/20">
        <div className="flex items-start justify-between gap-4 border-b border-[#f6e2e5] bg-[#fff7f8] p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d50014]">
              {isLoyalty ? "Программа FoodLike" : "Акции FoodLike"}
            </p>
            <h2 id={titleId} className="mt-2 text-3xl font-semibold text-[#241316]">
              {isLoyalty ? "Уровни лояльности" : "Розыгрыши и подарки"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full border border-[#f1d6d9] bg-white text-[#6b5960] transition hover:border-[#d50014] hover:text-[#d50014]"
            aria-label="Закрыть окно"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {client ? (
            isLoyalty ? <LoyaltyContent client={client} /> : <GiveawaysContent client={client} />
          ) : (
            <GuestContent isLoyalty={isLoyalty} onAuth={onAuth} />
          )}
        </div>
      </div>
    </div>
  );
}

function LoyaltyContent({ client }: { client: PublicClientProfile }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[8px] border border-[#ffe0e3] bg-[#fffafa] p-4">
        <p className="text-sm text-[#6b5960]">Ваши покупки учтены на сумму</p>
        <p className="mt-1 text-3xl font-semibold text-[#241316]">
          {formatMoney(client.totalSpentCents)}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#6b5960]">
          {client.loyaltyNextLevel
            ? `До уровня ${LOYALTY_LEVEL_LABELS[client.loyaltyNextLevel]} осталось ${formatMoney(client.loyaltyAmountToNextLevelCents)}.`
            : "У вас максимальный уровень программы."}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {LOYALTY_LEVEL_CONFIG.map((level) => (
          <div
            key={level.level}
            className={`rounded-[8px] border p-4 ${
              client.loyaltyLevel === level.level
                ? "border-[#d50014] bg-[#fff1f2]"
                : "border-[#f3dadd] bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-[#241316]">{LOYALTY_LEVEL_LABELS[level.level]}</h3>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#b00012]">
                {level.discountPercent}%
              </span>
            </div>
            <p className="mt-2 text-sm text-[#6b5960]">от {formatMoney(level.minSpentCents)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GiveawaysContent({ client }: { client: PublicClientProfile }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[8px] border border-[#ffe0e3] bg-[#fffafa] p-4">
        <p className="text-sm text-[#6b5960]">Участник</p>
        <p className="mt-1 text-2xl font-semibold text-[#241316]">{client.name}</p>
        <p className="mt-2 text-sm leading-6 text-[#6b5960]">
          Розыгрыши будут привязаны к вашему телефону. Когда акция появится,
          участие и статус будут отображаться здесь.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Активные акции", "История участия", "Подарки"].map((label) => (
          <div key={label} className="rounded-[8px] border border-[#f3dadd] bg-white p-4">
            <p className="text-sm font-semibold text-[#241316]">{label}</p>
            <p className="mt-2 text-sm leading-6 text-[#6b5960]">Скоро</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuestContent({
  isLoyalty,
  onAuth,
}: {
  isLoyalty: boolean;
  onAuth: () => void;
}) {
  return (
    <div className="rounded-[8px] border border-[#ffe0e3] bg-[#fffafa] p-5">
      <h3 className="text-2xl font-semibold text-[#241316]">
        {isLoyalty ? "Войдите, чтобы увидеть бонусы" : "Войдите, чтобы участвовать"}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#6b5960]">
        {isLoyalty
          ? "После SMS-входа мы найдем ваш клиентский профиль по телефону и покажем уровень лояльности."
          : "Розыгрыши будут доступны только после подтверждения телефона на сайте."}
      </p>
      <button
        type="button"
        onClick={onAuth}
        className="mt-5 min-h-11 rounded-full bg-[#d50014] px-5 text-sm font-semibold text-white transition hover:bg-[#b90012]"
      >
        Войти или зарегистрироваться
      </button>
    </div>
  );
}
