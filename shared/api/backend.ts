import { cookies } from "next/headers";

const DEFAULT_BACKEND_API_URL = "http://127.0.0.1:4000";

export function getBackendApiUrl() {
  return (
    process.env.BACKEND_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    DEFAULT_BACKEND_API_URL
  ).replace(/\/$/, "");
}

function getBackendApiUrls() {
  const primaryUrl = getBackendApiUrl();
  const fallbackUrl = (
    process.env.BACKEND_INTERNAL_API_URL?.trim() ||
    (process.env.NODE_ENV === "production" ? DEFAULT_BACKEND_API_URL : "")
  ).replace(/\/$/, "");

  return Array.from(new Set([primaryUrl, fallbackUrl].filter(Boolean)));
}

function buildUrl(path: string, apiUrl = getBackendApiUrl()) {
  return `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function getBackendUnavailableMessage(path: string) {
  const apiUrls = getBackendApiUrls();
  const isLocalBackend = apiUrls.every((apiUrl) => apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1"));
  const targets = apiUrls.map((apiUrl) => buildUrl(path, apiUrl)).join(", ");

  if (isLocalBackend) {
    return [
      `Backend API is unavailable at ${targets}.`,
      "Start it locally with `cd backend && npm run start` or set BACKEND_API_URL/NEXT_PUBLIC_BACKEND_API_URL.",
    ].join(" ");
  }

  return [
    `Backend API недоступен: ${targets}.`,
    "Проверьте, что backend запущен на сервере, домен API открыт и переменные окружения указывают на правильный адрес.",
  ].join(" ");
}

async function fetchBackend(path: string, init: RequestInit) {
  let networkError: TypeError | null = null;

  for (const apiUrl of getBackendApiUrls()) {
    try {
      return await fetch(buildUrl(path, apiUrl), init);
    } catch (error) {
      if (error instanceof TypeError) {
        networkError = error;
        continue;
      }

      throw error;
    }
  }

  throw networkError ?? new TypeError("Backend API unavailable");
}

async function getCookieHeader() {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
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

async function parseErrorMessage(response: Response) {
  const payload = await response.json().catch(() => null) as {
    error?: { message?: string };
  } | null;

  return payload?.error?.message ?? `Backend request failed: ${response.status}`;
}

export async function backendGet<T>(path: string) {
  try {
    return parseResponse<T>(await fetchBackend(path, {
      cache: "no-store",
      headers: {
        cookie: await getCookieHeader(),
      },
    }));
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(getBackendUnavailableMessage(path), { cause: error });
    }

    throw error;
  }
}

export async function backendGetOptional<T>(path: string) {
  let response: Response;

  try {
    response = await fetchBackend(path, {
      cache: "no-store",
      headers: {
        cookie: await getCookieHeader(),
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      return null;
    }

    throw error;
  }

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  return parseResponse<T>(response);
}

export async function backendGetResult<T>(path: string): Promise<
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }
> {
  let response: Response;

  try {
    response = await fetchBackend(path, {
      cache: "no-store",
      headers: {
        cookie: await getCookieHeader(),
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      return {
        ok: false,
        status: 503,
        message: getBackendUnavailableMessage(path),
      };
    }

    throw error;
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: await parseErrorMessage(response),
    };
  }

  return {
    ok: true,
    data: await parseResponse<T>(response),
  };
}

export async function backendJson<T>(
  path: string,
  init: {
    method?: "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
) {
  try {
    return parseResponse<T>(await fetchBackend(path, {
      method: init.method ?? "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        cookie: await getCookieHeader(),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    }));
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(getBackendUnavailableMessage(path), { cause: error });
    }

    throw error;
  }
}
