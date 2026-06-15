"use client";

import { useState, type FormEvent } from "react";
import { loginAction } from "@/modules/auth/auth.actions";
import { limitRuPhoneInput } from "@/shared/phone";

const AUTH_ROLE_GROUPS = [
  {
    title: "Руководители",
    roles: ["Шеф повар", "Администратор", "Управляющий", "Старший курьер"],
  },
  {
    title: "Сотрудники",
    roles: ["Повара", "Курьеры", "Диспетчера"],
  },
] as const;

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3 5 6v5.2c0 4.4 2.8 8.3 7 9.8 4.2-1.5 7-5.4 7-9.8V6l-7-3Z" />
      <path d="m9.2 12 1.8 1.8 3.9-4" />
    </svg>
  );
}

function SessionIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M8 9h8M8 13h5" />
      <path d="M16 16.5 18 18l3-4" />
    </svg>
  );
}

function FoodLikeMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-red-700 shadow-sm">
        F
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">FoodLike</p>
        <p className="text-lg font-semibold text-white">CRM</p>
      </div>
    </div>
  );
}

export function LoginForm({ returnTo, initialError }: { returnTo?: string; initialError?: string }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError ?? null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setErrorMessage(null);
    setIsPending(true);

    try {
      const result = await loginAction(
        { errorMessage: null },
        new FormData(event.currentTarget),
      );
      setErrorMessage(result.errorMessage);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Не удалось выполнить вход. Обнови страницу и попробуй ещё раз.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="w-full overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_28px_90px_rgba(127,29,29,0.16)]">
      <div className="grid min-h-[35rem] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="flex flex-col justify-between bg-[linear-gradient(145deg,#b70716_0%,#d90416_48%,#7f1d1d_100%)] p-6 text-white sm:p-8 lg:p-10">
          <div>
            <FoodLikeMark />
            <h2 className="mt-8 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
              Авторизация команды
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/78">
              Отдельный служебный вход CRM. Доступ определяется должностью в карточке сотрудника, сессия сохраняется на 30 дней.
            </p>
            <div className="mt-6 grid gap-3">
              {AUTH_ROLE_GROUPS.map((group) => (
                <div key={group.title} className="rounded-[18px] border border-white/16 bg-white/10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">{group.title}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white">{group.roles.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[18px] border border-white/16 bg-white/10 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/16">
                  <ShieldIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Проверка сессии после входа</p>
                  <p className="mt-1 text-xs leading-5 text-white/72">
                    Если браузер не сохранил cookie, форма покажет ошибку сразу.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[18px] border border-white/16 bg-white/10 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/16">
                  <SessionIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Единый домен авторизации</p>
                  <p className="mt-1 text-xs leading-5 text-white/72">
                    Запросы идут через текущий сайт, чтобы Safari, Atlas и Chrome работали одинаково.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <form
          action="/api/auth/session-login"
          method="post"
          onSubmit={submitLogin}
          className="flex flex-col justify-center space-y-5 p-6 sm:p-8 lg:p-12"
          noValidate
        >
          <input type="hidden" name="returnTo" value={returnTo ?? ""} />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-800/70">
              Авторизация
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-zinc-950">
              Войти в CRM
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Используй рабочий телефон в формате +7 или 11 цифр. Роль подтянется из карточки сотрудника.
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Телефон</span>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(limitRuPhoneInput(event.target.value))}
              placeholder="+7 924 186-87-41"
              maxLength={12}
              className="h-12 w-full rounded-[16px] border border-red-950/10 bg-white px-4 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-4 focus:ring-red-800/10"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Пароль</span>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Пароль от CRM"
                className="h-12 w-full rounded-[16px] border border-red-950/10 bg-white px-4 pr-28 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-4 focus:ring-red-800/10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-2 top-1/2 inline-flex h-8 -translate-y-1/2 items-center rounded-[12px] border border-red-100 bg-white px-3 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
                aria-pressed={showPassword}
              >
                {showPassword ? "Скрыть" : "Показать"}
              </button>
            </div>
          </label>

          <div className="rounded-[18px] border border-red-950/10 bg-red-50/60 p-4">
            <p className="text-sm font-semibold text-zinc-950">Сессия сохраняется на 30 дней</p>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Выход вручную завершает текущую сессию. Смена пароля сбрасывает другие активные входы.
            </p>
          </div>

          {errorMessage ? (
            <p className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-red-800 px-5 text-sm font-semibold text-white shadow-lg shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isPending ? "Проверяем сессию..." : "Войти в систему"}
          </button>
        </form>
      </div>
    </section>
  );
}
