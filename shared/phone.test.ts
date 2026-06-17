import { describe, expect, it } from "vitest";
import {
  extractDigits,
  formatRuPhoneDisplay,
  isCompleteRuPhone,
  isValidRuMobileDigits,
  limitRuPhoneInput,
  normalizeRuPhoneDigits,
  toBackendPhone,
} from "@/shared/phone";

describe("limitRuPhoneInput", () => {
  it("keeps up to 11 digits without plus", () => {
    expect(limitRuPhoneInput("7924186874112345")).toBe("79241868741");
  });

  it("keeps a leading plus and up to 11 digits", () => {
    expect(limitRuPhoneInput("+7924186874112345")).toBe("+79241868741");
  });

  it("removes formatting characters from pasted phone numbers", () => {
    expect(limitRuPhoneInput("+7 (924) 186-87-41")).toBe("+79241868741");
  });

  it("ignores plus signs that are not at the beginning", () => {
    expect(limitRuPhoneInput("7+924+186+87+41")).toBe("79241868741");
  });
});

describe("CRM login phone formatting", () => {
  const cases = [
    "89241868741",
    "79241868741",
    "+79241868741",
    "+7 924 186 87 41",
    "+7-(924)-186-87-41",
    "8 (924) 186-87-41",
    "9241868741",
  ];

  it.each(cases)("formats %s as a full masked phone", (value) => {
    expect(formatRuPhoneDisplay(value)).toBe("+7-(924)-186-87-41");
    expect(toBackendPhone(value)).toBe("79241868741");
    expect(isCompleteRuPhone(value)).toBe(true);
  });

  it("keeps incomplete input visible but invalid for submit", () => {
    expect(formatRuPhoneDisplay("123")).toBe("+7-(123");
    expect(isValidRuMobileDigits(toBackendPhone("123"))).toBe(false);
    expect(isCompleteRuPhone("123")).toBe(false);
  });

  it("extracts digits and normalizes Russian mobile prefixes for backend submit", () => {
    expect(extractDigits("+7-(924)-186-87-41")).toBe("79241868741");
    expect(normalizeRuPhoneDigits("8 (924) 186-87-41")).toBe("79241868741");
    expect(normalizeRuPhoneDigits("9241868741")).toBe("79241868741");
  });
});
