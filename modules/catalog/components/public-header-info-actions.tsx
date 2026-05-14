"use client";

import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/modules/auth/auth.types";
import type { Client } from "@/modules/clients/clients.types";
import type { AuthMode } from "@/modules/catalog/components/public-auth-modal";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";
import { LOYALTY_LEVEL_CONFIG } from "@/modules/loyalty/loyalty.rules";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3 9.8 8.8 4 11l5.8 2.2L12 19l2.2-5.8L20 11l-5.8-2.2L12 3Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

type InfoType = "loyalty" | "giveaways";

const INFO_CONTENT = {
  loyalty: {
    title: "Бонусная программа",
    signedInTitle: "Ваш уровень: Стартовый",
    signedInText:
      "Здесь будет отображаться прогресс, бонусы и следующий уровень после подключения клиентского профиля.",
    guestTitle: "Войдите, чтобы появились бонусы",
    guestText:
      "Авторизуйтесь или зарегистрируйтесь на сайте, и здесь появятся ваши бонусы, уровень и персональные предложения.",
  },
  giveaways: {
    title: "Розыгрыши FoodLike",
    signedInTitle: "Вы участвуете как клиент FoodLike",
    signedInText: "Следите за активными розыгрышами и призами в личном кабинете.",
    guestTitle: "Войдите, чтобы участвовать в розыгрышах",
    guestText:
      "Авторизуйтесь или зарегистрируйтесь на сайте, чтобы видеть розыгрыши, условия участия и свои шансы.",
  },
} as const;

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getLoyaltyProgress(client: Client) {
  if (!client.loyaltyLevel || !client.loyaltyNextLevel) {
    return 100;
  }

  const currentLevelMin =
    LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyLevel)
      ?.minSpentCents ?? 0;
  const nextLevelMin =
    LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyNextLevel)
      ?.minSpentCents ?? client.totalSpentCents;
  const range = Math.max(nextLevelMin - currentLevelMin, 1);
  const completed = client.totalSpentCents - currentLevelMin;

  return Math.min(Math.max((completed / range) * 100, 4), 100);
}

export function PublicHeaderInfoActions({
  currentClient,
  user,
  onAuthOpen,
}: {
  currentClient: Client | null;
  user: SessionUser | null;
  onAuthOpen: (mode: AuthMode) => void;
}) {
  const [activeInfo, setActiveInfo] = useState<InfoType | null>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeInfo) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!infoRef.current?.contains(event.target as Node)) {
        setActiveInfo(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [activeInfo]);

  function openAuth(mode: AuthMode) {
    setActiveInfo(null);
    onAuthOpen(mode);
  }

  const content = activeInfo ? INFO_CONTENT[activeInfo] : null;

  return (
    <div ref={infoRef} className="relative hidden shrink-0 items-center gap-2 lg:flex">
      <InfoButton
        isActive={activeInfo === "loyalty"}
        onClick={() => setActiveInfo((current) => (current === "loyalty" ? null : "loyalty"))}
        icon={<SparkleIcon className="size-4" />}
        label="Лояльность"
        badge={
          currentClient?.loyaltyLevel
            ? LOYALTY_LEVEL_LABELS[currentClient.loyaltyLevel]
            : user
              ? "Клиент"
              : null
        }
      />
      <InfoButton
        isActive={activeInfo === "giveaways"}
        onClick={() =>
          setActiveInfo((current) => (current === "giveaways" ? null : "giveaways"))
        }
        icon={<TicketIcon className="size-4" />}
        label="Розыгрыши"
      />

      {content ? (
        <div className="absolute right-0 top-[calc(100%+12px)] w-[340px] rounded-[22px] border border-[#f3dadd] bg-white/96 p-4 shadow-[0_22px_60px_rgba(90,12,20,0.18)] backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d50014]">
            {content.title}
          </p>
          {user && activeInfo === "loyalty" ? (
            <LoyaltyPanel client={currentClient} />
          ) : (
            <>
              <h3 className="mt-3 text-xl font-semibold text-[#241316]">
                {user ? content.signedInTitle : content.guestTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#6b5960]">
                {user ? content.signedInText : content.guestText}
              </p>
            </>
          )}
          {!user ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="min-h-10 rounded-full bg-[#d50014] px-4 text-sm font-semibold text-white transition hover:bg-[#b90012]"
              >
                Войти
              </button>
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="min-h-10 rounded-full border border-[#f0d9dc] bg-white px-4 text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2]"
              >
                Регистрация
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LoyaltyPanel({ client }: { client: Client | null }) {
  if (!client?.loyaltyLevel) {
    return (
      <>
        <h3 className="mt-3 text-xl font-semibold text-[#241316]">
          Профиль найден, клиент CRM пока не привязан
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#6b5960]">
          Мы ищем клиента CRM по телефону аккаунта. Как только номер совпадет с
          карточкой клиента, здесь появятся уровень и счетчик до следующего уровня.
        </p>
      </>
    );
  }

  const progress = getLoyaltyProgress(client);

  return (
    <>
      <h3 className="mt-3 text-xl font-semibold text-[#241316]">
        {LOYALTY_LEVEL_LABELS[client.loyaltyLevel]} уровень
      </h3>
      <div className="mt-3 rounded-[16px] border border-[#f3dadd] bg-[#fffafa] p-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-[#3a292d]">Потрачено</span>
          <span className="font-semibold text-[#b00012]">
            {formatMoney(client.totalSpentCents)}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f6e2e5]">
          <div
            className="h-full rounded-full bg-[#d50014]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm leading-6 text-[#6b5960]">
          {client.loyaltyNextLevel
            ? `До уровня ${LOYALTY_LEVEL_LABELS[client.loyaltyNextLevel]} осталось ${formatMoney(client.loyaltyAmountToNextLevelCents)}.`
            : "У вас максимальный уровень лояльности."}
        </p>
      </div>
    </>
  );
}

function InfoButton({
  badge,
  icon,
  isActive,
  label,
  onClick,
}: {
  badge?: string | null;
  icon: React.ReactNode;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition ${
        isActive
          ? "border-[#d50014] bg-[#fff1f2] text-[#d50014]"
          : "border-[#f0d9dc] bg-white/80 text-[#5c464b] hover:border-[#ffc3ca] hover:bg-[#fff1f2] hover:text-[#d50014]"
      }`}
      aria-expanded={isActive}
    >
      {icon}
      <span>{label}</span>
      {badge ? (
        <span className="rounded-full bg-[#d50014] px-2 py-0.5 text-xs text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
