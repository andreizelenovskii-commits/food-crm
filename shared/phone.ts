/** Клиентская нормализация (как на бэкенде) для валидации до отправки. */
export function normalizeRuPhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) {
    return `7${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("9")) {
    return `7${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("7")) {
    return digits;
  }
  return digits;
}

export function isValidRuMobileDigits(normalized: string): boolean {
  return /^7\d{10}$/.test(normalized);
}

/** Отображение логина 7XXXXXXXXXX как +7 (900) 123-45-67. */
export function formatRuMobileLoginDigits(digits: string): string {
  if (!/^7\d{10}$/.test(digits)) {
    return digits;
  }

  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}
