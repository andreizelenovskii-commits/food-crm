"use client";

import type { AuthMode, AuthStep } from "@/modules/catalog/components/public-auth-sms-form";

export function AuthStepCard({ mode, step }: { mode: AuthMode; step: AuthStep }) {
  const isCodeStep = step === "code";

  return (
    <div className="rounded-[18px] border border-[#f2d8dc] bg-[linear-gradient(135deg,#fffafa_0%,#fff3f4_100%)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#2b171b]">
          {isCodeStep ? "Проверка телефона" : mode === "login" ? "Вход по SMS" : "Данные профиля"}
        </p>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#b00012] shadow-sm">
          {isCodeStep ? "2 шаг" : "1 шаг"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-5 text-[#7b5e64]">
        {isCodeStep
          ? "Код уже отправлен. Повторную отправку включим через две минуты."
          : mode === "login"
            ? "Укажите телефон, к которому привязан личный кабинет."
            : "Заполни данные, и мы отправим код для подтверждения телефона."}
      </p>
    </div>
  );
}

export function ResendCodeBlock({
  isPending,
  secondsLeft,
  step,
  onResendCode,
}: {
  isPending: boolean;
  secondsLeft: number;
  step: AuthStep;
  onResendCode: () => void;
}) {
  if (step !== "code") {
    return null;
  }

  const isLocked = secondsLeft > 0;

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[#f2d8dc] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[#2b171b]">Код не пришел?</p>
        <p className="mt-1 text-sm text-[#7b5e64]">
          {isLocked ? `Повторная отправка через ${formatTimer(secondsLeft)}` : "Можно отправить SMS еще раз."}
        </p>
      </div>
      <button
        type="button"
        onClick={onResendCode}
        disabled={isPending || isLocked}
        className="min-h-11 rounded-[14px] border border-[#f0cfd3] bg-[#fff8f9] px-4 text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2] disabled:cursor-not-allowed disabled:opacity-55"
      >
        Отправить код повторно
      </button>
    </div>
  );
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
