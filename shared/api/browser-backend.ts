const DEFAULT_BACKEND_PORT = "4000";
const FORM_DATA_TIMEOUT_MS = 30_000;

export function getBrowserBackendApiUrl() {
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim()) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL.trim().replace(/\/$/, "");
  }

  const { protocol, hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:${DEFAULT_BACKEND_PORT}`;
  }

  return "";
}

function getBackendUnavailableMessage(path: string) {
  const apiUrl = getBrowserBackendApiUrl();
  const target = apiUrl
    ? `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`
    : path.startsWith("/")
      ? path
      : `/${path}`;

  return [
    `Backend API is unavailable at ${target}.`,
    "Start it locally with `cd backend && npm run start`.",
  ].join(" ");
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as {
    data?: T;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `Backend request failed: ${response.status}`);
  }

  return payload?.data as T;
}

export async function browserBackendJson<T>(
  path: string,
  init: {
    method?: "POST" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
) {
  const apiUrl = getBrowserBackendApiUrl();
  const url = `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const hasBody = init.body !== undefined;

  try {
    return parseResponse<T>(await fetch(url, {
      method: init.method ?? "POST",
      credentials: "include",
      headers: hasBody ? { "content-type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(init.body) : undefined,
    }));
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(getBackendUnavailableMessage(path), { cause: error });
    }

    throw error;
  }
}

export async function browserBackendFormData<T>(path: string, formData: FormData) {
  const apiUrl = getBrowserBackendApiUrl();
  const url = `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FORM_DATA_TIMEOUT_MS);

  try {
    return parseResponse<T>(await fetch(url, {
      method: "POST",
      credentials: "include",
      body: formData,
      signal: controller.signal,
    }));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Сервер не ответил на загрузку фото за 30 секунд. Попробуй выбрать файл ещё раз.", {
        cause: error,
      });
    }

    if (error instanceof TypeError) {
      throw new Error(getBackendUnavailableMessage(path), { cause: error });
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
