"use client";

import { useActionState } from "react";
import { loginAction } from "@/modules/auth/auth.actions";
import { SurfaceCard } from "@/components/ui/surface-card";

const initialLoginFormState = {
  errorMessage: null,
};

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginFormState,
  );

  return (
    <SurfaceCard className="mx-auto max-w-md">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-950">Вход в CRM</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Введи данные администратора, чтобы открыть рабочую панель.
        </p>
      </div>

      <form action={formAction} className="mt-8 space-y-5">
        <input type="hidden" name="returnTo" value={returnTo ?? ""} />
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            name="email"
            type="email"
            placeholder="admin@example.com"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Пароль</span>
          <input
            name="password"
            type="password"
            placeholder="Введите ваш пароль"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            autoComplete="current-password"
            required
          />
        </label>

        {state.errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          {isPending ? "Входим..." : "Войти"}
        </button>
      </form>
    </SurfaceCard>
  );
}
