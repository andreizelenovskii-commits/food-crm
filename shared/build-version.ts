export const BUILD_VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION?.trim() || "development";
export const BUILD_VERSION_SHORT = BUILD_VERSION.slice(0, 12);
