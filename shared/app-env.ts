export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV?.trim() || "";
export const IS_LOCAL_APP_ENV = APP_ENV === "local";
