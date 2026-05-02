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
    icon: "manager",
  },
  {
    id: "cook",
    label: "Повар",
    icon: "chef",
  },
  {
    id: "courier",
    label: "Курьер",
    icon: "courier",
  },
  {
    id: "dispatch",
    label: "Диспетчер",
    icon: "dispatch",
  },
] as const;

type RoleIconName = (typeof ACCESS_VIEWS)[number]["icon"];

function RoleIcon({
  name,
  className,
}: {
  name: RoleIconName;
  className?: string;
}) {
  const sharedProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  if (name === "manager") {
    return (
      <svg {...sharedProps}>
        <path d="M8.5 8.2a3.5 3.5 0 0 1 7 0v1.2a3.5 3.5 0 0 1-7 0V8.2Z" />
        <path d="M6.2 21v-1.4A4.6 4.6 0 0 1 10.8 15h2.4a4.6 4.6 0 0 1 4.6 4.6V21" />
        <path d="m10.2 15.2 1.8 2.2 1.8-2.2" />
        <path d="m11 18.8 1-1.4 1 1.4" />
        <path d="M9.2 5.7h5.6" />
      </svg>
    );
  }

  if (name === "chef") {
    return (
      <svg {...sharedProps}>
        <path d="M7.2 10.8a3.2 3.2 0 1 1 3.3-5.1A3.4 3.4 0 0 1 17 7.2a3 3 0 0 1-.3 5.9" />
        <path d="M7.2 11.2h9.6v6.6a2.2 2.2 0 0 1-2.2 2.2H9.4a2.2 2.2 0 0 1-2.2-2.2v-6.6Z" />
        <path d="M9.7 15.2h4.6" />
        <path d="M10 18h4" />
      </svg>
    );
  }

  if (name === "courier") {
    return (
      <svg {...sharedProps}>
        <path d="M4 15.5V7.8A1.8 1.8 0 0 1 5.8 6h8.4A1.8 1.8 0 0 1 16 7.8v7.7" />
        <path d="M16 10h2.4l1.6 2.6v2.9" />
        <path d="M6.5 18.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
        <path d="M17.5 18.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
        <path d="M8.2 16h7.6" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path d="M6.8 12.5v-1.8a5.2 5.2 0 0 1 10.4 0v1.8" />
      <path d="M6.8 12.2H5.7a1.7 1.7 0 0 0-1.7 1.7v1.2a1.7 1.7 0 0 0 1.7 1.7h1.1v-4.6Z" />
      <path d="M17.2 12.2h1.1a1.7 1.7 0 0 1 1.7 1.7v1.2a1.7 1.7 0 0 1-1.7 1.7h-1.1v-4.6Z" />
      <path d="M17.2 16.8v.4a2.3 2.3 0 0 1-2.3 2.3h-2" />
      <path d="M10.7 19.5h2.2" />
      <path d="M10 10.4h4" />
    </svg>
  );
}

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginFormState,
  );
  const [selectedView, setSelectedView] =
    useState<(typeof ACCESS_VIEWS)[number]["id"]>("admin");
  const [showPassword, setShowPassword] = useState(false);

  const inputClassName =
    "w-full rounded-[8px] border border-red-950/15 bg-white/90 px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-red-800/10";

  return (
    <SurfaceCard className="mx-auto max-w-xl overflow-hidden border-red-950/10 bg-white/95 p-0 shadow-xl shadow-red-950/10">
      <div className="border-b border-red-950/10 bg-[linear-gradient(135deg,#ffffff_0%,#fff3f3_100%)] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-[8px] border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-800">
              FoodLike Access
            </span>
            <h2 className="text-2xl font-semibold text-zinc-950 sm:text-2xl">
              Вход в CRM
            </h2>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-5 px-5 py-5" noValidate>
        <input type="hidden" name="returnTo" value={returnTo ?? ""} />
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-700">
              Должность
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ACCESS_VIEWS.map((view) => {
              const isActive = selectedView === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setSelectedView(view.id)}
                  className={`group flex min-h-20 min-w-0 items-center gap-3 rounded-[14px] border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-red-800 bg-red-800 text-white shadow-lg shadow-red-950/18"
                      : "border-red-950/10 bg-white text-zinc-700 shadow-sm shadow-red-950/5 hover:border-red-200 hover:bg-red-50/70 hover:text-red-800"
                  }`}
                  aria-pressed={isActive}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] transition ${
                      isActive
                        ? "bg-white/14 text-white"
                        : "bg-red-50 text-red-800 group-hover:bg-white"
                    }`}
                  >
                    <RoleIcon name={view.icon} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 text-base font-semibold leading-5">
                    {view.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Телефон для входа</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="Номер из доступа (не демо)"
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
                  ? "border-red-800 bg-red-800 text-white"
                  : "border-red-200 bg-white text-red-800 hover:border-red-200 hover:text-red-900"
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
          </div>
        </label>

        {state.errorMessage ? (
          <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[14px] bg-red-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          {isPending ? "Входим..." : "Перейти в систему"}
        </button>
      </form>
    </SurfaceCard>
  );
}
