"use client";

import { useActionState, useState } from "react";
import {
  changePasswordAction,
  type ChangePasswordFormState,
} from "@/modules/auth/auth.actions";

const initialState: ChangePasswordFormState = {
  errorMessage: null,
  successMessage: null,
};

export function ChangePasswordCard() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const inputClassName =
    "w-full rounded-[12px] border border-red-950/15 bg-white/90 px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-red-800/10";

  return (
    <section className="rounded-[16px] border border-red-950/10 bg-white/90 p-4 shadow-sm shadow-red-950/5">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-800/75">
        Безопасность
      </p>
      <h2 className="mt-2 text-lg font-semibold text-zinc-950">Смена пароля</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        Укажи текущий пароль и новый. После сохранения вход по старому паролю перестанет работать.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <label className="block space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-zinc-700">Текущий пароль</span>
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-800 transition hover:bg-red-50"
            >
              {showCurrent ? "Скрыть" : "Показать"}
            </button>
          </div>
          <input
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            className={inputClassName}
            required
          />
        </label>

        <label className="block space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-zinc-700">Новый пароль</span>
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-800 transition hover:bg-red-50"
            >
              {showNew ? "Скрыть" : "Показать"}
            </button>
          </div>
          <input
            name="newPassword"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            className={inputClassName}
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Повтори новый пароль</span>
          <input
            name="confirmNewPassword"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            className={inputClassName}
            required
          />
        </label>

        {state.errorMessage ? (
          <p className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.errorMessage}
          </p>
        ) : null}

        {state.successMessage ? (
          <p className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[14px] bg-red-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          {isPending ? "Сохраняем..." : "Обновить пароль"}
        </button>
      </form>
    </section>
  );
}
