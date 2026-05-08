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

function formatAccessDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EmployeeAccessForm({ employee }: { employee: EmployeeProfile }) {
  const initialPhone = defaultLoginPhone(employee);
  const passwordUpdatedLabel = formatAccessDate(employee.passwordUpdatedAt);
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
    <section className="rounded-[22px] border border-white/70 bg-white/76 p-4 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl sm:p-5">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Авторизация</p>
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-zinc-950">Доступ в систему</h2>
        <p className="text-xs leading-5 text-zinc-600">
          Выдай сотруднику номер телефона и пароль для входа. Роль в аккаунте будет совпадать с его ролью в карточке.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[18px] border border-red-950/10 bg-red-50/55 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
            Логин
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-950">
            {initialPhone || "Телефон для входа ещё не задан"}
          </p>
        </div>
        <div className="rounded-[18px] border border-red-950/10 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-800/60">
            Пароль
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-950">
            {passwordUpdatedLabel ? "Пароль изменён" : "Пароль ещё не сохраняли"}
          </p>
          {passwordUpdatedLabel ? (
            <p className="mt-1 text-xs text-zinc-500">{passwordUpdatedLabel}</p>
          ) : null}
        </div>
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
            className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
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
              className="inline-flex h-8 items-center rounded-full border border-red-100 bg-white/90 px-3 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
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
            className="h-11 w-full rounded-[14px] border border-red-950/10 bg-white/90 px-4 text-zinc-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
            required
          />
          <p className="text-xs text-zinc-500">
            Пароль должен быть не короче 12 символов и содержать буквы разного регистра, цифру и спецсимвол.
          </p>
        </div>

        {state.errorMessage ? (
          <p className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.errorMessage}
          </p>
        ) : null}

        {state.successMessage ? (
          <p className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {state.successMessage}
          </p>
        ) : null}

        {copyMessage ? (
          <p className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {copyMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-[14px] bg-red-800 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isPending ? "Сохраняем доступ..." : "Сохранить телефон и пароль"}
          </button>
          <button
            type="button"
            onClick={() => void handleCopyCredentials()}
            className="rounded-[14px] border border-red-100 bg-white/90 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white"
          >
            Копировать данные
          </button>
        </div>
      </form>
    </section>
  );
}
