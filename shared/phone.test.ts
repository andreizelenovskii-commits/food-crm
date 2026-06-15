import { describe, expect, it } from "vitest";
import { limitRuPhoneInput } from "@/shared/phone";

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
