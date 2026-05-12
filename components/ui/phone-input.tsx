"use client";

import { useState } from "react";
import {
  formatRussianPhoneInput,
  normalizeRussianPhoneForStorage,
  RUSSIAN_PHONE_PLACEHOLDER,
} from "@/shared/lib/phone";

type PhoneInputProps = {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
};

export function PhoneInput({
  name,
  value,
  defaultValue,
  onChange,
  className,
  required,
  disabled,
}: PhoneInputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    formatRussianPhoneInput(defaultValue ?? ""),
  );

  const displayValue = isControlled ? formatRussianPhoneInput(value ?? "") : internalValue;
  const submittedValue = normalizeRussianPhoneForStorage(displayValue);

  return (
    <>
      <input type="hidden" name={name} value={submittedValue} />
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={RUSSIAN_PHONE_PLACEHOLDER}
        value={displayValue}
        required={required}
        disabled={disabled}
        onChange={(event) => {
          const nextDisplayValue = formatRussianPhoneInput(event.target.value);
          const nextSubmittedValue = normalizeRussianPhoneForStorage(nextDisplayValue);

          if (!isControlled) {
            setInternalValue(nextDisplayValue);
          }

          onChange?.(nextSubmittedValue);
        }}
        className={
          className ??
          "foodlike-field"
        }
      />
    </>
  );
}
