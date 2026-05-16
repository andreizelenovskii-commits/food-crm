import { getOptionalEnv } from "@/shared/config/env";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export const PUBLIC_SITE_CONTACTS = {
  phoneLabel: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_PHONE_LABEL"),
  phoneHref: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_PHONE")
    ? `tel:+${digitsOnly(getOptionalEnv("NEXT_PUBLIC_FOODLIKE_PHONE") ?? "")}`
    : null,
  address: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_ADDRESS"),
  telegramUrl: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_TELEGRAM_URL"),
  whatsappUrl: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_WHATSAPP_URL"),
};
