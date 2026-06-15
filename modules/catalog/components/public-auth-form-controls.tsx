"use client";

import { limitRuPhoneInput } from "@/shared/phone";

type AuthStep = "details" | "code";

type AuthFormState = {
  errorMessage: string | null;
  successMessage: string | null;
};

const inputClassName =
  "foodlike-field min-h-[54px] rounded-[14px] border-[#f0d7dc] bg-white px-4 text-base shadow-sm shadow-[#d50014]/5 transition focus:border-[#d50014]/45 focus:ring-4 focus:ring-[#d50014]/10";

export function TextField({
  autoComplete,
  label,
  name,
  placeholder,
  type = "text",
}: {
  autoComplete: string;
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[13px] font-semibold text-[#4a3439]">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}

export function PhoneField({ autoComplete }: { autoComplete: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-[13px] font-semibold text-[#4a3439]">Телефон</span>
      <input
        name="phone"
        type="tel"
        inputMode="tel"
        placeholder="+7 999 123-45-67"
        maxLength={12}
        onInput={(event) => {
          event.currentTarget.value = limitRuPhoneInput(event.currentTarget.value);
        }}
        className={inputClassName}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}

export function CodeField({ step }: { step: AuthStep }) {
  if (step !== "code") {
    return null;
  }

  return (
    <label className="block space-y-2">
      <span className="text-[13px] font-semibold text-[#4a3439]">Код из SMS</span>
      <input
        name="code"
        type="text"
        inputMode="numeric"
        placeholder="000000"
        maxLength={6}
        pattern="[0-9]{6}"
        className={`${inputClassName} text-center text-xl font-semibold tracking-[0.32em] placeholder:tracking-normal`}
        autoComplete="one-time-code"
        required
      />
    </label>
  );
}

export function FormMessages({ state }: { state: AuthFormState }) {
  return (
    <>
      {state.errorMessage ? (
        <p className="rounded-[14px] border border-[#ffc9cf] bg-[#fff5f6] px-4 py-3 text-sm font-medium leading-5 text-[#a00010]">
          {state.errorMessage}
        </p>
      ) : null}
      {state.successMessage ? (
        <p className="rounded-[14px] border border-[#bfe8ce] bg-[#f3fff7] px-4 py-3 text-sm font-medium leading-5 text-[#21723a]">
          {state.successMessage}
        </p>
      ) : null}
    </>
  );
}

export function SubmitButton({
  isPending,
  step,
  verifyText,
}: {
  isPending: boolean;
  step: AuthStep;
  verifyText: string;
}) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="min-h-[54px] w-full rounded-[16px] bg-[#d50014] px-5 text-base font-semibold text-white shadow-[0_14px_28px_rgba(213,0,20,0.2)] transition hover:bg-[#b90012] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Подождите..." : step === "details" ? "Получить SMS-код" : verifyText}
    </button>
  );
}

export function EditDetailsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[14px] border border-[#f0cfd3] bg-white px-5 py-3 text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2]"
    >
      Изменить данные
    </button>
  );
}
