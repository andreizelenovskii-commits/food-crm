"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/modules/auth/auth.actions";
import { SurfaceCard } from "@/components/ui/surface-card";

const initialLoginFormState = {
  errorMessage: null,
};

const ACCESS_VIEWS = [
  {
    id: "admin",
    label: "Управляющий",
    hint: "Полный доступ к заказам, персоналу и настройкам.",
  },
  {
    id: "dispatch",
    label: "Диспетчер",
    hint: "Оперативная работа с входящими заявками и статусами.",
  },
  {
    id: "kitchen",
    label: "Кухня",
    hint: "Контроль состава, сборки и исполнения заказов.",
  },
] as const;

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginFormState,
  );
  const [selectedView, setSelectedView] =
    useState<(typeof ACCESS_VIEWS)[number]["id"]>("admin");
  const [showPassword, setShowPassword] = useState(false);

  const currentView =
    ACCESS_VIEWS.find((view) => view.id === selectedView) ?? ACCESS_VIEWS[0];
  const inputClassName =
    "w-full rounded-2xl border border-zinc-300 bg-white/90 px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5";

  return (
    <SurfaceCard className="mx-auto max-w-xl overflow-hidden border-zinc-200/80 bg-white/95 p-0 shadow-xl shadow-zinc-950/8">
      <div className="border-b border-zinc-200 bg-[linear-gradient(180deg,rgba(250,249,246,0.98)_0%,rgba(245,242,236,0.92)_100%)] px-6 py-6 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800">
              Secure Access
            </span>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-zinc-950 sm:text-3xl">
                Вход в CRM
              </h2>
              <p className="max-w-md text-sm leading-6 text-zinc-600">
                Аккуратный экран авторизации для команды: без лишнего шума, с
                понятной навигацией и быстрым доступом к рабочей панели.
              </p>
            </div>
          </div>

          <div className="min-w-[180px] rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm shadow-zinc-950/5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Активный режим
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-950">
              {currentView.label}
            </p>
            <p className="mt-1 text-sm leading-5 text-zinc-600">
              {currentView.hint}
            </p>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-6 px-6 py-6 sm:px-7 sm:py-7">
        <input type="hidden" name="returnTo" value={returnTo ?? ""} />
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-700">
              Рабочий контур
            </span>
            <span className="text-xs text-zinc-500">
              Переключает вид и подсказки
            </span>
          </div>
          <div className="grid gap-2 rounded-3xl border border-zinc-200 bg-zinc-50 p-2 sm:grid-cols-3">
            {ACCESS_VIEWS.map((view) => {
              const isActive = selectedView === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setSelectedView(view.id)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "border border-zinc-950 bg-zinc-950 text-white shadow-sm"
                      : "border border-transparent bg-transparent text-zinc-600 hover:border-zinc-200 hover:bg-white hover:text-zinc-950"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="block">{view.label}</span>
                  <span
                    className={`mt-1 block text-xs leading-5 ${
                      isActive ? "text-zinc-300" : "text-zinc-500"
                    }`}
                  >
                    {view.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            name="email"
            type="email"
            placeholder="admin@example.com"
            className={inputClassName}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
        </label>

        <label className="block space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-700">Пароль</span>
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                showPassword
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
              }`}
              aria-pressed={showPassword}
            >
              {showPassword ? "Скрыть" : "Показать"}
            </button>
          </div>

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Введите ваш пароль"
              className={`${inputClassName} pr-24`}
              autoComplete="current-password"
              required
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
              {showPassword ? "Visible" : "Hidden"}
            </span>
          </div>
        </label>

        {state.errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.errorMessage}
          </p>
        ) : null}

        <div className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 px-2 py-1">
              <p className="text-sm font-medium text-zinc-950">
                Доступ будет открыт для роли «{currentView.label}»
              </p>
              <p className="text-xs leading-5 text-zinc-500">
                После входа откроется рабочая панель с нужным контекстом.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 sm:w-auto sm:min-w-[180px]"
            >
              {isPending ? "Входим..." : "Перейти в систему"}
            </button>
          </div>
        </div>
      </form>
    </SurfaceCard>
  );
}
