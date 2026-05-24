"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CodeField,
  EditDetailsButton,
  FormMessages,
  PhoneField,
  SubmitButton,
  TextField,
} from "@/modules/catalog/components/public-auth-form-controls";
import {
  AuthStepCard,
  ResendCodeBlock,
} from "@/modules/catalog/components/public-auth-sms-status";
import { PublicBirthDatePicker } from "@/modules/catalog/components/public-birth-date-picker";
import { browserBackendJson } from "@/shared/api/browser-backend";

export type AuthMode = "login" | "register";

export type AuthStep = "details" | "code";

type AuthFormState = {
  errorMessage: string | null;
  successMessage: string | null;
};

const initialFormState: AuthFormState = {
  errorMessage: null,
  successMessage: null,
};

const resendDelaySeconds = 120;

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
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  useEffect(() => {
    if (resendSecondsLeft <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setResendSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendSecondsLeft]);

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
        await requestSmsCode(input.requestPath, input.requestBody);
        setPendingRequestBody(input.requestBody);
        setStep("code");
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

  async function requestSmsCode(requestPath: string, requestBody: Record<string, string>) {
    await browserBackendJson(requestPath, { body: requestBody });
    setResendSecondsLeft(resendDelaySeconds);
    setState({
      errorMessage: null,
      successMessage: "Отправили SMS-код. Введите 6 цифр из сообщения.",
    });
  }

  async function resendCode() {
    if (!pendingRequestBody || resendSecondsLeft > 0) {
      return;
    }

    setIsPending(true);
    setState(initialFormState);

    try {
      await requestSmsCode(
        mode === "login"
          ? "/api/v1/public-auth/login/request-code"
          : "/api/v1/public-auth/register/request-code",
        pendingRequestBody,
      );
    } catch (error) {
      setState({
        errorMessage: error instanceof Error ? error.message : "Не удалось отправить код повторно",
        successMessage: null,
      });
    } finally {
      setIsPending(false);
    }
  }

  function editDetails() {
    setStep("details");
    setPendingRequestBody(null);
    setResendSecondsLeft(0);
    setState(initialFormState);
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 rounded-[16px] border border-[#f3dfe2] bg-[#fff7f8] p-1 shadow-inner shadow-[#d50014]/5">
        {(["login", "register"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onModeChange(item)}
            className={`min-h-12 rounded-[13px] text-sm font-semibold transition ${
              mode === item
                ? "bg-white text-[#b00012] shadow-[0_8px_18px_rgba(80,8,18,0.08)]"
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
          resendSecondsLeft={resendSecondsLeft}
          onEditDetails={editDetails}
          onResendCode={resendCode}
          onSubmit={submitLogin}
        />
      ) : (
        <RegisterForm
          isPending={isPending}
          state={state}
          step={step}
          resendSecondsLeft={resendSecondsLeft}
          onEditDetails={editDetails}
          onResendCode={resendCode}
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
  resendSecondsLeft,
  onEditDetails,
  onResendCode,
  onSubmit,
}: {
  isPending: boolean;
  state: AuthFormState;
  step: AuthStep;
  resendSecondsLeft: number;
  onEditDetails: () => void;
  onResendCode: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <AuthStepCard mode="login" step={step} />
      <fieldset disabled={step === "code"} className={step === "code" ? "opacity-60" : ""}>
        <PhoneField autoComplete="username" />
      </fieldset>
      <CodeField step={step} />
      <ResendCodeBlock
        isPending={isPending}
        secondsLeft={resendSecondsLeft}
        step={step}
        onResendCode={onResendCode}
      />
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
  resendSecondsLeft,
  onEditDetails,
  onResendCode,
  onSubmit,
}: {
  isPending: boolean;
  state: AuthFormState;
  step: AuthStep;
  resendSecondsLeft: number;
  onEditDetails: () => void;
  onResendCode: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <AuthStepCard mode="register" step={step} />
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
      <ResendCodeBlock
        isPending={isPending}
        secondsLeft={resendSecondsLeft}
        step={step}
        onResendCode={onResendCode}
      />
      <label className="flex items-start gap-3 rounded-[14px] border border-[#f3dfe2] bg-[#fff7f8] p-3 text-sm leading-5 text-[#6b5960]">
        <input type="checkbox" className="mt-1 size-4 rounded border-[#e9c5ca] accent-[#d50014]" required />
        <span>Согласен получать уведомления о заказах и бонусах FoodLike.</span>
      </label>
      <FormMessages state={state} />
      {step === "code" ? <EditDetailsButton onClick={onEditDetails} /> : null}
      <SubmitButton isPending={isPending} step={step} verifyText="Подтвердить регистрацию" />
    </form>
  );
}
