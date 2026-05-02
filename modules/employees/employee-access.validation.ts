import { ValidationError } from "@/shared/errors/app-error";
import { meetsStrongPasswordRules, STRONG_PASSWORD_HINT_RU } from "@/shared/password-policy";
import { isValidRuMobileDigits, normalizeRuPhoneDigits } from "@/shared/phone";

function normalizeInput(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export type IssueEmployeeAccessInput = {
  phone: string;
  password: string;
};

export function parseIssueEmployeeAccessInput(
  formData: FormData,
): IssueEmployeeAccessInput {
  const phoneRaw =
    normalizeInput(formData.get("phone")) || normalizeInput(formData.get("email"));
  const password = normalizeInput(formData.get("password"));

  if (!phoneRaw || !password) {
    throw new ValidationError("Заполните номер телефона и пароль для сотрудника");
  }

  const phone = normalizeRuPhoneDigits(phoneRaw);

  if (!isValidRuMobileDigits(phone)) {
    throw new ValidationError("Введи номер телефона в формате +7 и ещё 10 цифр");
  }

  if (!meetsStrongPasswordRules(password)) {
    throw new ValidationError(STRONG_PASSWORD_HINT_RU);
  }

  return {
    phone,
    password,
  };
}
