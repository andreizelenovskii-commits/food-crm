"use client";

import { useActionState, useId, useState } from "react";
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
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const confirmNewPasswordId = useId();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const inputClassName = "foodlike-field";

  return (
    <section className="foodlike-panel p-4">
      <p className="foodlike-kicker">
        Безопасность
      </p>
      <h2 className="mt-2 foodlike-title-sm">Смена пароля</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        Укажи текущий пароль и новый. После сохранения вход по старому паролю перестанет работать.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <div className="block space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={currentPasswordId} className="text-sm font-medium text-zinc-700">
              Текущий пароль
            </label>
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="foodlike-button-secondary min-h-8 px-3 text-xs"
            >
              {showCurrent ? "Скрыть" : "Показать"}
            </button>
          </div>
          <input
            id={currentPasswordId}
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            className={inputClassName}
            required
          />
        </div>

        <div className="block space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={newPasswordId} className="text-sm font-medium text-zinc-700">
              Новый пароль
            </label>
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="foodlike-button-secondary min-h-8 px-3 text-xs"
            >
              {showNew ? "Скрыть" : "Показать"}
            </button>
          </div>
          <input
            id={newPasswordId}
            name="newPassword"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            className={inputClassName}
            required
          />
        </div>

        <div className="block space-y-2">
          <label htmlFor={confirmNewPasswordId} className="text-sm font-medium text-zinc-700">
            Повтори новый пароль
          </label>
          <input
            id={confirmNewPasswordId}
            name="confirmNewPassword"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            className={inputClassName}
            required
          />
        </div>

        {state.errorMessage ? (
          <p className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.errorMessage}
          </p>
        ) : null}

        {state.successMessage ? (
          <p className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="foodlike-button-primary w-full"
        >
          {isPending ? "Сохраняем..." : "Обновить пароль"}
        </button>
      </form>
    </section>
  );
}
