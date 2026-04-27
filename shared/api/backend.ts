import { cookies } from "next/headers";

const DEFAULT_BACKEND_API_URL = "http://127.0.0.1:4000";

export function getBackendApiUrl() {
  return (
    process.env.BACKEND_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    DEFAULT_BACKEND_API_URL
  ).replace(/\/$/, "");
}

function buildUrl(path: string) {
  return `${getBackendApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function getBackendUnavailableMessage(path: string) {
  return [
    `Backend API is unavailable at ${buildUrl(path)}.`,
    "Start it locally with `cd backend && npm run start` or set BACKEND_API_URL/NEXT_PUBLIC_BACKEND_API_URL.",
  ].join(" ");
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

export async function backendGet<T>(path: string) {
  try {
    return parseResponse<T>(await fetch(buildUrl(path), {
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
    response = await fetch(buildUrl(path), {
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

export async function backendJson<T>(
  path: string,
  init: {
    method?: "POST" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
) {
  try {
    return parseResponse<T>(await fetch(buildUrl(path), {
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
