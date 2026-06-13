export const MAINTENANCE_MODE_STORAGE_KEY = "foodlike:public-maintenance-mode";
export const MAINTENANCE_MESSAGE_STORAGE_KEY = "foodlike:public-maintenance-message";
export const MAINTENANCE_MODE_COOKIE_NAME = "foodlike_public_maintenance_mode";
export const MAINTENANCE_MESSAGE_COOKIE_NAME = "foodlike_public_maintenance_message";

export type MaintenanceModeSnapshot = {
  enabled: boolean;
  message: string | null;
};

function getSharedCookieDomain(hostname: string) {
  if (hostname === "crmandromeda.ru" || hostname.endsWith(".crmandromeda.ru")) {
    return ".crmandromeda.ru";
  }

  return "";
}

function getCookieValue(name: string) {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function setCookie(name: string, value: string) {
  const domain = getSharedCookieDomain(window.location.hostname);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domainPart = domain ? `; Domain=${domain}` : "";

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${domainPart}${secure}`;
}

export function readMaintenanceModeSnapshot(): MaintenanceModeSnapshot {
  const cookieMode = getCookieValue(MAINTENANCE_MODE_COOKIE_NAME);
  const cookieMessage = getCookieValue(MAINTENANCE_MESSAGE_COOKIE_NAME);
  const storageMode = window.localStorage.getItem(MAINTENANCE_MODE_STORAGE_KEY);
  const storageMessage = window.localStorage.getItem(MAINTENANCE_MESSAGE_STORAGE_KEY);

  return {
    enabled: (cookieMode ?? storageMode) === "enabled",
    message: cookieMessage || storageMessage,
  };
}

export function persistMaintenanceModeSnapshot(snapshot: MaintenanceModeSnapshot) {
  const mode = snapshot.enabled ? "enabled" : "disabled";
  const message = snapshot.message ?? "";

  window.localStorage.setItem(MAINTENANCE_MODE_STORAGE_KEY, mode);
  window.localStorage.setItem(MAINTENANCE_MESSAGE_STORAGE_KEY, message);
  setCookie(MAINTENANCE_MODE_COOKIE_NAME, mode);
  setCookie(MAINTENANCE_MESSAGE_COOKIE_NAME, message);
}
