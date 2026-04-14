const envCache = new Map<string, string>();

export function getRequiredEnv(name: string): string {
  const cachedValue = envCache.get(name);

  if (cachedValue) {
    return cachedValue;
  }

  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  envCache.set(name, value);

  return value;
}
