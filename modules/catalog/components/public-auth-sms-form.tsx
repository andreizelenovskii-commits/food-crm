"use client";

import { FormEvent, useState } from "react";
import {
  CodeField,
  EditDetailsButton,
  FormMessages,
  PhoneField,
  SubmitButton,
  TextField,
} from "@/modules/catalog/components/public-auth-form-controls";
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
  const [pendingRequestBody, setPendingRequestBody] = useState<Record<string, string> | null>(null);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const phone = String(formData.get("phone") ?? "").trim();
    const code = String(formData.get("code") ?? "").trim();

    await submitSmsFlow({
      requestPath: "/api/v1/public-auth/login/request-code",
      verifyPath: "/api/v1/public-auth/login/verify",
      requestBody: { phone },
      code,
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
      code,
    });
  }

  async function submitSmsFlow(input: {
    requestPath: string;
    verifyPath: string;
    requestBody: Record<string, string>;
    code: string;
  }) {
    setIsPending(true);
    setState(initialFormState);

    try {
      if (step === "details") {
        await browserBackendJson(input.requestPath, { body: input.requestBody });
        setPendingRequestBody(input.requestBody);
        setStep("code");
        setState({
          errorMessage: null,
          successMessage: "Отправили SMS-код. Введите 6 цифр из сообщения.",
        });
        return;
      }

      await browserBackendJson(input.verifyPath, {
        body: { ...(pendingRequestBody ?? input.requestBody), code: input.code },
      });
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

  function editDetails() {
    setStep("details");
    setPendingRequestBody(null);
    setState(initialFormState);
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
          onEditDetails={editDetails}
          onSubmit={submitLogin}
        />
      ) : (
        <RegisterForm
          isPending={isPending}
          state={state}
          step={step}
          onEditDetails={editDetails}
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
  onEditDetails,
  onSubmit,
}: {
  isPending: boolean;
  state: AuthFormState;
  step: AuthStep;
  onEditDetails: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <fieldset disabled={step === "code"} className={step === "code" ? "opacity-60" : ""}>
        <PhoneField autoComplete="username" />
      </fieldset>
      <CodeField step={step} />
      <FormMessages state={state} />
      {step === "code" ? <EditDetailsButton onClick={onEditDetails} /> : null}
      <SubmitButton isPending={isPending} step={step} verifyText="Подтвердить вход" />
    </form>
  );
}

function RegisterForm({
  isPending,
  state,
  step,
  onEditDetails,
  onSubmit,
}: {
  isPending: boolean;
  state: AuthFormState;
  step: AuthStep;
  onEditDetails: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <fieldset disabled={step === "code"} className={`space-y-4 ${step === "code" ? "opacity-60" : ""}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="firstName" label="Имя" placeholder="Анна" autoComplete="given-name" />
          <TextField name="lastName" label="Фамилия" placeholder="Иванова" autoComplete="family-name" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <PublicBirthDatePicker />
          <PhoneField autoComplete="tel" />
        </div>
      </fieldset>
      <CodeField step={step} />
      <label className="flex items-start gap-3 rounded-[8px] bg-[#fff5f6] p-3 text-sm leading-5 text-[#6b5960]">
        <input type="checkbox" className="mt-1 size-4 accent-[#d50014]" required />
        <span>Согласен получать уведомления о заказах и бонусах FoodLike.</span>
      </label>
      <FormMessages state={state} />
      {step === "code" ? <EditDetailsButton onClick={onEditDetails} /> : null}
      <SubmitButton isPending={isPending} step={step} verifyText="Подтвердить регистрацию" />
    </form>
  );
}
