import { NextRequest, NextResponse } from "next/server";
import { normalizeAuthReturnTo } from "@/modules/auth/auth.redirect";
import { parseLoginInput } from "@/modules/auth/auth.validation";
import { getBackendApiUrl } from "@/shared/api/backend";

type LoginPayload = {
  token?: string;
  expiresAt?: string;
};

function getSetCookieHeaders(headers: Headers) {
  const withGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  const values = withGetSetCookie.getSetCookie?.();

  if (values?.length) {
    return values;
  }

  const singleValue = headers.get("set-cookie");
  return singleValue ? [singleValue] : [];
}

function redirectToLogin(request: NextRequest, errorMessage: string, returnTo: string) {
  const target = new URL("/login", request.url);
  target.searchParams.set("error", errorMessage);

  const safeReturnTo = normalizeAuthReturnTo(returnTo, "");
  if (safeReturnTo) {
    target.searchParams.set("returnTo", safeReturnTo);
  }

  return NextResponse.redirect(target, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  let input: { phone: string; password: string };
  try {
    input = parseLoginInput(formData);
  } catch (error) {
    return redirectToLogin(
      request,
      error instanceof Error ? error.message : "Заполни телефон и пароль",
      returnTo,
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${getBackendApiUrl()}/api/v1/auth/login`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        phone: input.phone,
        email: input.phone,
        password: input.password,
      }),
    });
  } catch {
    return redirectToLogin(
      request,
      "API недоступен. Обнови страницу и попробуй ещё раз.",
      returnTo,
    );
  }

  const payload = await backendResponse.json().catch(() => null) as {
    data?: LoginPayload;
    error?: { message?: string };
  } | null;

  if (!backendResponse.ok) {
    return redirectToLogin(
      request,
      payload?.error?.message ?? "Неверный телефон или пароль",
      returnTo,
    );
  }

  const response = NextResponse.redirect(
    new URL(normalizeAuthReturnTo(returnTo), request.url),
    { status: 303 },
  );
  const setCookieHeaders = getSetCookieHeaders(backendResponse.headers);

  for (const cookie of setCookieHeaders) {
    response.headers.append("set-cookie", cookie);
  }

  if (setCookieHeaders.length === 0 && payload?.data?.token && payload.data.expiresAt) {
    response.cookies.set(
      process.env.BACKEND_SESSION_COOKIE_NAME?.trim() || "food_crm_api_session",
      payload.data.token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(payload.data.expiresAt),
        path: "/",
      },
    );
  }

  return response;
}
