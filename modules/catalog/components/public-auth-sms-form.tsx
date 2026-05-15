"use client";

import { FormEvent, useState } from "react";
import { PublicBirthDatePicker } from "@/modules/catalog/components/public-birth-date-picker";
import { browserBackendJson } from "@/shared/api/browser-backend";

export type AuthMode = "login" | "register";

type AuthStep = "details" | "code";

type AuthFormState = {
  errorMessage: string | null;
  successMessage: string | null;
};

const initialFormState: AuthFormState = {
  errorMessage: null,
  successMessage: null,
};

export function PublicAuthSmsForm({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  const [step, setStep] = useState<AuthStep>("details");
  const [state, setState] = useState<AuthFormState>(initialFormState);
  const [isPending, setIsPending] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const phone = String(formData.get("phone") ?? "").trim();
    const code = String(formData.get("code") ?? "").trim();

    await submitSmsFlow({
      requestPath: "/api/v1/public-auth/login/request-code",
      verifyPath: "/api/v1/public-auth/login/verify",
      requestBody: { phone },
      verifyBody: { phone, code },
    });
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const requestBody = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      birthDate: String(formData.get("birthDate") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
    };
    const code = String(formData.get("code") ?? "").trim();

    await submitSmsFlow({
      requestPath: "/api/v1/public-auth/register/request-code",
      verifyPath: "/api/v1/public-auth/register/verify",
      requestBody,
      verifyBody: { ...requestBody, code },
    });
  }

  async function submitSmsFlow(input: {
    requestPath: string;
    verifyPath: string;
    requestBody: Record<string, string>;
    verifyBody: Record<string, string>;
  }) {
    setIsPending(true);
    setState(initialFormState);

    try {
      if (step === "details") {
        await browserBackendJson(input.requestPath, { body: input.requestBody });
        setStep("code");
        setState({
          errorMessage: null,
          successMessage: "Отправили SMS-код. Введите 6 цифр из сообщения.",
        });
        return;
      }

      await browserBackendJson(input.verifyPath, { body: input.verifyBody });
      window.location.reload();
    } catch (error) {
      setState({
        errorMessage: error instanceof Error ? error.message : "Не удалось выполнить действие",
        successMessage: null,
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 rounded-[8px] bg-[#fff1f2] p-1">
        {(["login", "register"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onModeChange(item)}
            className={`min-h-11 rounded-[7px] text-sm font-semibold transition ${
              mode === item
                ? "bg-white text-[#b00012] shadow-sm"
                : "text-[#7b5e64] hover:text-[#b00012]"
            }`}
          >
            {item === "login" ? "Вход" : "Регистрация"}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <LoginForm
          isPending={isPending}
          state={state}
          step={step}
          onSubmit={submitLogin}
        />
      ) : (
        <RegisterForm
          isPending={isPending}
          state={state}
          step={step}
          onSubmit={submitRegistration}
        />
      )}
    </>
  );
}

function LoginForm({
  isPending,
  state,
  step,
  onSubmit,
}: {
  isPending: boolean;
  state: AuthFormState;
  step: AuthStep;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <PhoneField autoComplete="username" />
      <CodeField step={step} />
      <FormMessages state={state} />
      <SubmitButton isPending={isPending} step={step} verifyText="Подтвердить вход" />
    </form>
  );
}

function RegisterForm({
  isPending,
  state,
  step,
  onSubmit,
}: {
  isPending: boolean;
  state: AuthFormState;
  step: AuthStep;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="firstName" label="Имя" placeholder="Анна" autoComplete="given-name" />
        <TextField name="lastName" label="Фамилия" placeholder="Иванова" autoComplete="family-name" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <PublicBirthDatePicker />
        <PhoneField autoComplete="tel" />
      </div>
      <CodeField step={step} />
      <label className="flex items-start gap-3 rounded-[8px] bg-[#fff5f6] p-3 text-sm leading-5 text-[#6b5960]">
        <input type="checkbox" className="mt-1 size-4 accent-[#d50014]" required />
        <span>Согласен получать уведомления о заказах и бонусах FoodLike.</span>
      </label>
      <FormMessages state={state} />
      <SubmitButton isPending={isPending} step={step} verifyText="Подтвердить регистрацию" />
    </form>
  );
}

function TextField({
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

function PhoneField({ autoComplete }: { autoComplete: string }) {
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

function CodeField({ step }: { step: AuthStep }) {
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

function FormMessages({ state }: { state: AuthFormState }) {
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

function SubmitButton({
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
