const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function normalizeAuthReturnTo(value: string, fallback = DEFAULT_AUTH_REDIRECT) {
  const trimmed = value.trim();

  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
}
