import { getOptionalEnv } from "@/shared/config/env";

const DEFAULT_PHONE = "79147595629";
const DEFAULT_PHONE_LABEL = "+7 914 759-56-29";
const DEFAULT_TELEGRAM_URL = "https://t.me/foodlike65news";
const DEFAULT_MAX_URL = "https://max.ru/join/Z3Npmvo1J6hx51xfUG9PxgClovvcg_fjOW-oIYvdeBw";
const DEFAULT_WHATSAPP_URL = "https://chat.whatsapp.com/GdlIVRQC6LBITbE6x3k4so?mode=gi_t";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

const phone = getOptionalEnv("NEXT_PUBLIC_FOODLIKE_PHONE") ?? DEFAULT_PHONE;

export const PUBLIC_SITE_CONTACTS = {
  phoneLabel: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_PHONE_LABEL") ?? DEFAULT_PHONE_LABEL,
  phoneHref: `tel:+${digitsOnly(phone)}`,
  address: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_ADDRESS"),
  telegramUrl: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_TELEGRAM_URL") ?? DEFAULT_TELEGRAM_URL,
  maxUrl: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_MAX_URL") ?? DEFAULT_MAX_URL,
  whatsappUrl: getOptionalEnv("NEXT_PUBLIC_FOODLIKE_WHATSAPP_URL") ?? DEFAULT_WHATSAPP_URL,
};
