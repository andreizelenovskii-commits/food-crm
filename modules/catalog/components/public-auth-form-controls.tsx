"use client";

type AuthStep = "details" | "code";

type AuthFormState = {
  errorMessage: string | null;
  successMessage: string | null;
};

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
      <span className="text-sm font-semibold text-[#3a292d]">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="foodlike-field min-h-12 rounded-[8px]"
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}

export function PhoneField({ autoComplete }: { autoComplete: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[#3a292d]">Телефон</span>
      <input
        name="phone"
        type="tel"
        inputMode="tel"
        placeholder="+7 999 123-45-67"
        className="foodlike-field min-h-12 rounded-[8px]"
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
      <span className="text-sm font-semibold text-[#3a292d]">Код из SMS</span>
      <input
        name="code"
        type="text"
        inputMode="numeric"
        placeholder="123456"
        className="foodlike-field min-h-12 rounded-[8px]"
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
        <p className="rounded-[8px] border border-[#ffc9cf] bg-[#fff4f5] px-4 py-3 text-sm text-[#a00010]">
          {state.errorMessage}
        </p>
      ) : null}
      {state.successMessage ? (
        <p className="rounded-[8px] border border-[#bfe8ce] bg-[#f2fff6] px-4 py-3 text-sm text-[#21723a]">
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
      className="min-h-12 w-full rounded-[8px] bg-[#d50014] px-5 text-sm font-semibold text-white shadow-sm shadow-[#d50014]/22 transition hover:bg-[#b90012] disabled:cursor-not-allowed disabled:opacity-60"
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
      className="w-full rounded-[8px] border border-[#f0cfd3] bg-white px-5 py-3 text-sm font-semibold text-[#b00012] transition hover:bg-[#fff1f2]"
    >
      Изменить данные
    </button>
  );
}
