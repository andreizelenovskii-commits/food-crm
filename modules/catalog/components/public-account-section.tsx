"use client";

import { useState } from "react";
import type { PublicClientProfile } from "@/modules/clients/clients.types";
import {
  type AuthMode,
  PublicAuthModal,
} from "@/modules/catalog/components/public-auth-modal";
import { PublicProfileModal } from "@/modules/catalog/components/public-profile-modal";
import { LOYALTY_LEVEL_CONFIG } from "@/modules/loyalty/loyalty.rules";
import { LOYALTY_LEVEL_LABELS } from "@/modules/loyalty/loyalty.types";

const ACCOUNT_FEATURES = [
  {
    title: "Бонусы",
    text: "Уровень лояльности подтягивается по номеру телефона из клиентской базы.",
  },
  {
    title: "Профиль",
    text: "На публичном сайте видны только клиентские данные: телефон, дата рождения и бонусный прогресс.",
  },
  {
    title: "Розыгрыши",
    text: "Раздел готов для акций: вошедшие клиенты смогут видеть условия и участие.",
  },
] as const;

function formatMoney(cents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getProgress(client: PublicClientProfile | null) {
  if (!client?.loyaltyLevel || !client.loyaltyNextLevel) {
    return client ? 100 : 0;
  }

  const current = LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyLevel);
  const next = LOYALTY_LEVEL_CONFIG.find((entry) => entry.level === client.loyaltyNextLevel);
  const start = current?.minSpentCents ?? 0;
  const end = next?.minSpentCents ?? start;

  return Math.min(Math.max(((client.totalSpentCents - start) / Math.max(end - start, 1)) * 100, 4), 100);
}

export function PublicAccountSection({
  currentClient,
}: {
  currentClient: PublicClientProfile | null;
}) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const progress = getProgress(currentClient);

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }

  return (
    <>
      <section className="bg-[#fff7f8] py-14 sm:py-18">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-between rounded-[8px] border border-[#ffe0e3] bg-white p-6 shadow-sm shadow-[#d50014]/8 sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d50014]">
                Личный кабинет
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#241316] sm:text-5xl">
                Бонусы и профиль прямо на сайте
              </h2>
              <p className="mt-4 text-base leading-7 text-[#6b5960]">
                Вход по SMS привязывает клиента к номеру телефона. CRM остается
                внутри компании, а на сайте клиент видит только свои бонусы и
                понятный прогресс до следующего уровня.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {currentClient ? (
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="inline-flex min-h-12 justify-center rounded-full bg-[#d50014] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[#d50014]/22 transition hover:bg-[#b90012]"
                >
                  Открыть профиль
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="inline-flex min-h-12 justify-center rounded-full bg-[#d50014] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[#d50014]/22 transition hover:bg-[#b90012]"
                  >
                    Войти по SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth("register")}
                    className="inline-flex min-h-12 justify-center rounded-full border border-[#f0cfd3] bg-white px-6 py-3 text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2]"
                  >
                    Зарегистрироваться
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[8px] border border-[#ffe0e3] bg-white p-5 shadow-sm shadow-[#d50014]/8 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d50014]">
                    {currentClient ? "Ваш статус" : "Для гостей"}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-[#241316]">
                    {currentClient?.loyaltyLevel
                      ? LOYALTY_LEVEL_LABELS[currentClient.loyaltyLevel]
                      : currentClient
                        ? "Клиент FoodLike"
                        : "Войдите, чтобы появились бонусы"}
                  </h3>
                </div>
                <span className="w-fit rounded-full bg-[#fff1f2] px-3 py-1 text-sm font-semibold text-[#b00012]">
                  {currentClient ? formatMoney(currentClient.totalSpentCents) : "SMS вход"}
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f6e2e5]">
                <div className="h-full rounded-full bg-[#d50014]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[#6b5960]">
                {currentClient?.loyaltyNextLevel
                  ? `До уровня ${LOYALTY_LEVEL_LABELS[currentClient.loyaltyNextLevel]} осталось ${formatMoney(currentClient.loyaltyAmountToNextLevelCents)}.`
                  : currentClient
                    ? "У вас максимальный уровень или клиентский профиль уже активен."
                    : "Авторизуйтесь или зарегистрируйтесь, и здесь появится персональный счетчик до следующего уровня."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {ACCOUNT_FEATURES.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[8px] border border-[#ffe0e3] bg-white p-5 shadow-sm shadow-[#d50014]/8"
                >
                  <h3 className="text-lg font-semibold text-[#241316]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6b5960]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isAuthOpen ? (
        <PublicAuthModal
          mode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onModeChange={setAuthMode}
        />
      ) : null}

      {isProfileOpen && currentClient ? (
        <PublicProfileModal
          client={currentClient}
          onClose={() => setIsProfileOpen(false)}
        />
      ) : null}
    </>
  );
}
