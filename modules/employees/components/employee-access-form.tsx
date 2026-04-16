"use client";

import { useActionState } from "react";
import {
  issueEmployeeAccessAction,
  type EmployeeAccessFormState,
} from "@/modules/employees/employees.actions";
import type { EmployeeProfile } from "@/modules/employees/employees.types";

export function EmployeeAccessForm({ employee }: { employee: EmployeeProfile }) {
  const initialState: EmployeeAccessFormState = {
    errorMessage: null,
    successMessage: null,
    values: {
      email: employee.email ?? "",
      password: "",
    },
  };

  const [state, formAction, isPending] = useActionState(
    issueEmployeeAccessAction,
    initialState,
  );

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-950/5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">Доступ в систему</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Выдай сотруднику логин и пароль для входа. Роль в аккаунте будет совпадать с его ролью в карточке.
        </p>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="employeeId" value={employee.id} />

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Логин</span>
          <input
            name="email"
            type="email"
            defaultValue={state.values.email}
            placeholder="alina@company.local"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Пароль</span>
          <input
            name="password"
            type="text"
            defaultValue={state.values.password}
            placeholder="Сильный пароль для сотрудника"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
          <p className="text-xs text-zinc-500">
            Пароль должен быть не короче 12 символов и содержать буквы разного регистра, цифру и спецсимвол.
          </p>
        </label>

        {state.errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.errorMessage}
          </p>
        ) : null}

        {state.successMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {state.successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          {isPending ? "Выдаём доступ..." : employee.email ? "Обновить логин и пароль" : "Выдать логин и пароль"}
        </button>
      </form>
    </section>
  );
}
