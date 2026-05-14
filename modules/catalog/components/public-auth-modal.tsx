"use client";

import Image from "next/image";
import { FormEvent, useActionState, useEffect, useId, useState } from "react";
import { loginAction } from "@/modules/auth/auth.actions";

export type AuthMode = "login" | "register";

const initialLoginFormState = {
  errorMessage: null,
};

function CloseIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function PublicAuthModal({
  mode,
  onClose,
  onModeChange,
}: {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}) {
  const titleId = useId();
  const [loginState, loginFormAction, isLoginPending] = useActionState(
    loginAction,
    initialLoginFormState,
  );
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterMessage(
      "Форма готова. Когда подключим клиентскую регистрацию в API, она начнет создавать аккаунты.",
    );
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
      <div className="w-full max-w-[920px] overflow-hidden rounded-[8px] bg-white shadow-2xl shadow-black/24">
        <div className="grid md:grid-cols-[0.86fr_1.14fr]">
          <div className="relative hidden min-h-[580px] overflow-hidden bg-[#d50014] text-white md:block">
            <Image
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1100&q=82"
              alt=""
              fill
              sizes="370px"
              className="object-cover opacity-72"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(190,0,18,0.28)_0%,rgba(116,12,20,0.92)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex size-12 overflow-hidden rounded-[8px] bg-white shadow-sm">
                  <Image
                    src="/foodlike-app-icon-v3.png"
                    alt=""
                    fill
                    unoptimized
                    sizes="48px"
                    className="scale-[1.1] object-cover object-[50%_58%]"
                  />
                </span>
                <span className="text-lg font-bold uppercase tracking-[0.18em]">
                  FoodLike
                </span>
              </div>
              <p className="mt-5 max-w-xs text-2xl font-semibold leading-tight">
                Вход в профиль для заказов, адресов и любимых блюд.
              </p>
            </div>
          </div>

          <div className="relative px-5 py-5 sm:px-7 sm:py-6">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-[#f1d6d9] bg-white text-[#6b5960] transition hover:border-[#d50014] hover:text-[#d50014]"
              aria-label="Закрыть окно"
            >
              <CloseIcon className="size-5" />
            </button>

            <div className="pr-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d50014]">
                Личный кабинет
              </p>
              <h2 id={titleId} className="mt-2 text-3xl font-semibold text-[#241316]">
                {mode === "login" ? "Войти в FoodLike" : "Создать аккаунт"}
              </h2>
            </div>

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
              <form action={loginFormAction} className="mt-6 space-y-4" noValidate>
                <input type="hidden" name="returnTo" value="/dashboard/profile" />
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-[#3a292d]">Телефон</span>
                  <input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+7 999 123-45-67"
                    className="foodlike-field min-h-12 rounded-[8px]"
                    autoComplete="username"
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-[#3a292d]">Пароль</span>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      className="foodlike-field min-h-12 rounded-[8px] pr-28"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-[7px] px-3 text-xs font-semibold text-[#b00012] transition hover:bg-[#fff1f2]"
                    >
                      {showPassword ? "Скрыть" : "Показать"}
                    </button>
                  </div>
                </label>
                {loginState.errorMessage ? (
                  <p className="rounded-[8px] border border-[#ffc9cf] bg-[#fff4f5] px-4 py-3 text-sm text-[#a00010]">
                    {loginState.errorMessage}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isLoginPending}
                  className="min-h-12 w-full rounded-[8px] bg-[#d50014] px-5 text-sm font-semibold text-white shadow-sm shadow-[#d50014]/22 transition hover:bg-[#b90012] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoginPending ? "Входим..." : "Войти"}
                </button>
              </form>
            ) : (
              <form onSubmit={submitRegistration} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[#3a292d]">Имя</span>
                    <input
                      name="name"
                      type="text"
                      placeholder="Анна"
                      className="foodlike-field min-h-12 rounded-[8px]"
                      autoComplete="given-name"
                      required
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-[#3a292d]">Телефон</span>
                    <input
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="+7 999 123-45-67"
                      className="foodlike-field min-h-12 rounded-[8px]"
                      autoComplete="tel"
                      required
                    />
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-[#3a292d]">Пароль</span>
                  <input
                    name="password"
                    type="password"
                    placeholder="Минимум 8 символов"
                    className="foodlike-field min-h-12 rounded-[8px]"
                    autoComplete="new-password"
                    required
                  />
                </label>
                <label className="flex items-start gap-3 rounded-[8px] bg-[#fff5f6] p-3 text-sm leading-5 text-[#6b5960]">
                  <input type="checkbox" className="mt-1 size-4 accent-[#d50014]" required />
                  <span>Согласен получать уведомления о заказах и бонусах FoodLike.</span>
                </label>
                {registerMessage ? (
                  <p className="rounded-[8px] border border-[#ffc9cf] bg-[#fff4f5] px-4 py-3 text-sm text-[#a00010]">
                    {registerMessage}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="min-h-12 w-full rounded-[8px] bg-[#d50014] px-5 text-sm font-semibold text-white shadow-sm shadow-[#d50014]/22 transition hover:bg-[#b90012]"
                >
                  Зарегистрироваться
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
