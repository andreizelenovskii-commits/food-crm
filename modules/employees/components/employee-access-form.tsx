"use client";

import { useActionState, useState } from "react";
import {
  issueEmployeeAccessAction,
  type EmployeeAccessFormState,
} from "@/modules/employees/employees.actions";
import type { EmployeeProfile } from "@/modules/employees/employees.types";
import { isValidRuMobileDigits, normalizeRuPhoneDigits } from "@/shared/phone";

function pickRandom(characters: string, randomByte: number) {
  return characters[randomByte % characters.length];
}

function shuffleCharacters(value: string) {
  const items = value.split("");

  for (let index = items.length - 1; index > 0; index -= 1) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const swapIndex = buffer[0] % (index + 1);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items.join("");
}

function generateStrongPassword() {
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const uppercase = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "!@#$%^&*_-+=?";
  const allCharacters = lowercase + uppercase + digits + symbols;
  const randomBytes = new Uint8Array(16);

  crypto.getRandomValues(randomBytes);

  const passwordCharacters = [
    pickRandom(lowercase, randomBytes[0]),
    pickRandom(uppercase, randomBytes[1]),
    pickRandom(digits, randomBytes[2]),
    pickRandom(symbols, randomBytes[3]),
  ];

  for (let index = 4; index < 16; index += 1) {
    passwordCharacters.push(pickRandom(allCharacters, randomBytes[index]));
  }

  return shuffleCharacters(passwordCharacters.join(""));
}

function defaultLoginPhone(employee: EmployeeProfile): string {
  const digits = normalizeRuPhoneDigits(String(employee.phone ?? ""));
  return isValidRuMobileDigits(digits) ? digits : "";
}

export function EmployeeAccessForm({ employee }: { employee: EmployeeProfile }) {
  const initialPhone = defaultLoginPhone(employee);
  const initialState: EmployeeAccessFormState = {
    errorMessage: null,
    successMessage: null,
    values: {
      phone: initialPhone,
      password: "",
    },
  };

  const [state, formAction, isPending] = useActionState(
    issueEmployeeAccessAction,
    initialState,
  );
  const [phone, setPhone] = useState(initialState.values.phone);
  const [password, setPassword] = useState(initialState.values.password);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const handleCopyCredentials = async () => {
    if (!phone.trim() || !password.trim()) {
      setCopyMessage("Сначала заполни телефон и пароль, чтобы было что копировать.");
      return;
    }

    const payload = [
      `Доступ в CRM для ${employee.name}:`,
      `Телефон для входа: ${phone.trim()}`,
      `Пароль: ${password.trim()}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setCopyMessage("Телефон и пароль скопированы. Можно отправить сотруднику.");
    } catch {
      setCopyMessage("Не удалось скопировать данные. Попробуй ещё раз.");
    }
  };

  return (
    <section className="rounded-[14px] border border-zinc-200 bg-white/90 p-4 sm:p-5 shadow-sm shadow-zinc-950/5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-950">Доступ в систему</h2>
        <p className="text-sm leading-6 text-zinc-600">
          Выдай сотруднику номер телефона и пароль для входа. Роль в аккаунте будет совпадать с его ролью в карточке.
        </p>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="employeeId" value={employee.id} />

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Телефон для входа</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+7 900 123-45-67"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
          <p className="text-xs text-zinc-500">
            Если в карточке уже указан мобильный номер, он подставится сюда. Можно заменить на другой номер для входа.
          </p>
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-700">Пароль</span>
            <button
              type="button"
              onClick={() => setPassword(generateStrongPassword())}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 transition hover:border-red-200 hover:bg-red-100"
            >
              Сгенерировать пароль
            </button>
          </div>
          <input
            name="password"
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Сильный пароль для сотрудника"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
          <p className="text-xs text-zinc-500">
            Пароль должен быть не короче 12 символов и содержать буквы разного регистра, цифру и спецсимвол.
          </p>
        </div>

        {state.errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.errorMessage}
          </p>
        ) : null}

        {state.successMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.successMessage}
          </p>
        ) : null}

        {copyMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {copyMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {isPending ? "Сохраняем доступ..." : "Сохранить телефон и пароль"}
          </button>
          <button
            type="button"
            onClick={() => void handleCopyCredentials()}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 transition hover:border-red-200 hover:bg-red-100"
          >
            Копировать данные
          </button>
        </div>
      </form>
    </section>
  );
}
