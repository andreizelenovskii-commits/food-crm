const DEFAULT_BACKEND_PORT = "4000";

export function getBrowserBackendApiUrl() {
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim()) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL.trim().replace(/\/$/, "");
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${DEFAULT_BACKEND_PORT}`;
}

function getBackendUnavailableMessage(path: string) {
  return [
    `Backend API is unavailable at ${getBrowserBackendApiUrl()}${path.startsWith("/") ? path : `/${path}`}.`,
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
  const url = `${getBrowserBackendApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    return parseResponse<T>(await fetch(url, {
      method: init.method ?? "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
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
