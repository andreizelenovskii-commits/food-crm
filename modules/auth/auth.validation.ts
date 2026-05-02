import { ValidationError } from "@/shared/errors/app-error";
import type { LoginInput } from "@/modules/auth/auth.types";
import { isValidRuMobileDigits, normalizeRuPhoneDigits } from "@/shared/phone";

function normalizeInput(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export function parseLoginInput(formData: FormData): LoginInput {
  const phoneRaw =
    normalizeInput(formData.get("phone")) || normalizeInput(formData.get("email"));
  const password = normalizeInput(formData.get("password"));

  if (!phoneRaw || !password) {
    throw new ValidationError("Заполни телефон и пароль");
  }

  const phone = normalizeRuPhoneDigits(phoneRaw);

  if (!isValidRuMobileDigits(phone)) {
    throw new ValidationError("Введи номер телефона в формате +7 и ещё 10 цифр");
  }

  return { phone, password };
}
