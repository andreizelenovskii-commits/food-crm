"use client";

import { useActionState, useState } from "react";
import {
  issueEmployeeAccessAction,
  type EmployeeAccessFormState,
} from "@/modules/employees/employees.actions";
import type { EmployeeProfile } from "@/modules/employees/employees.types";

const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function transliterateNamePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN_MAP[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^\.+|\.+$/g, "");
}

function buildEmployeeLogin(name: string) {
  const [firstName = "", lastName = ""] = name
    .split(/\s+/)
    .map(transliterateNamePart)
    .filter(Boolean);
  const loginBase = [firstName, lastName].filter(Boolean).join(".");

  return `${loginBase || "employee"}@staff.local`;
}

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

export function EmployeeAccessForm({ employee }: { employee: EmployeeProfile }) {
  const generatedLogin = employee.email ?? buildEmployeeLogin(employee.name);
  const initialState: EmployeeAccessFormState = {
    errorMessage: null,
    successMessage: null,
    values: {
      email: generatedLogin,
      password: "",
    },
  };

  const [state, formAction, isPending] = useActionState(
    issueEmployeeAccessAction,
    initialState,
  );
  const [email, setEmail] = useState(initialState.values.email);
  const [password, setPassword] = useState(initialState.values.password);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const handleCopyCredentials = async () => {
    if (!email.trim() || !password.trim()) {
      setCopyMessage("Сначала заполни логин и пароль, чтобы было что копировать.");
      return;
    }

    const payload = [
      `Доступ в CRM для ${employee.name}:`,
      `Логин: ${email.trim()}`,
      `Пароль: ${password.trim()}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setCopyMessage("Логин и пароль скопированы. Можно отправлять сотруднику.");
    } catch {
      setCopyMessage("Не удалось скопировать данные. Попробуй ещё раз.");
    }
  };

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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="alina.rezenova@staff.local"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            required
          />
          <p className="text-xs text-zinc-500">
            Логин создаётся автоматически по имени и фамилии сотрудника, но ты можешь поправить его вручную.
          </p>
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-700">Пароль</span>
            <button
              type="button"
              onClick={() => setPassword(generateStrongPassword())}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
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
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.errorMessage}
          </p>
        ) : null}

        {state.successMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {state.successMessage}
          </p>
        ) : null}

        {copyMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {copyMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {isPending ? "Сохраняем доступ..." : "Сохранить логин и пароль"}
          </button>
          <button
            type="button"
            onClick={() => void handleCopyCredentials()}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            Копировать данные
          </button>
        </div>
      </form>
    </section>
  );
}
