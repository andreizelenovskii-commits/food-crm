/** Клиентская нормализация (как на бэкенде) для валидации до отправки. */
export function extractPhoneDigits(input: string): string {
  return input.replace(/\D/g, "");
}

export const extractDigits = extractPhoneDigits;

export function normalizeRuPhoneDigits(raw: string): string {
  const digits = extractPhoneDigits(raw);
  if (digits.startsWith("8")) {
    return `7${digits.slice(1)}`.slice(0, 11);
  }
  if (digits.startsWith("9")) {
    return `7${digits}`.slice(0, 11);
  }
  if (digits.startsWith("7")) {
    return digits.slice(0, 11);
  }
  return digits.slice(0, 10);
}

export function isValidRuMobileDigits(normalized: string): boolean {
  return /^7\d{10}$/.test(normalized);
}

export function isCompleteRuPhone(input: string): boolean {
  return isValidRuMobileDigits(normalizeRuPhoneDigits(input));
}

export function limitRuPhoneInput(raw: string): string {
  const trimmed = raw.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = raw.replace(/\D/g, "").slice(0, 11);

  return hasLeadingPlus ? `+${digits}` : digits;
}

export function formatRuPhoneDisplay(input: string): string {
  const normalized = normalizeRuPhoneDigits(input);
  const localDigits = normalized.startsWith("7")
    ? normalized.slice(1)
    : normalized;
  const area = localDigits.slice(0, 3);
  const prefix = localDigits.slice(3, 6);
  const firstPair = localDigits.slice(6, 8);
  const secondPair = localDigits.slice(8, 10);

  if (!area) {
    return "+7";
  }

  let display = `+7-(${area}`;

  if (area.length === 3 && prefix) {
    display += ")";
  }

  if (prefix) {
    display += `-${prefix}`;
  }

  if (firstPair) {
    display += `-${firstPair}`;
  }

  if (secondPair) {
    display += `-${secondPair}`;
  }

  return display;
}

export function toBackendPhone(input: string): string {
  return normalizeRuPhoneDigits(input);
}

/** Отображение логина 7XXXXXXXXXX как +7 (900) 123-45-67. */
export function formatRuMobileLoginDigits(digits: string): string {
  if (!/^7\d{10}$/.test(digits)) {
    return digits;
  }

  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}
